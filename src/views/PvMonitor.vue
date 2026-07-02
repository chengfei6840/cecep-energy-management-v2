<template>
  <div class="space-y-6 font-sans">
    
    <!-- 子页面标签 -->
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

    <!-- TAB 1: 光伏总览 -->
    <div v-if="activeSubTab === 'overview'" class="space-y-6">
      
      <!-- 四个核心遥测器卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-[11px] font-bold text-slate-400 uppercase">当前瞬时出力功率</div>
            <div class="text-xl font-black text-slate-800 font-mono mt-1 pr-1.5">{{ globalStore.metrics.pvPower }} kW</div>
            <div class="text-[10px] text-emerald-600 font-bold mt-1">转换负载率: 68.4%</div>
          </div>
          <div class="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-extrabold shadow-sm"><Sun :size="20" /></div>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-[11px] font-bold text-slate-400">今日累计发电量</div>
            <div class="text-xl font-black text-slate-800 font-mono mt-1">{{ globalStore.metrics.pvTodayEnergy }} kWh</div>
            <div class="text-[10px] text-slate-400 mt-1">昨日同期: 3,110 kWh</div>
          </div>
          <div class="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold shadow-sm"><SunDim :size="20" /></div>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-[11px] font-bold text-slate-400">日均日照辐射比</div>
            <div class="text-xl font-black text-slate-800 font-mono mt-1">785 W/㎡</div>
            <div class="text-[10px] text-emerald-600 font-bold mt-1">状态: 优质日光辐照</div>
          </div>
          <div class="h-10 w-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center font-bold shadow-sm"><Lightbulb :size="18" /></div>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div>
            <div class="text-[11px] font-bold text-slate-400">一期逆变器在线总数</div>
            <div class="text-xl font-black text-slate-800 font-mono mt-1">2台 / 正常运行</div>
            <div class="text-[10px] text-slate-400 mt-1">离损率: 0.00% 无故障</div>
          </div>
          <div class="h-10 w-10 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center font-bold shadow-sm"><Inbox :size="18" /></div>
        </div>
      </div>

      <!-- 光伏瞬时出力曲线 -->
      <div class="bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
        <h3 class="text-sm font-bold text-slate-850 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5 m-0">
          <LineChart :size="15" class="text-emerald-600" />
          厂区太阳辐照强度 (W/㎡) 与光伏逆变器有功出力 (kW) 分频对位图
        </h3>
        <div ref="solarChartRef" class="w-full h-80"></div>
      </div>

    </div>

    <!-- TAB 2: 逆变器遥测监测 -->
    <div v-if="activeSubTab === 'inverters'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <Workflow :size="15" class="text-emerald-500" />
          光伏并网分布式逆变设备高频实时测控台
        </h3>
      </div>

      <a-table :data-source="invertersList" :columns="invColumns" size="middle" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge status="success" text="运行中" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button size="small" type="link" class="!text-xs !p-0 text-emerald-600" @click="openTelemetryDrawer(record)">
              详细遥测参参
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- TAB 3: 发电量变化趋势 -->
    <div v-if="activeSubTab === 'trend'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-6">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-850 m-0">月度、季度清洁纯绿发电统计电表</h3>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 统计面板 -->
        <div class="space-y-4">
          <div class="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span class="text-xs text-slate-400 font-medium">累计自发电绿量</span>
            <div class="text-lg font-black font-mono text-slate-700 mt-1">{{ globalStore.metrics.pvTotalEnergy.toLocaleString() }} kWh</div>
          </div>
          <div class="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span class="text-xs text-slate-400 font-medium">相当于节约标煤量</span>
            <div class="text-lg font-black font-mono text-emerald-650 mt-1">{{ Math.round(globalStore.metrics.pvTotalEnergy * 0.402).toLocaleString() }} 吨</div>
          </div>
          <div class="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span class="text-xs text-slate-400 font-medium font-sans">累计温室二氧化碳减排</span>
            <div class="text-lg font-black font-mono text-emerald-650 mt-1">{{ Math.round(globalStore.metrics.pvTotalEnergy * 0.997).toLocaleString() }} 吨</div>
          </div>
        </div>

        <div class="lg:col-span-3">
          <div ref="barChartRef" class="w-full h-80"></div>
        </div>
      </div>
    </div>

    <!-- TAB 4: 自发自用与结算 -->
    <div v-if="activeSubTab === 'revenue'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-5">
      <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <DollarSign :size="15" class="text-amber-500" />
          厂内分布式光储自发自用商业收益清算
        </h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
          <span class="text-xs text-emerald-700 font-bold">厂内 behind-the-meter 完全消纳收益</span>
          <div class="text-xl font-black font-mono text-slate-700 pt-1.5">¥ {{ Math.round(globalStore.metrics.pvTodayEnergy * 0.85 * 0.85).toLocaleString() }}</div>
          <p class="text-[10px] text-emerald-600 mt-1 opacity-90">消纳量: {{ Math.round(globalStore.metrics.pvTodayEnergy * 0.85) }} kWh (自消率: 85%)</p>
        </div>

        <div class="p-4 bg-blue-50/80 rounded-xl border border-blue-100 space-y-1">
          <span class="text-xs text-blue-700 font-bold">余电上网并网差代款 (FIT Cashback)</span>
          <div class="text-xl font-black font-mono text-slate-700 pt-1.5">¥ {{ Math.round(globalStore.metrics.pvTodayEnergy * 0.15 * 0.415).toLocaleString() }}</div>
          <p class="text-[10px] text-blue-600 mt-1 opacity-90">返网量: {{ Math.round(globalStore.metrics.pvTodayEnergy * 0.15) }} kWh (返网率: 15%)</p>
        </div>

        <div class="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-1">
          <span class="text-xs text-amber-900 font-bold">光伏合并日节省电税收益</span>
          <div class="text-xl font-black font-mono text-amber-500 pt-1.5">¥ {{ Math.round((globalStore.metrics.pvTodayEnergy * 0.85 * 0.85) + (globalStore.metrics.pvTodayEnergy * 0.15 * 0.415)).toLocaleString() }}</div>
          <p class="text-[10px] text-slate-500 mt-1">财务公式：自消省税额 + 返网补贴额</p>
        </div>
      </div>

      <div class="p-4 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-500 mt-4 border border-slate-150">
        <div class="font-bold text-slate-700 mb-2">绿电资产运作逻辑：</div>
        由1号及2号并网柜输出，AC直接汇流至园区并网总回路供星络充电桩及生产设备实时消能。因为该省税额远超0.415元/KWh，所以园区系统自平衡策略配置为：<span class="text-emerald-600 font-bold">自发自用、余电纯充、竭诚不返网</span>。
      </div>
    </div>

    <!-- 逆变器遥测详细 Drawer 面板 -->
    <a-drawer
      v-model:open="isDrawerOpen"
      title="300kW光伏逆变器通信及详细遥测监视板"
      placement="right"
      width="450"
    >
      <div v-if="selectedInverter" class="space-y-5">
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div class="text-xs text-slate-400">设备代号: {{ selectedInverter.id }}</div>
          <h4 class="text-sm font-bold text-slate-800 mt-1">{{ selectedInverter.name }}</h4>
        </div>

        <h4 class="text-xs font-bold text-slate-500 uppercase pb-1 border-b border-slate-100">交流侧采样指标 (AC Side)</h4>
        <div class="grid grid-cols-2 gap-3.5 text-xs text-slate-550">
          <div>交流 A 相电压: <span class="font-bold font-mono text-slate-850">231.5 V</span></div>
          <div>并网交流频率: <span class="font-bold font-mono text-slate-850">50.02 Hz</span></div>
          <div>逆变瞬时有功: <span class="font-bold font-mono text-emerald-600">{{ Math.round(globalStore.metrics.pvPower / 2) }} kW</span></div>
          <div>转换阻抗率: <span class="font-bold font-mono text-slate-800">0.998 Cosφ</span></div>
        </div>

        <h4 class="text-xs font-bold text-slate-500 uppercase pb-1 border-b border-slate-100">直流电池板输入极值 (DC Strings)</h4>
        <div class="grid grid-cols-2 gap-3.5 text-xs text-slate-550">
          <div>PV1输入电压: <span class="font-bold font-mono text-slate-850">620.5 V</span></div>
          <div>PV1输入电流: <span class="font-bold font-mono text-slate-850">14.2 A</span></div>
          <div>PV2输入电压: <span class="font-bold font-mono text-slate-850">618.0 V</span></div>
          <div>PV2输入电流: <span class="font-bold font-mono text-slate-850">13.8 A</span></div>
        </div>

        <h4 class="text-xs font-bold text-slate-500 uppercase pb-1 border-b border-slate-100">箱内环境与寿命指标</h4>
        <div class="grid grid-cols-2 gap-3.5 text-xs text-slate-550">
          <div>IGBT核心箱温: <span class="font-bold font-mono text-slate-850">42.5 ℃</span></div>
          <div>绝缘配电电阻: <span class="font-bold font-mono text-slate-850">32 MΩ</span></div>
        </div>
        
        <div class="p-3.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-xs text-emerald-700 leading-normal">
          当前链路状态完美：主通信轮询延迟 42ms，固德威 API 状态对齐无缺失。
        </div>
      </div>
    </a-drawer>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { globalStore } from '@/store';
import { Sun, SunDim, Lightbulb, Inbox, LineChart, Workflow, DollarSign } from 'lucide-vue-next';
import * as echarts from 'echarts';

const subTabs = [
  { label: '光伏智能总览', value: 'overview' },
  { label: '逆变器并网遥测', value: 'inverters' },
  { label: '发电周月趋势表', value: 'trend' },
  { label: '绿电自消消纳收益', value: 'revenue' }
];

const activeSubTab = ref('overview');

const invertersList = [
  { id: 'PV-INV-001', name: '1号-300kW光伏逆变器', site: '中节能光储充示范站', kw: '145.2 kW', power: '2,680 kWh', voltage: '620V / 380V', update: '刚刚' },
  { id: 'PV-INV-002', name: '2号-300kW光伏逆变器', site: '中节能光储充示范站', kw: '141.3 kW', power: '2,580 kWh', voltage: '618V / 380V', update: '1分钟前' }
];

const invColumns = [
  { title: '独立资产编号', dataIndex: 'id', key: 'id', fontWeight: 'bold' },
  { title: '逆变器登记名', dataIndex: 'name', key: 'name' },
  { title: '所在示范站', dataIndex: 'site', key: 'site' },
  { title: '瞬时输出交流功率', dataIndex: 'kw', key: 'kw' },
  { title: '今日发电量累计', dataIndex: 'power', key: 'power' },
  { title: '直流/交流耐压', dataIndex: 'voltage', key: 'voltage' },
  { title: '高频心跳时间', dataIndex: 'update', key: 'update' },
  { title: '动作区', key: 'action' }
];

// Detail Drawer
const isDrawerOpen = ref(false);
const selectedInverter = ref<any>(null);

const openTelemetryDrawer = (record: any) => {
  selectedInverter.value = record;
  isDrawerOpen.value = true;
};

// ECharts
const solarChartRef = ref<HTMLDivElement | null>(null);
const barChartRef = ref<HTMLDivElement | null>(null);

let solarChart: echarts.ECharts | null = null;
let barChart: echarts.ECharts | null = null;

const initSolarChart = () => {
  if (!solarChartRef.value) return;
  if (solarChart) solarChart.dispose();
  
  solarChart = echarts.init(solarChartRef.value);
  
  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  const mult = globalStore.activeSiteKey === 'site-01' ? 1.0 : globalStore.activeSiteKey === 'site-02' ? 0.6 : 0.8;
  const powerData = [20*mult, 110*mult, 240*mult, 280*mult, 260*mult, 150*mult, 10*mult];
  const irrData = [180, 420, 780, 850, 720, 390, 80];
  
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['逆变AC有功 (kW)', '大气太阳辐能 (W/㎡)'], textStyle: { color: '#64748B' } },
    grid: { left: '4%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: hours, axisLine: { lineStyle: { color: '#CBD5E1' } } },
    yAxis: [
      { type: 'value', name: '有功出力 (kW)', splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } } },
      { type: 'value', name: '辐射强度 (W/㎡)', splitLine: { show: false } }
    ],
    series: [
      { name: '逆变AC有功 (kW)', type: 'line', smooth: true, itemStyle: { color: '#10B981' }, lineStyle: { width: 3 }, data: powerData },
      { name: '大气太阳辐能 (W/㎡)', type: 'bar', yAxisIndex: 1, itemStyle: { color: 'rgba(245, 158, 11, 0.45)' }, barWidth: '35%', data: irrData }
    ]
  };
  solarChart.setOption(option);
};

const initBarChart = () => {
  if (!barChartRef.value) return;
  if (barChart) barChart.dispose();
  
  barChart = echarts.init(barChartRef.value);
  const mult = globalStore.activeSiteKey === 'site-01' ? 1.0 : globalStore.activeSiteKey === 'site-02' ? 0.6 : 0.8;
  
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '4%', right: '2%', bottom: '10%', top: '8%', containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月'], axisLine: { lineStyle: { color: '#E2E8F0' } } },
    yAxis: { type: 'value', name: '发电量 (kWh)', splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } } },
    series: [{
      name: '累计产量',
      type: 'bar',
      barWidth: '40%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#10B981' },
          { offset: 1, color: '#059669' }
        ]),
        borderRadius: [4, 4, 0, 0]
      },
      data: [35000*mult, 42000*mult, 56000*mult, 72000*mult, 92000*mult]
    }]
  };
  
  barChart.setOption(option);
};

watch([activeSubTab, () => globalStore.activeSiteKey], () => {
  setTimeout(() => {
    if (activeSubTab.value === 'overview') initSolarChart();
    if (activeSubTab.value === 'trend') initBarChart();
  }, 100);
});

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  setTimeout(() => {
    initSolarChart();
  }, 100);
  
  resizeObserver = new ResizeObserver(() => {
    solarChart?.resize();
    barChart?.resize();
  });
  if (solarChartRef.value) resizeObserver.observe(solarChartRef.value);
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  solarChart?.dispose();
  barChart?.dispose();
});
</script>

<style scoped>
</style>
