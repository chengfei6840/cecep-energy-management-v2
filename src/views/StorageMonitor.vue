<template>
  <div class="space-y-6 font-sans">
    
    <!-- 子标签 -->
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

    <!-- TAB 1: 储能核心总览 -->
    <div v-if="activeSubTab === 'overview'" class="space-y-6">
      
      <!-- 指标行 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400">目前蓄电荷比 (SoC)</span>
            <BatteryMedium class="text-emerald-500" :size="20" />
          </div>
          <div class="mt-3 flex items-baseline gap-1.5">
            <span class="text-2xl font-black font-mono text-slate-800">{{ globalStore.metrics.essSoc }}%</span>
            <span class="text-[10px] text-slate-400">剩余电量: 780 kWh</span>
          </div>
          <!-- 电池柱 -->
          <div class="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" :style="{ width: globalStore.metrics.essSoc + '%' }"></div>
          </div>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400">变流有功充放电功率</span>
            <Activity class="text-[#005BAC]" :size="18" />
          </div>
          <div class="mt-3 flex items-baseline gap-1.5">
            <span class="text-2xl font-black font-mono" :class="globalStore.metrics.essPower > 0 ? 'text-[#005BAC]' : 'text-emerald-600'">
              {{ globalStore.metrics.essPower }} kW
            </span>
          </div>
          <p class="text-[10px] text-slate-400 mt-2">动作: {{ globalStore.metrics.essPower > 0 ? '向园区放电削峰' : '市电谷时补电充电' }}</p>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400">今日循环吞吐充放</span>
            <RefreshCw class="text-violet-500" :size="16" />
          </div>
          <div class="mt-3 flex gap-4 text-xs font-bold font-mono">
            <div>充: <span class="text-[#005BAC]">{{ globalStore.metrics.essTodayCharge }} kWh</span></div>
            <div>放: <span class="text-emerald-600">{{ globalStore.metrics.essTodayDischarge }} kWh</span></div>
          </div>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400">自动运行模式 (EMS Status)</span>
            <ShieldAlert class="text-blue-500" :size="18" />
          </div>
          <div class="mt-3 font-semibold text-xs text-slate-800">
            峰谷自适应双循环套利
          </div>
          <div class="text-[10px] text-emerald-600 font-bold mt-1 inline-block">系统判定: 自律控制中</div>
        </div>
      </div>

      <!-- 充放电曲线 -->
      <div class="bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5 m-0">
          <TrendingUp :size="15" class="text-emerald-600" />
          24h电池SoC电容百分比变动与有功变频转换曲线
        </h3>
        <div ref="essChartRef" class="w-full h-80"></div>
      </div>

    </div>

    <!-- TAB 2: PCS柜遥测 -->
    <div v-if="activeSubTab === 'pcs'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="pb-2 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-850 m-0">500kW中压并网交直流PCS变流控制台</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-4 bg-slate-50 rounded-xl space-y-3.5">
          <h4 class="text-xs font-bold text-slate-700 m-0">PCS-001 常用交流端遥测：</h4>
          <div class="grid grid-cols-2 gap-3.5 text-xs text-slate-550">
            <div>网侧线电压 A-B: <span class="font-bold font-mono text-slate-805">400.2 V</span></div>
            <div>网侧线电流 A: <span class="font-bold font-mono text-slate-805">173.2 A</span></div>
            <div>瞬时有功功率: <span class="font-bold font-mono text-slate-805">{{ globalStore.metrics.essPower }} kW</span></div>
            <div>瞬时无功功率: <span class="font-bold font-mono text-slate-805">4.2 kVar</span></div>
            <div>工作交流电频: <span class="font-bold font-mono text-slate-805">50.01 Hz</span></div>
            <div>逆变平均功率因数: <span class="font-bold font-mono text-slate-805">0.999 Cosφ</span></div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 rounded-xl space-y-3.5">
          <h4 class="text-xs font-bold text-slate-700 m-0">IGBT桥温温控及网卡指标：</h4>
          <div class="grid grid-cols-2 gap-3.5 text-xs text-slate-550">
            <div>IGBT表面热斑温度: <span class="font-bold font-mono text-slate-805">52.3 ℃</span></div>
            <div>柜内控制冷却风道: <span class="font-bold text-emerald-600 font-semibold">自律空冷中</span></div>
            <div>电网相位角: <span class="font-bold font-mono text-slate-805">0.24 Deg</span></div>
            <div>配网联锁保护: <span class="font-bold text-emerald-600 font-semibold">✅ 安全闭锁正常</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: BMS电池状态 -->
    <div v-if="activeSubTab === 'bms'" class="space-y-6">
      
      <div class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
        <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-850 m-0">1.2MWh 磷酸铁锂高压电池簇遥测量明细</h3>
          <a-tag color="success" class="m-0 text-[10px] font-bold">通信健康度 100%</a-tag>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div class="text-[10px] text-slate-400 font-bold">全簇最高电芯电压</div>
            <div class="text-sm font-black font-sans text-slate-800 mt-1">3.42 V <span class="text-[10px] font-normal text-slate-400">(第24单体)</span></div>
          </div>
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div class="text-[10px] text-slate-400 font-bold">全簇最低电芯电压</div>
            <div class="text-sm font-black font-sans text-slate-800 mt-1">3.39 V <span class="text-[10px] font-normal text-slate-400">(第82单体)</span></div>
          </div>
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div class="text-[10px] text-slate-400 font-bold">最高热斑探测传感器</div>
            <div class="text-sm font-black font-sans text-slate-800 mt-1">32.5 ℃ <span class="text-[10px] font-normal text-slate-400">(4号电池包)</span></div>
          </div>
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div class="text-[10px] text-slate-400 font-bold">堆极绝缘测试值</div>
            <div class="text-sm font-black font-sans text-emerald-605 mt-1">> 48 MΩ <span class="text-[10px] font-semibold text-emerald-600">(就绪)</span></div>
          </div>
        </div>

        <a-table :data-source="mockBmsData" :columns="bmsColumns" size="small" :pagination="false" />
      </div>

    </div>

    <!-- TAB 4: 峰谷差套利收益 -->
    <div v-if="activeSubTab === 'revenue'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-5">
      <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <DollarSign :size="15" class="text-amber-500" />
          能储削峰填谷日综合财务清算细
        </h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
          <span class="text-xs text-emerald-700 font-bold">谷段充电成本电费 (深夜自市电吸收)</span>
          <div class="text-xl font-black font-mono text-slate-700 pt-1.5">¥ {{ Math.round(globalStore.metrics.essTodayCharge * 0.32).toLocaleString() }}</div>
          <p class="text-[10px] text-slate-400 mt-1">吞吐量: {{ globalStore.metrics.essTodayCharge }} kWh × ¥0.32</p>
        </div>

        <div class="p-4 bg-blue-50/80 rounded-xl border border-blue-100 space-y-1">
          <span class="text-xs text-blue-700 font-bold">尖峰时分有功充顶替省税 (取代购电)</span>
          <div class="text-xl font-black font-mono text-slate-700 pt-1.5">¥ {{ Math.round(globalStore.metrics.essTodayDischarge * 1.15).toLocaleString() }}</div>
          <p class="text-[10px] text-slate-400 mt-1">释出量: {{ globalStore.metrics.essTodayDischarge }} kWh × ¥1.15</p>
        </div>

        <div class="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-1">
          <span class="text-xs text-amber-900 font-bold">能储日合并套利收益净利</span>
          <div class="text-xl font-black font-mono text-amber-500 pt-1.5">
            ¥ {{ Math.round((globalStore.metrics.essTodayDischarge * 1.15) - (globalStore.metrics.essTodayCharge * 0.32)).toLocaleString() }}
          </div>
          <p class="text-[10px] text-slate-500 mt-1">日峰谷单循环折损及变压损损均已扣除</p>
        </div>
      </div>
      
      <div class="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-500 mt-4 leading-relaxed">
        <div class="font-bold text-slate-700 mb-1.5">运营策略报告:</div>
        电池系统今日于 <span class="font-bold text-slate-700">00:00-05:00</span> 谷段进行初轮完全恒流恒压充电，SoC被拔高至95%；随后在中午 <span class="font-bold text-slate-705">11:30-13:30</span> 网侧尖峰段，主动响应变流释放240kW功率抵冲，成功完成一轮完全放电，完成了完美的绿能移峰。
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { globalStore } from '@/store';
import { BatteryMedium, Activity, RefreshCw, ShieldAlert, TrendingUp, DollarSign } from 'lucide-vue-next';
import * as echarts from 'echarts';

const subTabs = [
  { label: '能储系统总览', value: 'overview' },
  { label: 'PCS柜交直遥测', value: 'pcs' },
  { label: 'BMS电池智能监测', value: 'bms' },
  { label: '峰谷差自消充退套利', value: 'revenue' }
];

const activeSubTab = ref('overview');

// BMS mock
const mockBmsData = [
  { key: '1', name: '电池簇 No.1-1', volts: '725 V', amps: '120 A', soc: '68.0%', temp: '32.1 ℃', soh: '98.5%', bmsStatus: '常高平衡' },
  { key: '2', name: '电池簇 No.1-2', volts: '724 V', amps: '119 A', soc: '67.8%', temp: '31.9 ℃', soh: '98.4%', bmsStatus: '常高平衡' },
  { key: '3', name: '电池簇 No.1-3', volts: '726 V', amps: '121 A', soc: '68.2%', temp: '32.5 ℃', soh: '98.3%', bmsStatus: '常高平衡' }
];

const bmsColumns = [
  { title: '独立高压簇代号', dataIndex: 'name', key: 'name', fontWeight: 'bold' },
  { title: '簇总配耐压', dataIndex: 'volts', key: 'volts font-mono' },
  { title: '簇直驱电流', dataIndex: 'amps', key: 'amps font-mono' },
  { title: '簇独立SoC率', dataIndex: 'soc', key: 'soc font-mono' },
  { title: '最高单体片温', dataIndex: 'temp', key: 'temp font-mono' },
  { title: '电池寿命 SoH', dataIndex: 'soh', key: 'soh font-mono' },
  { title: '簇自愈均衡器状态', dataIndex: 'bmsStatus', key: 'bmsStatus' }
];

// Chart
const essChartRef = ref<HTMLDivElement | null>(null);
let essChart: echarts.ECharts | null = null;

const initEssChart = () => {
  if (!essChartRef.value) return;
  if (essChart) essChart.dispose();
  
  essChart = echarts.init(essChartRef.value);
  const mult = globalStore.activeSiteKey === 'site-01' ? 1.0 : globalStore.activeSiteKey === 'site-02' ? 0.6 : 0.8;
  
  const originalSoc = [92, 35, 30, 28, 48, 85, 95, 80, 68, 68, 80, 92];
  const socData = originalSoc.map(v => Math.min(100, Math.round(v * (mult * 0.4 + 0.6))));
  const powerData = [120*mult, 0, -150*mult, -200*mult, 0, 150*mult, 180*mult, 0, -120*mult, -120*mult, 80*mult, 120*mult];
  
  const hrs = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['电量SoC (%)', '功率Active (kW, +放/-充)'], textStyle: { color: '#64748B' } },
    grid: { left: '4%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: hrs, axisLine: { lineStyle: { color: '#CBD5E1' } } },
    yAxis: [
      { type: 'value', name: '百分比 SoC', max: 100, splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } } },
      { type: 'value', name: '功率 Active (kW)', splitLine: { show: false } }
    ],
    series: [
      { name: '电量SoC (%)', type: 'line', smooth: true, itemStyle: { color: '#10B981' }, lineStyle: { width: 3.5 }, data: socData },
      { name: '功率Active (kW, +放/-充)', type: 'bar', yAxisIndex: 1, itemStyle: { color: 'rgba(59, 130, 246, 0.45)' }, barWidth: '35%', data: powerData }
    ]
  };
  essChart.setOption(option);
};

watch([activeSubTab, () => globalStore.activeSiteKey], () => {
  setTimeout(() => {
    if (activeSubTab.value === 'overview') initEssChart();
  }, 100);
});

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  setTimeout(() => {
    initEssChart();
  }, 100);
  
  resizeObserver = new ResizeObserver(() => {
    essChart?.resize();
  });
  if (essChartRef.value) resizeObserver.observe(essChartRef.value);
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  essChart?.dispose();
});
</script>

<style scoped>
</style>
