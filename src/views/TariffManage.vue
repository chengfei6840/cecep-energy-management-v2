<template>
  <div class="space-y-6 font-sans">
    
    <!-- 子页面选项卡 -->
    <div class="bg-white p-2 rounded-xl border border-slate-150 shadow-sm flex flex-wrap gap-2">
      <button
        v-for="tab in subTabs"
        :key="tab.value"
        @click="activeSubTab = tab.value"
        class="px-4 py-2 text-xs rounded-lg font-bold transition cursor-pointer"
        :class="activeSubTab === tab.value ? 'bg-[#005BAC] text-white shadow-sm shadow-[#005BAC]/25' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- TAB 1: 电价方案管理 -->
    <div v-if="activeSubTab === 'plan'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <Scale :size="16" class="text-emerald-600" />
          厂矿及微网总并网结算电价方案库
        </h2>
        <a-button type="primary" class="!bg-emerald-600 hover:!bg-emerald-500 !border-none text-xs font-bold" @click="openSchemeModal(null)">
          + 新增电价方案
        </a-button>
      </div>

      <a-table :data-source="globalStore.tariffs" :columns="planColumns" size="middle" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '执行中' ? 'success' : 'default'">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'prices'">
            <div class="flex flex-wrap gap-1.5 text-[10px]">
              <span class="px-1.5 py-0.5 bg-red-50 text-red-600 rounded font-semibold font-mono">尖: {{ record.prices?.sharp }}</span>
              <span class="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded font-semibold font-mono">峰: {{ record.prices?.peak }}</span>
              <span class="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-semibold font-mono">平: {{ record.prices?.flat }}</span>
              <span class="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-semibold font-mono">谷: {{ record.prices?.valley }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex items-center gap-3">
              <a-button size="small" type="link" class="!text-xs !p-0 text-[#005BAC]" @click="openSchemeModal(record)">
                编辑底价
              </a-button>
              <a-button size="small" type="link" class="!text-xs !p-0 text-emerald-600" @click="editTOUForScheme(record)">
                调整24h时段
              </a-button>
              <a-button size="small" type="link" class="!text-xs !p-0 text-amber-500" @click="deactivatePlan(record)">
                {{ record.status === '已停用' ? '恢复入网' : '暂停该方案' }}
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- TAB 2: 分时电价时段配置 (高保真主推交互) -->
    <div v-if="activeSubTab === 'tou'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-6">
      
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
            <Clock :size="16" class="text-[#005BAC]" />
            工业级 24小时 尖峰平谷时段可视化配置板
          </h2>
          <p class="text-[11px] text-slate-400 mt-1">
            当前方案：<span class="text-emerald-600 font-bold">{{ selectedScheme.name }}</span>
          </p>
        </div>
        
        <!-- 切换当前方案 -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">切换电价方案：</span>
          <a-select v-model:value="selectedSchemeId" @change="onSchemeChange" style="width: 280px">
            <a-select-option v-for="t in globalStore.tariffs" :key="t.id" :value="t.id">
              {{ t.name }}
            </a-select-option>
          </a-select>
        </div>
      </div>

      <!-- 24小时可视化时间轴 -->
      <div class="space-y-3">
        <div class="text-xs font-bold text-slate-500 flex justify-between">
          <span>00:00 凌晨</span>
          <span>06:00 清晨</span>
          <span>12:00 中午</span>
          <span>18:00 黄昏</span>
          <span>24:00 深夜</span>
        </div>
        
        <!-- 24块彩格子时间条 -->
        <div class="h-10 w-full rounded-xl border border-slate-200 overflow-hidden flex shadow-inner">
          <div
            v-for="(seg, idx) in sortedSegments"
            :key="idx"
            :style="{ width: calcPercentWidth(seg.start, seg.end) }"
            class="h-full flex flex-col items-center justify-center text-white text-xs font-black relative group transition-all duration-300 pointer-events-none"
            :class="getSegmentBg(seg.type)"
          >
            <!-- 区块简标 -->
            <span>{{ seg.type }}</span>
            <span class="text-[9px] font-medium opacity-80">{{ seg.start }}-{{ seg.end }}</span>
            
            <!-- 悬浮提示 -->
            <div class="absolute -top-12 bg-slate-900 text-white rounded p-2 text-[10px] hidden group-hover:block z-10 w-28 text-center leading-normal">
              时段: {{ seg.start }} ~ {{ seg.end }}<br />
              类别: {{ seg.type }}电价<br />
              单价: ¥ {{ getSchemePrice(seg.type) }} /kWh
            </div>
          </div>
        </div>

        <!-- 颜色图例说明 -->
        <div class="flex justify-center flex-wrap gap-4 pt-1">
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <span class="h-3 w-3 rounded bg-red-500"></span> <span>尖峰时段 (¥ {{ selectedScheme.prices.sharp }} )</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <span class="h-3 w-3 rounded bg-orange-500"></span> <span>高峰时段 (¥ {{ selectedScheme.prices.peak }} )</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <span class="h-3 w-3 rounded bg-blue-500"></span> <span>平段时段 (¥ {{ selectedScheme.prices.flat }} )</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <span class="h-3 w-3 rounded bg-emerald-500"></span> <span>谷段时段 (¥ {{ selectedScheme.prices.valley }} )</span>
          </div>
          <div v-if="selectedScheme.prices.deepValley" class="flex items-center gap-1.5 text-xs text-slate-500">
            <span class="h-3 w-3 rounded bg-teal-500"></span> <span>深谷时段 (¥ {{ selectedScheme.prices.deepValley }} )</span>
          </div>
        </div>
      </div>

      <!-- 时段配置CRUD表 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <!-- 新增/编辑时段表单 -->
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-4">
          <h3 class="text-xs font-bold text-slate-800 pb-2 border-b border-slate-200 flex items-center gap-1 m-0">
            <PlusCircle :size="14" class="text-emerald-600" />
            新增 / 调整时段规则
          </h3>
          <a-form layout="vertical" class="space-y-3">
            <div class="grid grid-cols-2 gap-2">
              <a-form-item label="起始小时" class="custom-tou-label">
                <a-select v-model:value="segmentForm.start">
                  <a-select-option v-for="h in hourOptions" :key="h" :value="h">{{ h }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="结束小时" class="custom-tou-label">
                <a-select v-model:value="segmentForm.end">
                  <a-select-option v-for="h in hourOptions" :key="h" :value="h">{{ h }}</a-select-option>
                </a-select>
              </a-form-item>
            </div>
            
            <a-form-item label="时段性质" class="custom-tou-label">
              <a-select v-model:value="segmentForm.type">
                <a-select-option value="尖">尖 (红 / 负荷极高)</a-select-option>
                <a-select-option value="峰">峰 (橙 / 日常高峰)</a-select-option>
                <a-select-option value="平">平 (蓝 / 常规负位)</a-select-option>
                <a-select-option value="谷">谷 (绿 / 夜间波谷)</a-select-option>
                <a-select-option value="深谷" v-if="selectedScheme.prices.deepValley">深谷 (青 / 弃风弃光过剩)</a-select-option>
              </a-select>
            </a-form-item>

            <a-button type="primary" block class="!bg-emerald-600 !border-none font-bold text-xs !h-9" @click="saveSegment">
              保存并重新校核时间线
            </a-button>
          </a-form>
        </div>

        <!-- 当前时段列表清单 -->
        <div class="col-span-2 space-y-3">
          <h3 class="text-xs font-bold text-slate-700 m-0">当前已生效的时段明细:</h3>
          <a-table :data-source="selectedScheme.segments" :columns="segmentColumns" size="small" :pagination="false">
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'type'">
                <span class="px-1.5 py-0.5 rounded font-bold text-[10px]" :class="getSegmentBadgeStyle(record.type)">
                  {{ record.type }}段
                </span>
              </template>
              <template v-else-if="column.key === 'price'">
                <span class="font-mono font-bold text-[#005BAC]">¥ {{ getSchemePrice(record.type) }}</span>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button size="small" type="link" class="!text-xs !p-0 text-red-500" @click="deleteSegment(index)">
                  删除
                </a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>

    </div>

    <!-- TAB 3: 并网购费/上网结算价格 -->
    <div v-if="activeSubTab === 'tariff'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- 购电底价卡 -->
      <div class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
        <h3 class="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5 m-0 mb-3">
          <TrendingUp :size="15" class="text-[#005BAC]" /> Grid Tariff 并网向电网购电底价
        </h3>
        <p class="text-xs text-slate-400">上海市与北京市关于大工业、特高压并网的现货合同输配购电费构成，本一期由高压关口表自动匹配：</p>
        
        <div class="space-y-2">
          <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
            <span class="text-xs font-bold text-slate-600">尖峰段基本输配价 (Sharp Price)</span>
            <span class="text-sm font-bold text-red-600 font-mono">¥ {{ selectedScheme.prices.sharp }} /kWh</span>
          </div>
          <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
            <span class="text-xs font-bold text-slate-600">高峰段基本输配价 (Peak Price)</span>
            <span class="text-sm font-bold text-orange-500 font-mono">¥ {{ selectedScheme.prices.peak }} /kWh</span>
          </div>
          <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
            <span class="text-xs font-bold text-slate-600">平段基本输配价 (Flat Price)</span>
            <span class="text-sm font-bold text-blue-500 font-mono">¥ {{ selectedScheme.prices.flat }} /kWh</span>
          </div>
          <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
            <span class="text-xs font-bold text-slate-600">谷段基本输配价 (Valley Price)</span>
            <span class="text-sm font-bold text-emerald-600 font-mono">¥ {{ selectedScheme.prices.valley }} /kWh</span>
          </div>
        </div>
      </div>

      <!-- 光伏余电上网结算卡 -->
      <div class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
        <h3 class="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5 m-0 mb-3">
          <Sun :size="15" class="text-emerald-600" /> PV Feed-in Tariff 光伏剩余绿电上网代结算方案
        </h3>
        <p class="text-xs text-slate-400">站内富余的光伏绿能不充饱电池时，直接反送回国家电网，并享受如下返代上网电价补贴：</p>
        
        <div class="space-y-4">
          <div class="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex justify-between items-center">
            <div>
              <div class="text-xs font-bold text-emerald-800">绿电全额上网代偿价 (CECEP FIT)</div>
              <div class="text-[10px] text-emerald-600 mt-1">适用站点: 中节能光储充示范站群</div>
            </div>
            <div class="text-right">
              <span class="text-xl font-black font-mono text-emerald-600">¥ 0.415</span>
              <span class="text-[10px] text-slate-400">元/kWh</span>
            </div>
          </div>

          <div class="text-xs text-slate-400 space-y-1.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150">
            <div>• 结算模型：余电全额入网。</div>
            <div>• 读表节点：关口电表(METER-001)的逆向有功累计字段。</div>
            <div>• 结算期：每月 25 日由财务清算中心自动勾稽。</div>
          </div>
        </div>
      </div>

    </div>

    <!-- TAB 4: 充电收费策略 -->
    <div v-if="activeSubTab === 'charging'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-5">
      <div class="pb-3 border-b border-slate-100">
        <h2 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <Zap :size="15" class="text-blue-500" />
          站内电动车直流快速充电桩计费模型
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <p class="text-xs text-slate-500">充电费用由两部分独立叠加构成：<span class="text-red-500 font-bold">基础差损电费 (元/度)</span> 与 <span class="text-[#005BAC] font-bold">平台运营服务费 (元/度)</span>：</p>
          
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
            <div class="font-bold text-xs text-slate-700">1. 分时电费 (承袭当年 TOU 大工业电价比例):</div>
            <div class="text-[11px] text-slate-400">系统根据在桩充能的真实开始和结束时钟，阶梯切片结算各基本时段的差费价格。</div>
            
            <div class="font-bold text-xs text-slate-700 mt-4">2. 平台服务附加税 (Service Surcharges):</div>
            <div class="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
              <span class="text-xs font-semibold text-slate-500">快充运营包服务附加费</span>
              <span class="text-xs font-black text-emerald-600 font-mono">¥ 0.35 元/kWh</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
              <span class="text-xs font-semibold text-slate-500">慢充便携运营服务附加费</span>
              <span class="text-xs font-black text-emerald-600 font-mono">¥ 0.20 元/kWh</span>
            </div>
          </div>
        </div>

        <div class="bg-[#F8FAFC] p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
          <div>
            <h4 class="text-xs font-bold text-slate-800 mb-2">示范计费公示：</h4>
            <div class="text-xs text-slate-500 space-y-1">
              <p>如果客户在 <span class="font-semibold text-slate-700">10:00 (高峰时段)</span> 充入 <span class="font-bold text-slate-700">30 kWh</span> 大体积电量：</p>
              <p>• 电价部分 = 30° × 1.05元 = 31.50 元</p>
              <p>• 服务费部分 = 30° × 0.35元 = 10.50 元</p>
              <p class="text-sm font-bold text-emerald-600 mt-2">实付金额 = 31.50 + 10.50 = 42.00 元</p>
            </div>
          </div>
          <a-tag color="processing" class="w-fit m-0 mt-4">符合星络及特来电一期结算公式</a-tag>
        </div>
      </div>
    </div>

    <!-- TAB 5: 基本电费与容量/需量目标 -->
    <div v-if="activeSubTab === 'basic'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-5">
      <div class="pb-3 border-b border-slate-100">
        <h2 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <Book :size="15" class="text-violet-600" />
          变压器安全备用基本容量与最大需量安全锁标
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <p class="text-xs text-slate-400">大工业用电需要按变压器容量 (kVA) 或最大需量 (kW) 额外向国家网侧交纳固定基本电税，中节能示范区采用如下方案：</p>
          
          <div class="space-y-2">
            <div class="flex justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200">
              <span class="text-xs font-bold text-slate-600">计费结算方案</span>
              <span class="text-xs text-slate-800 font-bold">按最大需量计征 (Demand-based)</span>
            </div>
            <div class="flex justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200">
              <span class="text-xs font-bold text-slate-600">最大需量安全控制红线</span>
              <span class="text-xs text-red-600 font-mono font-bold">900 kW</span>
            </div>
            <div class="flex justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-slate-200">
              <span class="text-xs font-bold text-slate-600">最大需量基本超值征收价</span>
              <span class="text-xs text-slate-800 font-mono font-bold">¥ 40 元 /kW · 月</span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-violet-50/50 rounded-xl border border-violet-100/80 flex flex-col justify-between">
          <div>
            <div class="text-[10px] text-violet-600 font-bold">一期变压器网卡运行状态：</div>
            <div class="text-lg font-black font-sans text-slate-800 mt-2">10kV/1250kVA 主并网回路</div>
            <p class="text-xs text-slate-500 mt-2 leading-relaxed">
              站内能流决策中枢通过储能系统（高自律峰段放电）及充电桩智能联控（错峰限幅降阻），全力守护月度不越过需量 900kW 红线，累计为厂区节省超额需量违约差税：<span class="text-emerald-600 font-bold">¥ 6,800 /月</span>。
            </p>
          </div>
          <a-progress :percent="84" status="normal" stroke-color="#8B5CF6" />
        </div>
      </div>
    </div>

    <!-- 电阶底价编辑模态弹窗 -->
    <a-modal
      v-model:open="isSchemeModalOpen"
      title="配置大工业/商业并网电量基价"
      @ok="saveScheme"
      ok-text="保存方案电价"
      cancel-text="放弃"
    >
      <a-form layout="vertical" class="space-y-3.5 p-3">
        <a-form-item label="计费方案注册命名" required>
          <a-input v-model:value="schemeFormModel.name" />
        </a-form-item>
        <div class="grid grid-cols-2 gap-3">
          <a-form-item label="适用宿主核心站点" required>
            <a-select v-model:value="schemeFormModel.site">
              <a-select-option value="中节能光储充示范站">中节能光储充示范站</a-select-option>
              <a-select-option value="中节能上海临港微网站点1">中节能上海临港微网站点1</a-select-option>
              <a-select-option value="中节能深圳光明微网站点2">中节能深圳光明微网站点2</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="行业能耗分类" required>
            <a-select v-model:value="schemeFormModel.type">
              <a-select-option value="大工业分时电价">大工业分时电价</a-select-option>
              <a-select-option value="一般工商业分时电价">一般工商业分时电价</a-select-option>
            </a-select>
          </a-form-item>
        </div>
        
        <div class="p-3 bg-slate-50 rounded-lg space-y-2">
          <div class="font-bold text-xs text-slate-500 pb-1.5 border-b border-slate-200 mb-2">差旅分时计征底价规则 (元 /kWh)</div>
          <div class="grid grid-cols-3 gap-2">
            <a-form-item label="尖峰电价" class="mb-0 custom-tou-label">
              <a-input-number v-model:value="schemeFormModel.prices.sharp" :step="0.01" class="w-full" />
            </a-form-item>
            <a-form-item label="高峰电价" class="mb-0 custom-tou-label">
              <a-input-number v-model:value="schemeFormModel.prices.peak" :step="0.01" class="w-full" />
            </a-form-item>
            <a-form-item label="平段电价" class="mb-0 custom-tou-label">
              <a-input-number v-model:value="schemeFormModel.prices.flat" :step="0.01" class="w-full" />
            </a-form-item>
            <a-form-item label="谷段电价" class="mb-0 custom-tou-label">
              <a-input-number v-model:value="schemeFormModel.prices.valley" :step="0.01" class="w-full" />
            </a-form-item>
            <a-form-item label="深谷电价" class="mb-0 custom-tou-label">
              <a-input-number v-model:value="schemeFormModel.prices.deepValley" :step="0.01" class="w-full" />
            </a-form-item>
          </div>
        </div>
      </a-form>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { globalStore } from '@/store';
import { TariffScheme } from '@/mock/data';
import { Scale, Clock, TrendingUp, Sun, Zap, Book } from 'lucide-vue-next';

const subTabs = [
  { label: '并网结算电价方案', value: 'plan' },
  { label: '24h峰谷分时配比段', value: 'tou' },
  { label: '电网购电与并网上网价格', value: 'tariff' },
  { label: '充电桩计费及服务策略', value: 'charging' },
  { label: '变配需量安全限定', value: 'basic' }
];

const activeSubTab = ref('plan');

const planColumns = [
  { title: '电价结算方案方案名称', dataIndex: 'name', key: 'name' },
  { title: '适用被监测厂站', dataIndex: 'site', key: 'site' },
  { title: '行业并网用电性质', dataIndex: 'type', key: 'type' },
  { title: '核算峰谷基本底价 (元/度)', key: 'prices' },
  { title: '该策略生效期', dataIndex: 'effectiveFrom', key: 'effectiveFrom' },
  { title: '工作状态', dataIndex: 'status', key: 'status' },
  { title: '控制台动作区', key: 'action' }
];

// 电价方案编辑Modal
const isSchemeModalOpen = ref(false);
const schemeFormModel = reactive<any>({
  id: '',
  name: '',
  site: '中节能光储充示范站',
  type: '大工业分时电价',
  prices: { sharp: 1.2, peak: 1.0, flat: 0.6, valley: 0.3, deepValley: 0.15 }
});

const openSchemeModal = (record: TariffScheme | null) => {
  if (record) {
    Object.assign(schemeFormModel, {
      id: record.id,
      name: record.name,
      site: record.site,
      type: record.type,
      prices: { ...record.prices }
    });
  } else {
    Object.assign(schemeFormModel, {
      id: 'price-' + Date.now(),
      name: '新放大工业方案',
      site: '中节能光储充示范站',
      type: '大工业分时电价',
      prices: { sharp: 1.25, peak: 1.02, flat: 0.65, valley: 0.31, deepValley: 0.18 }
    });
  }
  isSchemeModalOpen.value = true;
};

const saveScheme = () => {
  if (!schemeFormModel.name) {
    message.error('请填写完整的电价注册名称！');
    return;
  }
  
  const existingIdx = globalStore.tariffs.findIndex(t => t.id === schemeFormModel.id);
  if (existingIdx !== -1) {
    globalStore.tariffs[existingIdx] = {
      ...globalStore.tariffs[existingIdx],
      name: schemeFormModel.name,
      site: schemeFormModel.site,
      type: schemeFormModel.type,
      prices: { ...schemeFormModel.prices }
    };
    message.success(`电价方案【${schemeFormModel.name}】基础底价修改成功。`);
  } else {
    globalStore.tariffs.push({
      id: schemeFormModel.id,
      name: schemeFormModel.name,
      site: schemeFormModel.site,
      year: '2026',
      effectiveFrom: '2026-06-01',
      type: schemeFormModel.type,
      status: '执行中',
      prices: { ...schemeFormModel.prices },
      segments: [
        { start: '00:00', end: '08:00', type: '谷' },
        { start: '08:00', end: '12:00', type: '峰' },
        { start: '12:00', end: '18:00', type: '平' },
        { start: '18:00', end: '22:00', type: '尖' },
        { start: '22:00', end: '24:00', type: '谷' }
      ]
    });
    message.success(`全新电价方案并网策略【${schemeFormModel.name}】注册成功并加载默认时段。`);
  }
  isSchemeModalOpen.value = false;
};

const deactivatePlan = (record: TariffScheme) => {
  record.status = record.status === '已停用' ? '执行中' : '已停用';
  message.info(`方案状态改写。当前【${record.name}】为: ${record.status}`);
};

// 交互24H分时电时图
const selectedSchemeId = ref('price-01');
const selectedScheme = computed(() => {
  return globalStore.tariffs.find(t => t.id === selectedSchemeId.value) || globalStore.tariffs[0];
});

const onSchemeChange = (val: string) => {
  message.success({ content: `时段面板已重定向到方案: ${selectedScheme.value.name}` });
};

const editTOUForScheme = (record: TariffScheme) => {
  selectedSchemeId.value = record.id;
  activeSubTab.value = 'tou';
  message.success({ content: `已切换并开启【${record.name}】时段微调看板` });
};

// 按照起始格进行有序排列
const sortedSegments = computed(() => {
  return [...selectedScheme.value.segments].sort((a, b) => {
    return parseInt(a.start.split(':')[0]) - parseInt(b.start.split(':')[0]);
  });
});

// 计算百分比宽度分配宽度
const calcPercentWidth = (start: string, end: string) => {
  const startHour = parseInt(start.split(':')[0]);
  const endHour = parseInt(end.split(':')[0]) === 0 ? 24 : parseInt(end.split(':')[0]);
  const diff = endHour - startHour;
  return `${(diff / 24) * 100}%`;
};

const getSegmentBg = (type: string) => {
  switch (type) {
    case '尖': return 'bg-red-500 hover:bg-red-650';
    case '峰': return 'bg-orange-500 hover:bg-orange-650';
    case '平': return 'bg-blue-500 hover:bg-blue-650';
    case '谷': return 'bg-emerald-500 hover:bg-emerald-650';
    case '深谷': return 'bg-teal-500 hover:bg-teal-650';
    default: return 'bg-slate-400';
  }
};

const getSegmentBadgeStyle = (type: string) => {
  switch (type) {
    case '尖': return 'bg-red-50 text-red-600 border border-red-100';
    case '峰': return 'bg-orange-50 text-orange-600 border border-orange-100';
    case '平': return 'bg-blue-50 text-blue-600 border border-blue-100';
    case '谷': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    case '深谷': return 'bg-teal-50 text-teal-600 border border-teal-100';
    default: return 'bg-slate-50 text-slate-600';
  }
};

const getSchemePrice = (type: string) => {
  const p = selectedScheme.value.prices;
  if (type === '尖') return p.sharp;
  if (type === '峰') return p.peak;
  if (type === '平') return p.flat;
  if (type === '谷') return p.valley;
  if (type === '深谷') return p.deepValley || 0.15;
  return 0.6;
};

// 时段增删表单
const hourOptions = Array.from({ length: 25 }, (_, i) => {
  const str = i < 10 ? '0' + i : '' + i;
  return `${str}:00`;
});

const segmentForm = reactive({
  start: '08:00',
  end: '12:00',
  type: '峰'
});

const saveSegment = () => {
  const startH = parseInt(segmentForm.start.split(':')[0]);
  const endH = parseInt(segmentForm.end.split(':')[0]);
  
  if (startH >= endH) {
    message.error('结束时钟必须宽于起始时钟！例如: 08:00 到 12:00。');
    return;
  }
  
  // 原型简化：点击新增直接加入，并清理交叉冲突
  // 查找原有的覆盖
  selectedScheme.value.segments.push({
    start: segmentForm.start,
    end: segmentForm.end,
    type: segmentForm.type as any
  });
  
  message.success({ content: `时段段【${segmentForm.start} ~ ${segmentForm.end} : ${segmentForm.type}】规则已写入！` });
};

const deleteSegment = (index: number) => {
  selectedScheme.value.segments.splice(index, 1);
  message.warning('该计费时段配置已移出，为防止计费真空，请尽快补充时段！');
};

const segmentColumns = [
  { title: '起始时钟', dataIndex: 'start', key: 'start', fontWeight: 'bold' },
  { title: '终了时钟', dataIndex: 'end', key: 'end' },
  { title: '时度核算类别', dataIndex: 'type', key: 'type' },
  { title: '对应购电基价 (元/kWh)', key: 'price' },
  { title: '动作限项', key: 'action' }
];
</script>

<style scoped>
:deep(.custom-tou-label .ant-form-item-label > label) {
  font-size: 11px !important;
  color: #64748b !important;
}
</style>
