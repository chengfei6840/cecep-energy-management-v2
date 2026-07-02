<template>
  <div class="space-y-6 font-sans">
    
    <!-- 子页标签 -->
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

    <!-- TAB 1: 购售电概述 -->
    <div v-if="activeSubTab === 'overview'" class="space-y-6">
      
      <!-- 指标卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-[11px] font-bold text-slate-400">目前并网总购电功率</div>
            <div class="text-xl font-black text-slate-800 font-mono mt-1">{{ globalStore.metrics.gridPower }} kW</div>
            <span class="text-[10px] text-slate-450">昨日同期: 410 kW</span>
          </div>
          <div class="h-10 w-10 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center font-bold shadow-sm"><Radio :size="18" /></div>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-[11px] font-bold text-slate-400">目前并网逆向有功功率</div>
            <div class="text-xl font-black text-slate-800 font-mono mt-1">35 kW</div>
            <span class="text-[10px] text-emerald-600 font-bold mt-1">动作: 光伏余绿上网中</span>
          </div>
          <div class="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold shadow-sm"><Sun :size="18" /></div>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-[11px] font-bold text-slate-400">今日累计购电量</div>
            <div class="text-xl font-black text-slate-800 font-mono mt-1">{{ globalStore.metrics.gridTodayBuy }} kWh</div>
            <span class="text-[10px] text-slate-400 mt-1">合并大工业专线抄表</span>
          </div>
          <div class="h-10 w-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center font-bold shadow-sm"><Battery :size="18" /></div>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-[11px] font-bold text-slate-400">今日累计反馈上网</div>
            <div class="text-xl font-black text-slate-800 font-mono mt-1">{{ globalStore.metrics.gridTodaySell }} kWh</div>
            <span class="text-[10px] text-emerald-600 font-bold mt-1">累计代偿收益对齐</span>
          </div>
          <div class="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center font-bold shadow-sm"><Workflow :size="18" /></div>
        </div>
      </div>

      <!-- 潮流曲线 -->
      <div class="bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5 m-0">
          <TrendingUp :size="15" class="text-emerald-00" />
          厂区并网关口表 24h 购电潮流与逆向反送有功叠配曲线
        </h3>
        <div ref="gridChartRef" class="w-full h-80"></div>
      </div>

    </div>

    <!-- TAB 2: 变电站内负荷分路 -->
    <div v-if="activeSubTab === 'load'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-5">
      <div class="border-b border-slate-100 pb-3">
        <h3 class="text-sm font-bold text-slate-800 m-0">主配电变压器出线分路负能耗图</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <p class="text-xs text-slate-500">变配电侧实时负载占比：系统通过 CT 采样对各个关键分路有功进行合并比对：</p>
          
          <div class="space-y-3 pt-2">
            <div>
              <div class="flex justify-between items-center text-xs font-bold mb-1">
                <span class="text-slate-600">直流快速充电及慢充桩负荷 (EVCS Load)</span>
                <span class="text-slate-800 font-mono">180.0 kW / 42.8%</span>
              </div>
              <a-progress :percent="43" :show-info="false" stroke-color="#3B82F6" />
            </div>

            <div>
              <div class="flex justify-between items-center text-xs font-bold mb-1">
                <span class="text-slate-600">工业生产基本动力用电 (Machinery Load)</span>
                <span class="text-slate-800 font-mono">150.0 kW / 35.7%</span>
              </div>
              <a-progress :percent="36" :show-info="false" stroke-color="#F59E0B" />
            </div>

            <div>
              <div class="flex justify-between items-center text-xs font-bold mb-1">
                <span class="text-slate-600">厂房动力柜温控及风机组 HVAC load</span>
                <span class="text-slate-800 font-mono">60.0 kW / 14.3%</span>
              </div>
              <a-progress :percent="14" :show-info="false" stroke-color="#8B5CF6" />
            </div>

            <div>
              <div class="flex justify-between items-center text-xs font-bold mb-1">
                <span class="text-slate-600">站内待机监控、边缘心跳自耗能 (Self consumption)</span>
                <span class="text-slate-800 font-mono">30.0 kW / 7.2%</span>
              </div>
              <a-progress :percent="7" :show-info="false" stroke-color="#64748B" />
            </div>
          </div>
        </div>

        <div class="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
          <div>
            <h4 class="text-xs font-bold text-slate-800 mb-1.5 font-sans">分路能耗健康对位评估：</h4>
            <div class="text-[11px] text-slate-500 leading-normal space-y-1">
              <p>• 充电桩有功负能具备高频震荡和潮涌发生性，属于重点联控防爆负载。</p>
              <p>• 储能PCS工作在自律充电动作时，会被等效记入站内负能。通过分路隔离防止引起总漏电越阶触发。</p>
            </div>
          </div>
          <a-tag color="success" class="w-fit m-0">并网漏电监测正常 / 耐压 0V 无接地 fault</a-tag>
        </div>
      </div>
    </div>

    <!-- TAB 3: 最大合同限制需量 (高保真主推交互) -->
    <div v-if="activeSubTab === 'demand'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-5">
      <div class="pb-3 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0 text-red-650">
          <Settings class="text-red-500 animate-pulse" :size="16" />
          大工业最大需量安全防过负自律控制中枢
        </h3>
        <a-tag color="error" class="m-0 font-bold text-[10.5px]">需量负载率 {{ Math.round((currentDemand/900)*100) }}%</a-tag>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 需量控制器 -->
        <div class="space-y-4">
          <p class="text-xs text-slate-500">
            当园区耗能总负荷飙升，引起关口表瞬时有功暴涨，逼近最大合同基本契约需量极值 <span class="font-extrabold text-red-600">900 kW</span> 时：继续维持该负载运行将面临巨额需量罚款！
          </p>

          <div class="p-4 bg-slate-55 rounded-xl border border-slate-150 space-y-3.5 bg-slate-50">
            <div class="font-bold text-xs text-slate-700 flex justify-between">
              <span>关口需量监控值:</span>
              <span class="font-mono text-base font-black text-slate-850" :class="currentDemand > 700 ? 'text-red-600' : 'text-emerald-700'">
                {{ currentDemand }} kW / 900 kW Limit
              </span>
            </div>
            
            <a-progress :percent="Math.round((currentDemand/900)*100)" :stroke-color="currentDemand > 700 ? '#EF4444' : '#10B981'" />
            
            <div class="flex justify-end gap-2 pt-2">
              <a-button 
                type="primary" 
                class="!bg-emerald-600 hover:!bg-emerald-500 !border-none text-xs font-bold !h-9" 
                :disabled="demandReduced"
                @click="mitigateDemand"
              >
                + 启动 BESS 急速应急放能抵消需量
              </a-button>
              <a-button 
                class="text-xs !h-9" 
                v-if="demandReduced" 
                @click="resetDemand"
              >
                恢复原来负载
              </a-button>
            </div>
          </div>
        </div>

        <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-between">
          <div>
            <h4 class="text-xs font-bold text-emerald-800">应急自愈联动评效:</h4>
            <p class="text-xs text-slate-500 mt-2 leading-relaxed">
              这是中节能光储充一体化的王牌联动逻辑。点击左侧的【启动应急放能】，EMS会向 पीसीएस控制器注入强制释放有功指令（释放 120kW 能量抵冲网侧引入），瞬时降低并网关口表测量的需能至安全绿线区！
            </p>
          </div>
          <div class="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <span>减阻收益实现：</span>
            <span class="font-mono font-black" v-if="demandReduced">✅ 精准压降 120 kW 网负能 成功避税！</span>
            <span class="font-normal text-slate-400" v-else>等待操作触...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: 购电成本结算 -->
    <div v-if="activeSubTab === 'cost'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="border-b border-slate-100 pb-3">
        <h3 class="text-sm font-bold text-slate-800 m-0">并网输配电专线及分时累计采购账单</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
          <div>
            <div class="text-xs font-bold text-slate-500">尖/高峰时段采购合并费</div>
            <div class="text-lg font-black font-mono text-slate-700 mt-1">¥ {{ Math.round(globalStore.metrics.gridTodayBuy * 0.6 * 1.05).toLocaleString() }}</div>
          </div>
          <span class="text-[10px] text-red-500 font-bold bg-red-50 px-1 py-0.5 rounded">尖段比例: 60%</span>
        </div>

        <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
          <div>
            <div class="text-xs font-bold text-slate-500">平/谷段时段采购量合并费</div>
            <div class="text-lg font-black font-mono text-slate-700 mt-1">¥ {{ Math.round(globalStore.metrics.gridTodayBuy * 0.4 * 0.45).toLocaleString() }}</div>
          </div>
          <span class="text-[10px] text-[#005BAC] font-bold bg-blue-50 px-1 py-0.5 rounded">谷段比例: 40%</span>
        </div>

        <div class="p-4 bg-violet-50 border border-violet-150 rounded-lg flex justify-between items-center">
          <div>
            <div class="text-xs font-bold text-violet-750">合并市电总计购电账单</div>
            <div class="text-lg font-black font-mono text-[#00BAC] mt-1 text-violet-600">
              ¥ {{ Math.round((globalStore.metrics.gridTodayBuy * 0.6 * 1.05) + (globalStore.metrics.gridTodayBuy * 0.4 * 0.45)).toLocaleString() }}
            </div>
          </div>
          <span class="text-[10px] text-slate-400 font-bold">日循环清算</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { globalStore } from '@/store';
import { Radio, Sun, Battery, Workflow, Settings } from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';

const subTabs = [
  { label: '并网购售电潮流', value: 'overview' },
  { label: '变网负载分支出线', value: 'load' },
  { label: '最大合同需量限控', value: 'demand' },
  { label: '批发购能差损账单', value: 'cost' }
];

const activeSubTab = ref('overview');

// 需量应急调度模拟
const currentDemand = ref(globalStore.metrics.currentDemand);
const demandReduced = ref(false);

const mitigateDemand = () => {
  message.loading({ content: '正在为电池PCS变流器注入急速有功放电防线 120kW...', duration: 1.2 })
    .then(() => {
      currentDemand.value -= 120;
      demandReduced.value = true;
      message.success({ content: '应急压能成功！主变压器网侧需用有功降至 640 kW，完美回避越界罚款！', duration: 4.5 });
    });
};

const resetDemand = () => {
  currentDemand.value = globalStore.metrics.currentDemand;
  demandReduced.value = false;
  message.info('放电指令撤销，关口需量恢复园区真实负载值。');
};

// ECharts
const gridChartRef = ref<HTMLDivElement | null>(null);
let gridChart: echarts.ECharts | null = null;

const initGridChart = () => {
  if (!gridChartRef.value) return;
  if (gridChart) gridChart.dispose();
  
  gridChart = echarts.init(gridChartRef.value);
  const mult = globalStore.activeSiteKey === 'site-01' ? 1.0 : globalStore.activeSiteKey === 'site-02' ? 0.6 : 0.8;
  
  const buyData = [120*mult, 100*mult, 150*mult, 250*mult, 410*mult, 350*mult, 320*mult, 390*mult, 420*mult, 430*mult, 210*mult, 140*mult];
  const sellData = [0, 5*mult, 5*mult, 20*mult, 35*mult, 42*mult, 35*mult, 10*mult, 5*mult, 0, 0, 0];
  const hrs = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['电网采购有功 (kW)', '余绿反送馈网 (kW)'], textStyle: { color: '#64748B' } },
    grid: { left: '3%', right: '2%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: hrs, axisLine: { lineStyle: { color: '#CBD5E1' } } },
    yAxis: { type: 'value', name: '有功极值 (kW)', splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } } },
    series: [
      { name: '电网采购有功 (kW)', type: 'line', smooth: true, itemStyle: { color: '#8B5CF6' }, lineStyle: { width: 3 }, data: buyData },
      { name: '余绿反送馈网 (kW)', type: 'line', smooth: true, itemStyle: { color: '#10B981' }, lineStyle: { width: 2, type: 'dashed' }, data: sellData }
    ]
  };
  gridChart.setOption(option);
};

// 重置需量
watch(() => globalStore.activeSiteKey, (newVal) => {
  currentDemand.value = globalStore.metrics.currentDemand;
  demandReduced.value = false;
});

watch([activeSubTab, () => globalStore.activeSiteKey], () => {
  setTimeout(() => {
    if (activeSubTab.value === 'overview') initGridChart();
  }, 100);
});

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  setTimeout(() => {
    initGridChart();
  }, 100);
  
  resizeObserver = new ResizeObserver(() => {
    gridChart?.resize();
  });
  if (gridChartRef.value) resizeObserver.observe(gridChartRef.value);
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  gridChart?.dispose();
});
</script>

<style scoped>
</style>
