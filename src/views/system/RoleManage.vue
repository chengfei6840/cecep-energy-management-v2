<template>
  <div class="space-y-6 font-sans">
    <!-- 头部引导 & 操作卡片 -->
    <div class="bg-white px-6 py-5 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-base font-bold text-slate-800 m-0 flex items-center gap-2">
          <span class="h-4 w-1 bg-[#005BAC] rounded"></span>
          安全角色权限中台
        </h2>
        <p class="text-xs text-slate-400 font-medium">维护园区/集团安全控制角色层级体系，精细指派一期并网菜单、大屏及敏感写特权按钮的访问控制防线。</p>
      </div>
      
      <!-- 功能按钮 -->
      <a-button 
        type="primary" 
        class="bg-[#005BAC] text-xs font-bold h-9 flex items-center gap-1.5 rounded-lg border-none hover:bg-blue-700 cursor-pointer self-start md:self-auto shadow-sm"
        @click="handleCreateRole"
      >
        <Plus :size="14" /> 编制新安全角色
      </a-button>
    </div>

    <!-- 左右栅格：左边角色列表(10/24)，右边权限配置详情工作台(14/24) -->
    <div class="grid grid-cols-1 lg:grid-cols-24 gap-6 items-start">
      <!-- 左：角色管理矩阵 -->
      <div class="col-span-1 lg:col-span-11 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <!-- 面板头部过滤 -->
        <div class="p-4 border-b border-slate-100 space-y-3 bg-slate-50/40">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-600 flex items-center gap-1.5 select-none">
              <ShieldCheck :size="15" class="text-blue-650" />
              CECEP 角色席位树 (共计 {{ filteredRoles.length }} 类)
            </span>
            <span class="text-[10px] text-slate-400 font-mono">24H 鉴权监控已就绪</span>
          </div>

          <div class="flex items-center gap-2">
            <a-input v-model:value="searchText" placeholder="检索角色名称、编码核定码..." allow-clear class="text-xs">
              <template #prefix>
                <Search :size="12" class="text-slate-400" />
              </template>
            </a-input>
          </div>
        </div>

        <!-- 角色主列表 -->
        <div class="overflow-x-auto w-full">
          <a-table 
            :columns="columns" 
            :data-source="filteredRoles" 
            row-key="id"
            :pagination="pagination"
            size="small"
            :customRow="customRow"
            :row-class-name="getRowClassName"
            class="cecep-role-table"
          >
            <!-- 自定义名称/类型插槽 -->
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <div class="space-y-1">
                  <span class="font-bold text-slate-800 transition block leading-normal">{{ record.name }}</span>
                  <div class="flex items-center gap-1">
                    <span 
                      class="px-1.5 py-0.2 rounded text-[9.5px] font-bold"
                      :class="getRoleTypeStyle(record.roleType)"
                    >
                      {{ record.roleType }}
                    </span>
                    <span v-if="record.id === 'r-1' || record.id === 'r-2' || record.id === 'r-7'" class="text-[9.5px] px-1 bg-amber-50 text-amber-600 border border-amber-200 font-bold rounded">
                      内置
                    </span>
                  </div>
                </div>
              </template>
              
              <!-- 自定义代码 -->
              <template v-else-if="column.key === 'code'">
                <code class="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 rounded font-mono text-[10px]">
                  {{ record.code }}
                </code>
              </template>

              <!-- 关联用户 -->
              <template v-else-if="column.key === 'userCount'">
                <span class="font-mono font-bold text-slate-600 text-xs">{{ record.userCount }}人</span>
              </template>

              <!-- 状态 -->
              <template v-else-if="column.key === 'status'">
                <a-tag :color="record.status === '启用' ? 'success' : 'default'" class="m-0 font-bold text-[10px] scale-95">
                  {{ record.status }}
                </a-tag>
              </template>

              <!-- 操作 -->
              <template v-else-if="column.key === 'action'">
                <div class="flex items-center gap-2 justify-center" @click.stop>
                  <!-- 复制 -->
                  <a-button 
                    size="small" 
                    type="link" 
                    class="text-[#005BAC] p-0 font-bold hover:text-blue-700 text-xs flex items-center"
                    @click="handleCopyRole(record)"
                  >
                    复制
                  </a-button>

                  <span class="text-slate-200 select-none">|</span>

                  <!-- 删除 -->
                  <template v-if="record.roleType === '系统角色' || record.id === 'r-1' || record.id === 'r-2' || record.id === 'r-7'">
                    <a-tooltip title="系统内置核心行政岗，仅限审计，不支持物理剥离。">
                      <span class="text-slate-350 cursor-not-allowed select-none text-xs font-medium">
                        删除
                      </span>
                    </a-tooltip>
                  </template>
                  <template v-else>
                    <a-popconfirm
                      title="您确定要彻底物理废除此安全角色权限，并不留存副本了吗？下联关系将自毁。"
                      ok-text="彻底删除"
                      cancel-text="暂存"
                      ok-type="danger"
                      @confirm="handleDeleteRole(record.id)"
                    >
                      <a-button 
                        size="small" 
                        type="link" 
                        class="text-rose-600 hover:text-rose-700 p-0 font-bold text-xs"
                      >
                        删除
                      </a-button>
                    </a-popconfirm>
                  </template>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <!-- 右：角色配置控制工作台 -->
      <div class="col-span-1 lg:col-span-13 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[580px]">
        <div v-if="activeRole" class="p-6 space-y-6 flex flex-col justify-between h-full">
          
          <div class="space-y-6">
            <!-- 头部基本属性摘要栏 -->
            <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-5 rounded-xl text-white relative overflow-hidden shadow-sm flex items-center justify-between border border-slate-800">
              <div class="space-y-1 z-10">
                <div class="flex items-center gap-1.5">
                  <span class="px-2 py-0.5 rounded text-[9.5px] font-bold bg-white/10 text-white border border-white/20">
                    {{ activeRole.roleType }}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[9.5px] font-bold leading-none bg-blue-500/20 text-blue-200 border border-blue-500/30">
                    {{ activeRole.status }}
                  </span>
                </div>
                <h3 class="text-sm font-bold m-0 text-white select-all mt-1 flex items-center gap-1.5">
                  {{ activeRole.name }}
                  <span class="text-[10px] text-slate-400 font-mono font-medium">({{ activeRole.code }})</span>
                </h3>
                <p class="text-[10.5px] text-slate-300 m-0 leading-relaxed font-sans max-w-[380px]">{{ activeRole.desc || '尚未为此角色分配安全职责简明备注。' }}</p>
              </div>

              <!-- 右侧快捷控制 -->
              <div class="flex flex-col items-end gap-2 shrink-0 z-10">
                <button 
                  @click="handleEditBaseInfo"
                  class="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-lg text-[10.5px] font-bold transition cursor-pointer flex items-center gap-1"
                >
                  编辑详情
                </button>
                
                <!-- 快捷闭锁 -->
                <a-popconfirm
                  :title="activeRole.status === '启用' ? '停用警告：停用后该角色所有关联用户的菜单和特写指令将被即时挂起，确定继续吗？' : '起用提示：您确认重新核准起用该安全岗位吗？'"
                  ok-text="确认"
                  cancel-text="取消"
                  @confirm="toggleStatusDirectly(activeRole)"
                >
                  <button 
                    class="px-2.5 py-1 border text-[10.5px] font-bold rounded-lg transition cursor-pointer"
                    :class="activeRole.status === '启用' ? 'bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border-amber-600/30' : 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border-emerald-600/30'"
                  >
                    {{ activeRole.status === '启用' ? '安全停用' : '安全启用' }}
                  </button>
                </a-popconfirm>
              </div>
            </div>

            <!-- a-tabs 展示权限：菜单权限、功能权限、数据范围 -->
            <a-tabs v-model:activeKey="activeTabKey" class="cecep-role-tabs">
              <!-- Tab 菜单 -->
              <a-tab-pane key="1" tab="1、页面菜单访问权限">
                <div class="space-y-4 pt-2">
                  <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span class="text-[11px] text-slate-400 font-medium">
                      已挑选并网菜单数计：<span class="font-bold text-slate-700 font-mono">{{ menuCheckedKeys?.length || 0 }}</span> 个页面
                    </span>
                    <div class="flex items-center gap-1.5 scale-95 origin-right">
                      <a-button size="xs" type="primary" class="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 border border-blue-200 hover:bg-blue-100 h-auto" ghost @click="expandAll">全部展开</a-button>
                      <a-button size="xs" class="text-slate-600 text-[10px] font-bold px-2.5 py-1 border border-slate-200 hover:bg-slate-50 h-auto animate-none" @click="collapseAll">全部折叠</a-button>
                      <a-button size="xs" type="dashed" class="text-blue-800 text-[10px] font-bold px-2.5 py-1 border border-dashed border-blue-205 hover:bg-slate-50 h-auto" @click="checkAllMenus">全选页面</a-button>
                      <a-button size="xs" class="text-rose-600 text-[10px] font-bold px-2.5 py-1 border border-rose-200 hover:bg-rose-50/40 h-auto" danger ghost @click="clearAllMenus">清空勾选</a-button>
                    </div>
                  </div>

                  <!-- 树组件 -->
                  <div class="bg-slate-50/70 p-4 border border-slate-200/80 rounded-xl max-h-[380px] overflow-y-auto min-h-[320px]">
                    <a-tree
                      v-model:expandedKeys="expandedKeys"
                      v-model:checkedKeys="menuCheckedKeys"
                      :tree-data="menuTreeData"
                      checkable
                      :checkStrictly="false"
                      class="cecep-menu-tree !bg-transparent text-xs"
                    />
                  </div>
                </div>
              </a-tab-pane>

              <!-- Tab 功能写操作 -->
              <a-tab-pane key="2" tab="2、功能操作按钮特权">
                <div class="space-y-4 pt-2">
                  <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span class="text-[11px] text-slate-400 font-medium">
                      已核定指令特权：<span class="font-bold text-emerald-600 font-mono">{{ buttonCheckedKeys?.length || 0 }}</span> 个敏感动作
                    </span>
                    <div class="flex items-center gap-2 scale-95 origin-right">
                      <button 
                        @click="selectAllButtons" 
                        class="text-blue-650 hover:underline font-bold text-[10px] cursor-pointer"
                      >
                        全选动作
                      </button>
                      <span class="text-slate-300">|</span>
                      <button 
                        @click="clearAllButtons" 
                        class="text-rose-600 hover:underline font-bold text-[10px] cursor-pointer"
                      >
                        清空指令
                      </button>
                    </div>
                  </div>

                  <!-- 分组卡片 -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[385px] overflow-y-auto pr-1 pb-4">
                    <div 
                      v-for="group in buttonGroups" 
                      :key="group.key"
                      class="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm space-y-2.5 flex flex-col justify-between"
                    >
                      <!-- 组头 -->
                      <div class="flex items-center justify-between border-b border-slate-50 pb-1.5">
                        <span class="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                          <span class="h-2 w-2 rounded-full bg-blue-650"></span>
                          {{ group.module }}
                        </span>
                        <button 
                          @click="toggleGroupButtons(group)"
                          class="text-[9.5px] font-bold text-slate-400 hover:text-blue-650"
                        >
                          {{ isGroupAllChecked(group) ? '全消' : '全选本组' }}
                        </button>
                      </div>

                      <!-- 各按钮CheckBox -->
                      <div class="grid grid-cols-2 gap-x-2 gap-y-2">
                        <div 
                          v-for="b in group.buttons" 
                          :key="b.key"
                          class="flex items-start gap-1 p-1 hover:bg-slate-50 rounded transition"
                        >
                          <a-checkbox 
                            :checked="buttonCheckedKeys.includes(b.key)" 
                            @change="(e: any) => toggleButtonDirectly(b.key, e.target.checked)"
                            class="scale-90"
                          />
                          <span class="text-[10px] font-semibold text-slate-600 select-none cursor-pointer leading-tight mt-0.5" @click="toggleButtonDirectly(b.key, !buttonCheckedKeys.includes(b.key))">
                            {{ b.label }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>

              <!-- Tab 数据权限说明 -->
              <a-tab-pane key="3" tab="3、数据查看范围规则">
                <div class="space-y-4 pt-2">
                  <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-150 text-blue-800 space-y-2.5 select-none">
                    <div class="font-bold flex items-center gap-1.5 text-blue-900 text-xs">
                      <Info :size="15" />
                      一期微电网业务安全物理隔离规则建议
                    </div>
                    <ul class="list-disc pl-4 space-y-1.5 leading-relaxed text-slate-650 text-[11px] font-medium m-0">
                      <li><b>角色与网格隔离</b>：系统中的安全角色控制用户在云平台能访问哪些功能菜单、页面视图以及写指令按钮，<b>但不直接绑定物理站点资产。</b></li>
                      <li><b>资产站点授权（用户级解耦）</b>：各个账号具体的物理站房查看、气象遥测读取和自控参数核签权限，<b>均在【人员管理】或【用户管理】界面进行精确到对端的密钥指配。</b></li>
                      <li><b>多级权限最终合集运算</b>：若一个集团职员由于身兼多职，被分别指定了 <code>“运维人员”</code> 和 <code>“财务查看人员”</code> 两个角色，则该用户的系统底版菜单及操作将自动取<b>两者合并后的完整版特权（逻辑并集关系）。</b></li>
                    </ul>
                  </div>

                  <div class="grid grid-cols-2 gap-3 pt-2">
                    <div class="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 flex flex-col justify-between">
                      <div class="space-y-1">
                        <span class="text-[9.5px] text-zinc-400 font-bold block uppercase tracking-wider">能效访问防线</span>
                        <span class="text-[11.5px] font-bold text-slate-800 block">多级隔离架构</span>
                        <p class="m-0 text-[10px] text-slate-500 leading-normal">任何前端静态路由激活或是敏感后端接口调用，均经过统一的安全中介件安全审核防护。</p>
                      </div>
                      <div class="text-[10px] text-blue-650 font-bold pt-2 select-none">一期安全核心完成 ●</div>
                    </div>
                    <div class="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 flex flex-col justify-between">
                      <div class="space-y-1">
                        <span class="text-[9.5px] text-zinc-400 font-bold block uppercase tracking-wider">实体站口防线</span>
                        <span class="text-[11.5px] font-bold text-slate-800 block">站域持钥机制</span>
                        <p class="m-0 text-[10px] text-slate-500 leading-normal">光伏、PCS及BMS电池堆由于涉及强电和变电资产，不充许普通用户在未核准站点时查看遥测值。</p>
                      </div>
                      <div class="text-[10px] text-emerald-600 font-bold pt-2 select-none">物理断路保障 ●</div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>

          <!-- 保存操作栏 -->
          <div class="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
            <span class="text-[10.5px] text-slate-400 font-mono">
              上次编制遥测同步日：{{ activeRole.createdAt || '2026-05-26 12:00:00' }}
            </span>
            <div class="flex items-center gap-2">
              <a-button 
                type="primary" 
                class="bg-[#005BAC] hover:bg-blue-750 text-white font-bold text-xs h-9 px-5 rounded-lg border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                @click="saveRolePermissions"
              >
                落盘并发布最新角色授权
              </a-button>
            </div>
          </div>

        </div>

        <!-- 空态 -->
        <div v-else class="flex flex-col items-center justify-center m-auto text-slate-400 py-24 select-none space-y-3">
          <ShieldAlert :size="48" class="text-slate-200 animate-pulse border border-slate-100 p-2.5 rounded-full bg-slate-50" />
          <div class="text-center space-y-1">
            <span class="text-xs font-bold text-slate-600 block">尚未载入安全策略行</span>
            <p class="m-0 text-[10.5px] text-slate-400">请点选左侧角色矩阵中任意一行，即可在右侧载入一期高保真配网审计。 </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal：新增 / 编辑角色基础信息 -->
    <a-modal
      v-model:open="isModalOpen"
      :title="formState.id ? '微调中节能安全岗位核心属性' : '编制新建中节能安全管理角色'"
      @ok="handleModalOk"
      width="460px"
      ok-text="落盘保存基础属性"
      cancel-text="放弃"
    >
      <div class="p-2 space-y-4 text-xs font-sans">
        <div class="bg-blue-50/50 p-3 rounded-lg border border-blue-150/40 flex items-start gap-2.5 text-blue-800 leading-relaxed leading-normal select-none">
          <Info :size="13" class="mt-0.5 shrink-0" />
          <p class="m-0 text-[10.5px]">
            此处为角色物理卡套。新编角色后，请点击<b>右侧 [1、页面菜单访问权限]</b> 赋予具体一期光储充多能流的可视菜单，确保该岗位在集团配网的安全合法性。
          </p>
        </div>

        <a-form layout="vertical" class="space-y-3">
          <!-- 岗位名 -->
          <a-form-item label="安全岗位名称" required>
            <a-input v-model:value="formState.name" placeholder="请输入如：特种消防设备管理员 / 集团内账审计管" />
          </a-form-item>

          <!-- 安全核定代码 -->
          <a-form-item label="岗位识别代码 (Unique Code)" required :disabled="!!formState.id">
            <a-input v-model:value="formState.code" placeholder="建议格式: ROLE_OPER_DEPT" :disabled="!!formState.id" />
          </a-form-item>

          <div class="grid grid-cols-2 gap-3">
            <!-- 岗位类型 -->
            <a-form-item label="企业岗位分类" required>
              <a-select v-model:value="formState.roleType" style="width: 100%">
                <a-select-option value="系统角色">系统管理角色</a-select-option>
                <a-select-option value="业务角色">业务执纪角色</a-select-option>
                <a-select-option value="只读角色">只读视察角色</a-select-option>
              </a-select>
            </a-form-item>

            <!-- 状态 -->
            <a-form-item label="并网合规状态" required>
              <a-select v-model:value="formState.status" style="width: 100%">
                <a-select-option value="启用">正常起用</a-select-option>
                <a-select-option value="停用">安全置闭</a-select-option>
              </a-select>
            </a-form-item>
          </div>

          <!-- 岗位职责 -->
          <a-form-item label="岗位安责简要描述" required>
            <a-textarea v-model:value="formState.desc" placeholder="请输入本岗位负责的集团子代网格资产、一期并售账單或系统边界安全职责..." :rows="3" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { globalStore } from '@/store';
import { message } from 'ant-design-vue';
import {
  Plus,
  Search,
  ShieldCheck,
  ShieldAlert,
  Info
} from 'lucide-vue-next';

// 页面一期树型菜单结构定义
const menuTreeData = [
  { title: '首页总览', key: 'dashboard' },
  { title: '运营大屏', key: 'big-screen' },
  {
    title: '第三方数据接入网格',
    key: 'integration',
    children: [
      { title: '第三方平台管理', key: 'integration-platform' },
      { title: '接口配置', key: 'integration-config' },
      { title: '数据同步任务', key: 'integration-task' },
      { title: '数据映射管理', key: 'integration-mapping' },
      { title: '同步日志', key: 'integration-log' },
      { title: '接入异常监控', key: 'integration-exception' }
    ]
  },
  {
    title: '电价与并网计费',
    key: 'tariff',
    children: [
      { title: '电价方案', key: 'tariff-scheme' },
      { title: '分时电价', key: 'tariff-segment' },
      { title: '购电电价', key: 'tariff-buy' },
      { title: '光伏上网电价', key: 'tariff-solar-sell' },
      { title: '充电电价', key: 'tariff-charge' },
      { title: '基本电费', key: 'tariff-base' }
    ]
  },
  {
    title: '光伏发电智能监测',
    key: 'pv',
    children: [
      { title: '光伏总览', key: 'pv-overview' },
      { title: '逆变器监测', key: 'pv-inverter' },
      { title: '发电趋势', key: 'pv-trend' },
      { title: '光伏收益', key: 'pv-revenue' }
    ]
  },
  {
    title: '储能电池调峰微电网',
    key: 'storage',
    children: [
      { title: '储能总览', key: 'storage-overview' },
      { title: 'PCS变流监测', key: 'storage-pcs' },
      { title: 'BMS电池堆监控', key: 'storage-bms' },
      { title: '充放电电能曲线', key: 'storage-curve' },
      { title: '储能削峰收益', key: 'storage-revenue' }
    ]
  },
  {
    title: '充电桩资产负荷网',
    key: 'charging',
    children: [
      { title: '充电站总览', key: 'charging-overview' },
      { title: '充电桩群列表', key: 'charging-list' },
      { title: '充电业务订单', key: 'charging-order' },
      { title: '充电电费收益', key: 'charging-revenue' }
    ]
  },
  {
    title: '电网安全运行拓扑',
    key: 'grid',
    children: [
      { title: '购售电并网计量', key: 'grid-monitor' },
      { title: '站内总负荷分配', key: 'grid-load' },
      { title: '需量响应智能控制', key: 'grid-demand' },
      { title: '购电成本收益分析', key: 'grid-cost' }
    ]
  },
  {
    title: '智能多能流联合拓扑',
    key: 'energy-flow',
    children: [
      { title: '实时能流桑基图', key: 'energy-realtime' },
      { title: '桑基图物理拓扑', key: 'energy-sankey' }
    ]
  },
  {
    title: '能效收益统计中心',
    key: 'revenue',
    children: [
      { title: '收益总览', key: 'revenue-overview' }
    ]
  },
  {
    title: '分布式资产设备台账',
    key: 'device',
    children: [
      { title: '设备智能台账', key: 'device-ledger' },
      { title: '遥测点位绑定', key: 'device-points' },
      { title: '多平台映射映射', key: 'device-mapping' }
    ]
  },
  {
    title: '智能告警消缺派单',
    key: 'alarm',
    children: [
      { title: '当前安全告警', key: 'alarm-current' },
      { title: '历史告警回溯', key: 'alarm-history' },
      { title: '闭环确报派工', key: 'alarm-handling' }
    ]
  },
  { title: '综合遥测报表中心', key: 'report' },
  {
    title: '平台底层系统管理',
    key: 'system',
    children: [
      { title: '用户管理', key: 'system-user' },
      { title: '角色管理', key: 'system-role' },
      { title: '站点管理', key: 'system-site' }
    ]
  }
];

// 功能按钮分组及列表一期详细按钮权限
const buttonGroups = [
  {
    module: '一、第三方平台管理',
    key: 'integration-platform',
    buttons: [
      { key: 'btn-plat-view', label: '查看' },
      { key: 'btn-plat-add', label: '新增' },
      { key: 'btn-plat-edit', label: '编辑' },
      { key: 'btn-plat-delete', label: '删除' },
      { key: 'btn-plat-test', label: '测试连接' },
      { key: 'btn-plat-status', label: '启用/停用' }
    ]
  },
  {
    module: '二、数据同步任务',
    key: 'integration-task',
    buttons: [
      { key: 'btn-task-view', label: '查看' },
      { key: 'btn-task-add', label: '新增' },
      { key: 'btn-task-edit', label: '编辑' },
      { key: 'btn-task-exec', label: '立即执行' },
      { key: 'btn-task-log', label: '查看日志' },
      { key: 'btn-task-delete', label: '删除' }
    ]
  },
  {
    module: '三、电价与计价管理',
    key: 'tariff',
    buttons: [
      { key: 'btn-tariff-view', label: '查看' },
      { key: 'btn-tariff-add', label: '新增' },
      { key: 'btn-tariff-edit', label: '编辑' },
      { key: 'btn-tariff-copy', label: '复制' },
      { key: 'btn-tariff-stop', label: '停用' },
      { key: 'btn-tariff-export', label: '导出' }
    ]
  },
  {
    module: '四、安全告警处理',
    key: 'alarm',
    buttons: [
      { key: 'btn-alarm-view', label: '查看' },
      { key: 'btn-alarm-confirm', label: '确权' },
      { key: 'btn-alarm-handle', label: '处理派单' },
      { key: 'btn-alarm-export', label: '导出' }
    ]
  },
  {
    module: '五、数据报表中心',
    key: 'report',
    buttons: [
      { key: 'btn-report-view', label: '查看' },
      { key: 'btn-report-export', label: '导出' }
    ]
  },
  {
    module: '六、底层系统管理',
    key: 'system',
    buttons: [
      { key: 'btn-sysuser-add', label: '用户新增' },
      { key: 'btn-sysuser-edit', label: '用户编辑' },
      { key: 'btn-sysuser-role', label: '分配角色' },
      { key: 'btn-sysuser-site', label: '分配站点' },
      { key: 'btn-sysrole-add', label: '角色新增' },
      { key: 'btn-sysrole-edit', label: '角色编辑' },
      { key: 'btn-sysrole-auth', label: '权限配置' },
      { key: 'btn-syssite-add', label: '站点新增' },
      { key: 'btn-syssite-edit', label: '站点编辑' }
    ]
  }
];

// 左侧列表表格列参数
const columns = [
  {
    title: '角色名称',
    customHeader: () => '角色名称 / 级别标签',
    dataIndex: 'name',
    key: 'name',
    width: '40%'
  },
  {
    title: '核准码',
    dataIndex: 'code',
    key: 'code',
    width: '32%'
  },
  {
    title: '用户',
    dataIndex: 'userCount',
    key: 'userCount',
    width: '12%',
    align: 'center' as const
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: '12%',
    align: 'center' as const
  },
  {
    title: '操作',
    key: 'action',
    align: 'center' as const
  }
];

// 搜寻模糊状态
const searchText = ref('');

// A-Table 分页参数
const pagination = reactive({
  pageSize: 7,
  current: 1,
  showSizeChanger: false,
  total: computed(() => filteredRoles.value.length)
});

// 计算过滤后显示的岗位角色
const filteredRoles = computed(() => {
  if (!searchText.value) return globalStore.roles;
  const s = searchText.value.toLowerCase().trim();
  return globalStore.roles.filter(r => 
    r.name.toLowerCase().includes(s) || 
    r.code.toLowerCase().includes(s)
  );
});

// 左侧高亮及选择事件
const activeRole = ref<any>(null);
const activeTabKey = ref('1');

const menuCheckedKeys = ref<string[]>([]);
const buttonCheckedKeys = ref<string[]>([]);
const expandedKeys = ref<string[]>([]);

onMounted(() => {
  // 默认加载第一个
  if (globalStore.roles && globalStore.roles.length > 0) {
    loadRolePermissions(globalStore.roles[0]);
  }
});

// 点击加载角色配置
const loadRolePermissions = (role: any) => {
  activeRole.value = role;
  
  // 恢复菜单选中
  if (role.menuRights && role.menuRights.includes('all')) {
    menuCheckedKeys.value = getAllKeysOfTree(menuTreeData);
  } else {
    menuCheckedKeys.value = [...(role.menuRights || [])];
  }

  // 恢复按钮CheckBox选中
  if (role.buttonRights && role.buttonRights.includes('all')) {
    buttonCheckedKeys.value = getAllButtonKeys();
  } else {
    buttonCheckedKeys.value = [...(role.buttonRights || [])];
  }

  // 默认展开首层
  expandedKeys.value = ['integration', 'tariff', 'pv', 'storage', 'charging', 'grid', 'energy-flow', 'device', 'alarm', 'system'];
};

const customRow = (record: any) => {
  return {
    onClick: () => {
      loadRolePermissions(record);
    }
  };
};

const getRowClassName = (record: any) => {
  return activeRole.value && activeRole.value.id === record.id 
    ? '!bg-blue-50/40 font-semibold border-l-4 border-l-[#005BAC] cursor-pointer' 
    : 'cursor-pointer hover:bg-slate-50/60 transition-all';
};

// 样式类型色值映射
const getRoleTypeStyle = (type: string) => {
  switch (type) {
    case '系统角色':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case '业务角色':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case '只读角色':
      return 'bg-cyan-50/70 text-cyan-700 border border-cyan-200';
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-200';
  }
};

// 一键展开/一键收折/全选/清空
const getAllKeysOfTree = (tree: any[]): string[] => {
  const keys: string[] = [];
  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      keys.push(node.key);
      if (node.children) {
        traverse(node.children);
      }
    });
  };
  traverse(tree);
  return keys;
};

const getAllButtonKeys = (): string[] => {
  const keys: string[] = [];
  buttonGroups.forEach(g => {
    g.buttons.forEach(b => {
      keys.push(b.key);
    });
  });
  return keys;
};

const expandAll = () => {
  expandedKeys.value = getAllKeysOfTree(menuTreeData);
  message.success('菜单目录层架已完全拓开展开！');
};

const collapseAll = () => {
  expandedKeys.value = [];
  message.info('菜单树已完全收合并拢。');
};

const checkAllMenus = () => {
  menuCheckedKeys.value = getAllKeysOfTree(menuTreeData);
  message.success('已勾选一期所有的配网功能模块。');
};

const clearAllMenus = () => {
  menuCheckedKeys.value = [];
  message.warning('一期菜单功能模块勾选已复位调空。');
};

// 按钮功能特权按组勾选控制
const isGroupAllChecked = (group: any) => {
  return group.buttons.every((b: any) => buttonCheckedKeys.value.includes(b.key));
};

const toggleGroupButtons = (group: any) => {
  const keys = group.buttons.map((b: any) => b.key);
  const allChecked = isGroupAllChecked(group);
  if (allChecked) {
    // 全空
    buttonCheckedKeys.value = buttonCheckedKeys.value.filter(k => !keys.includes(k));
    message.warning(`已撤销【${group.module}】下的全部按钮操作特权。`);
  } else {
    // 全选
    keys.forEach((k: string) => {
      if (!buttonCheckedKeys.value.includes(k)) {
        buttonCheckedKeys.value.push(k);
      }
    });
    message.success(`已核批【${group.module}】下的全部按钮操作权限。`);
  }
};

const toggleButtonDirectly = (key: string, checked: boolean) => {
  if (checked) {
    if (!buttonCheckedKeys.value.includes(key)) {
      buttonCheckedKeys.value.push(key);
    }
  } else {
    buttonCheckedKeys.value = buttonCheckedKeys.value.filter(k => k !== key);
  }
};

const selectAllButtons = () => {
  buttonCheckedKeys.value = getAllButtonKeys();
  message.success('已勾配全部敏感功能特权限组！');
};

const clearAllButtons = () => {
  buttonCheckedKeys.value = [];
  message.warning('已重置所有写控制按钮权限。');
};

// 停启用
const toggleStatusDirectly = (record: any) => {
  if (record.status === '启用') {
    record.status = '停用';
    message.warning(`岗位【${record.name}】已成功闭锁锁定。挂载的人员权限将临时注销。`);
  } else {
    record.status = '启用';
    message.success(`心跳重新就绪！岗位【${record.name}】授权成功重新启用激活。`);
  }
};

// 删除角色 (对内置角色的阻断)
const handleDeleteRole = (id: string) => {
  if (id === 'r-1' || id === 'r-2' || id === 'r-7') {
    message.error('系统内置底层角色禁止进行任何形式物理删除！');
    return;
  }
  
  const foundIdx = globalStore.roles.findIndex(r => r.id === id);
  if (foundIdx !== -1) {
    const rName = globalStore.roles[foundIdx].name;
    globalStore.roles.splice(foundIdx, 1);
    message.success(`安全岗位【${rName}】已被强制注销、下网切除。`);
    
    // 如果当前选中的是这个被删的，自动切去第一个
    if (activeRole.value && activeRole.value.id === id) {
      if (globalStore.roles.length > 0) {
        loadRolePermissions(globalStore.roles[0]);
      } else {
        activeRole.value = null;
      }
    }
  }
};

// 复制角色带有其全部当前勾选权限作为副本
const handleCopyRole = (record: any) => {
  const newId = 'r-' + Math.floor(100 + Math.random() * 900);
  const copyName = `${record.name}_副本`;
  const copyCode = `${record.code}_COPY`;
  
  // 深度复制其权限
  const copiedRole = {
    id: newId,
    name: copyName,
    code: copyCode,
    roleType: '业务角色' as const, // 复制所得默认设为业务
    userCount: 0,
    status: '启用' as const,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    desc: `源于 [${record.name}] 继承并编制而出的副本`,
    menuRights: record.menuRights ? [...record.menuRights] : ['dashboard'],
    buttonRights: record.buttonRights ? [...record.buttonRights] : []
  };

  globalStore.roles.push(copiedRole);
  loadRolePermissions(copiedRole);
  message.success(`成功承袭【${record.name}】菜单和特权参数，新克隆角色「${copyName}」就绪！`);
};

// 保存角色所属的权限配置
const saveRolePermissions = () => {
  if (!activeRole.value) {
    message.warning('尚未载入并选定任何活跃角色席位！');
    return;
  }

  const role = activeRole.value;
  const idx = globalStore.roles.findIndex(r => r.id === role.id);
  if (idx !== -1) {
    // 菜单级联勾选
    globalStore.roles[idx].menuRights = [...menuCheckedKeys.value];
    // 按钮敏感勾选
    globalStore.roles[idx].buttonRights = [...buttonCheckedKeys.value];
    
    // 同步刷新本地
    role.menuRights = [...menuCheckedKeys.value];
    role.buttonRights = [...buttonCheckedKeys.value];

    message.success(`权限落树成功！角色「${role.name}」的一期并网菜单、大屏及敏感动作集重载同步就绪！`);
  }
};

// Modal 新创 / 新建基础配置
const isModalOpen = ref(false);
const formState = reactive({
  id: '',
  name: '',
  code: '',
  roleType: '业务角色' as '系统角色' | '业务角色' | '只读角色',
  desc: '',
  status: '启用' as '启用' | '停用'
});

const handleCreateRole = () => {
  Object.assign(formState, {
    id: '',
    name: '',
    code: 'ROLE_' + Math.floor(100 + Math.random() * 899 + 100),
    roleType: '业务角色',
    desc: '',
    status: '启用'
  });
  isModalOpen.value = true;
};

const handleEditBaseInfo = () => {
  if (!activeRole.value) return;
  const role = activeRole.value;
  Object.assign(formState, {
    id: role.id,
    name: role.name,
    code: role.code,
    roleType: role.roleType,
    desc: role.desc,
    status: role.status
  });
  isModalOpen.value = true;
};

const handleModalOk = () => {
  if (!formState.name || !formState.code || !formState.desc) {
    message.error('新编岗位岗位名称、系统核认识别代号及主要安责描述不充许存空状态。');
    return;
  }

  if (formState.id) {
    // 编辑保存
    const idx = globalStore.roles.findIndex(r => r.id === formState.id);
    if (idx !== -1) {
      globalStore.roles[idx] = {
        ...globalStore.roles[idx],
        name: formState.name,
        code: formState.code,
        roleType: formState.roleType,
        desc: formState.desc,
        status: formState.status
      };
      
      // 同步刷新右侧详情头部展现
      if (activeRole.value && activeRole.value.id === formState.id) {
        Object.assign(activeRole.value, globalStore.roles[idx]);
      }
      message.success(`岗位【${formState.name}】基础卡片属性修订核签通过。`);
    }
  } else {
    // 新增加入
    const newId = 'r-ext-' + Math.floor(100 + Math.random() * 900);
    const newR = {
      id: newId,
      name: formState.name,
      code: formState.code,
      roleType: formState.roleType,
      desc: formState.desc,
      status: formState.status,
      userCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      menuRights: ['dashboard'],
      buttonRights: []
    };
    
    globalStore.roles.push(newR);
    // 自动切换右侧展示进行深度授权
    loadRolePermissions(newR);
    message.success(`安全岗位【${formState.name}】角色编制成功，可在右侧通过 [菜单] 和 [特权] Tab继续指配！`);
  }
  isModalOpen.value = false;
};
</script>

<style scoped>
.cecep-role-tabs :deep(.ant-tabs-nav-wrap) {
  border-bottom: 2px solid #f1f5f9;
}
.cecep-role-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 8px !important;
}
.cecep-role-tabs :deep(.ant-tabs-tab-btn) {
  font-size: 11.5px !important;
  font-weight: 700 !important;
  color: #64748b;
}
.cecep-role-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #005BAC !important;
}
.cecep-role-tabs :deep(.ant-tabs-ink-bar) {
  background: #005BAC !important;
}
.cecep-menu-tree :deep(.ant-tree-node-content-wrapper) {
  font-weight: 500 !important;
  color: #334155;
}
.cecep-menu-tree :deep(.ant-tree-node-selected) {
  background-color: #f1f5f9 !important;
}
</style>
