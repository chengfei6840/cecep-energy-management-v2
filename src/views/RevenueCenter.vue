<template>
  <div class="space-y-6 font-sans">
    
    <!-- 子页签 -->
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

    <!-- TAB 1: 收益汇总看板 -->
    <div v-if="activeSubTab === 'summary'" class="space-y-6">
      
      <!-- 四核指标 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm">
          <div class="text-[11px] font-bold text-slate-400">一期月合并综合收益</div>
          <div class="text-xl font-black text-slate-850 mt-1 font-mono">¥ {{ (globalStore.metrics.chargerTodayRevenue * 30 + 12000).toLocaleString() }}</div>
          <span class="text-[10px] text-emerald-600 font-bold mt-1">达成月度预决算: 104.2%</span>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm">
          <div class="text-[11px] font-bold text-slate-400">今日充电枪服务费净收益</div>
          <div class="text-xl font-black text-slate-850 mt-1 font-mono">¥ {{ Math.round(globalStore.metrics.chargerTodayRevenue * 0.25) }}</div>
          <span class="text-[10px] text-slate-400 mt-1">占比加总充电费 25.0%</span>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm">
          <div class="text-[11px] font-bold text-slate-400">今日峰谷套利节约出线</div>
          <div class="text-xl font-black text-slate-850 mt-1 font-mono">¥ {{ Math.round(globalStore.metrics.essTodayDischarge * 0.83) }}</div>
          <span class="text-[10px] text-emerald-600 font-bold mt-1">相当于月省 2 万基本折损</span>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm">
          <div class="text-[11px] font-bold text-slate-400">今日光伏替代大工业省税</div>
          <div class="text-xl font-black text-slate-850 mt-1 font-mono">¥ {{ Math.round(globalStore.metrics.pvTodayEnergy * 0.85 * 0.85) }}</div>
          <span class="text-[10px] text-slate-400 mt-1">综合绿电替代省税加总</span>
        </div>
      </div>

      <!-- 收益分析 ECharts -->
      <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div class="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
            <TrendingUp :size="15" class="text-emerald-650" /> 示范站点月度并网成本及创收套利对位图
          </h3>
          <!-- 切换统计视图 -->
          <div class="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              v-for="btn in viewOptions"
              :key="btn.value"
              @click="activeView = btn.value"
              class="px-2.5 py-1 text-[10px] cursor-pointer rounded-md font-bold transition"
              :class="activeView === btn.value ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-405 hover:text-slate-700'"
            >
              {{ btn.label }}
            </button>
          </div>
        </div>

        <div ref="revenueChartRef" class="w-full h-80"></div>
      </div>

    </div>

    <!-- TAB 2: 账目核验流水 -->
    <div v-if="activeSubTab === 'bills'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-4 space-y-4">
      <div class="border-b border-slate-105 pb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 m-0">一期收益与第三方电费勾稽核减清簿</h3>
        <a-button type="primary" class="!bg-[#005BAC] !border-none font-bold text-xs" @click="mockExportBills">
          导出本月全套财务底账 CSV
        </a-button>
      </div>

      <a-table :data-source="mockDividends" :columns="divColumns" size="middle" :pagination="{ pageSize: 5 }" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { globalStore } from '@/store';
import { TrendingUp } from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';

const subTabs = [
  { label: '多能并网收益汇总', value: 'summary' },
  { label: '财务结算合并账册', value: 'bills' }
];

const activeSubTab = ref('summary');

const viewOptions = [
  { label: '日收益细分', value: 'day' },
  { label: '月收益对阶', value: 'month' }
];
const activeView = ref('month');

const mockDividends = [
  { id: 'REC-001', date: '2026-05-20', pvShare: '¥ 1,840', essArbitrage: '¥ 820', chargingService: '¥ 450', total: '¥ 3,110', status: '对齐已划账' },
  { id: 'REC-002', date: '2026-05-21', pvShare: '¥ 1,920', essArbitrage: '¥ 860', chargingService: '¥ 480', total: '¥ 3,260', status: '对齐已划账' },
  { id: 'REC-003', date: '2026-05-22', pvShare: '¥ 1,730', essArbitrage: '¥ 830', chargingService: '¥ 420', total: '¥ 2,980', status: '核对中' }
];

const divColumns = [
  { title: '单日记账底码', dataIndex: 'id', key: 'id', fontWeight: 'bold' },
  { title: '记账核算账期', dataIndex: 'date', key: 'date' },
  { title: '自发自用光伏折算', dataIndex: 'pvShare', key: 'pvShare' },
  { title: '储能峰谷高套利金额', dataIndex: 'essArbitrage', key: 'essArbitrage' },
  { title: '特来电充电运营服务税', dataIndex: 'chargingService', key: 'chargingService' },
  { title: '合并创收结算 (REC)', dataIndex: 'total', key: 'total' },
  { title: '财务核验终态', dataIndex: 'status', key: 'status' }
];

const mockExportBills = () => {
  message.loading('正在由中节能安全加密隧道抓取全月度关口明细账簿...', 1.5)
    .then(() => {
      message.success('月度结算账单已成功输出。已下载 CECEP_Microgrid_Financial_Audit_202605.xlsx');
    });
};

// ECharts
const revenueChartRef = ref<HTMLDivElement | null>(null);
let revenueChart: echarts.ECharts | null = null;

const initRevenueChart = () => {
  if (!revenueChartRef.value) return;
  if (revenueChart) revenueChart.dispose();
  
  revenueChart = echarts.init(revenueChartRef.value);
  const mult = globalStore.activeSiteKey === 'site-01' ? 1.0 : globalStore.activeSiteKey === 'site-02' ? 0.6 : 0.8;
  
  let xData = ['1月', '2月', '3月', '4月', '5月'];
  let pvArr = [12000*mult, 14000*mult, 16000*mult, 21000*mult, 28000*mult];
  let essArr = [6505*mult, 7200*mult, 8900*mult, 9200*mult, 11000*mult];
  let chgArr = [4200*mult, 4805*mult, 6200*mult, 8100*mult, 9800*mult];
  
  if (activeView.value === 'day') {
    xData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    pvArr = [410, 390, 420, 510, 480, 210, 180].map(v => v * mult);
    essArr = [190, 210, 220, 240, 210, 50, 40].map(v => v * mult);
    chgArr = [120, 145, 160, 210, 180, 240, 210].map(v => v * mult);
  }
  
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['光伏消纳折算', '能储峰谷套利', '平台充能服务租费'], textStyle: { color: '#64748B' } },
    grid: { left: '3%', right: '2%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: xData, axisLine: { lineStyle: { color: '#CBD5E1' } } },
    yAxis: { type: 'value', name: '金额 (¥ 元)', splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } } },
    series: [
      { name: '光伏消纳折算', type: 'bar', stack: 'rev', itemStyle: { color: '#10B981' }, data: pvArr },
      { name: '能储峰谷套利', type: 'bar', stack: 'rev', itemStyle: { color: '#3B82F6' }, data: essArr },
      { name: '平台充能服务租费', type: 'bar', stack: 'rev', itemStyle: { color: '#F59E0B' }, data: chgArr }
    ]
  };
  
  revenueChart.setOption(option);
};

// 重置图表触发
watch([activeSubTab, activeView, () => globalStore.activeSiteKey], () => {
  setTimeout(() => {
    if (activeSubTab.value === 'summary') initRevenueChart();
  }, 100);
});

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  setTimeout(() => {
    initRevenueChart();
  }, 100);
  
  resizeObserver = new ResizeObserver(() => {
    revenueChart?.resize();
  });
  if (revenueChartRef.value) resizeObserver.observe(revenueChartRef.value);
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  revenueChart?.dispose();
});
</script>

<style scoped>
</style>
