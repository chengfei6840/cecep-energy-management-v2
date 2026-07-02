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

    <!-- TAB 1: 充电站智能总览 -->
    <div v-if="activeSubTab === 'overview'" class="space-y-6">
      
      <!-- 指标卡片行 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-400">一期充电设备总数</span>
          <div class="text-xl font-black text-slate-800 mt-2 font-mono">{{ globalStore.metrics.chargerCount }} 台</div>
          <span class="text-[10px] text-slate-400 mt-1">含直流快充 / 交流慢充</span>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-400">目前空闲可充桩数</span>
          <div class="text-xl font-black text-emerald-600 mt-2 font-mono">{{ globalStore.metrics.chargerOnline - globalStore.metrics.chargerOccupied }} 枪</div>
          <span class="text-[10px] text-emerald-600 font-bold mt-1">终端健康度 100%</span>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-400">目前车辆占用充电</span>
          <div class="text-xl font-black text-blue-600 mt-2 font-mono">{{ globalStore.metrics.chargerOccupied }} 辆</div>
          <span class="text-[10px] text-blue-600 font-bold mt-1">站内高频峰段占用率: 50%</span>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-slate-400">今日累计加注绿电</span>
          <div class="text-xl font-black text-slate-850 mt-2 font-mono">{{ globalStore.metrics.chargerTodayEnergy }} kWh</div>
          <span class="text-[10px] text-slate-400 mt-1">消纳绿电占比: 100%</span>
        </div>

        <div class="bg-white p-4.5 rounded-xl border border-slate-150 shadow-sm flex flex-col justify-between border-l-4 border-l-[#005BAC]">
          <span class="text-xs font-bold text-slate-400">今日运营结算合并</span>
          <div class="text-xl font-black text-[#005BAC] mt-2 font-mono">¥ {{ globalStore.metrics.chargerTodayRevenue }}</div>
          <span class="text-[10px] text-slate-400 mt-1">均价: ¥ 2.11 /度</span>
        </div>
      </div>

      <!-- 堆积耗能曲线 -->
      <div class="bg-white p-5 rounded-xl border border-slate-150 shadow-sm">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5 m-0">
          <TrendingUp :size="15" class="text-emerald-600" />
          示范厂区快充/慢充桩瞬时引流负荷 (kW) 通勤高峰堆叠曲线
        </h3>
        <div ref="chargingChartRef" class="w-full h-80"></div>
      </div>

    </div>

    <!-- TAB 2: 充电桩资产名录 -->
    <div v-if="activeSubTab === 'piles'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <Workflow :size="15" class="text-[#005BAC]" />
          快速直流/慢速交流充能总配电控制与遥信台账
        </h3>
      </div>

      <a-table :data-source="mockPiles" :columns="pileColumns" size="middle" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '运行' ? 'success' : record.status === '待机' ? 'processing' : 'error'">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex items-center gap-2">
              <a-button size="small" type="link" class="!text-xs !p-0 text-[#005BAC]" @click="remoteRestartPile(record.id)">
                远程自愈重拨
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- TAB 3: 用户订单流水 -->
    <div v-if="activeSubTab === 'orders'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-4 space-y-4">
      <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 m-0">快速充电桩交易记账明细</h3>
      </div>
      
      <a-table :data-source="ordersList" :columns="orderColumns" size="middle" :pagination="{ pageSize: 5 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'paymentStatus'">
            <a-badge :status="record.paymentStatus === '已支付' ? 'success' : 'warning'" :text="record.paymentStatus" />
          </template>
          <template v-else-if="column.key === 'orderStatus'">
            <a-tag :color="record.orderStatus === '已完成' ? 'blue' : 'orange'">
              {{ record.orderStatus }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </div>

    <!-- TAB 4: 充电电费及运营结算 -->
    <div v-if="activeSubTab === 'revenue'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-5">
      <div class="border-b border-slate-100 pb-3">
        <h3 class="text-sm font-bold text-slate-800 m-0">充电服务附加税与基础电价并网收益拆解</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
          <span class="text-xs text-blue-700 font-bold">基本充能差省电费 (回笼基础输配电)</span>
          <div class="text-xl font-black font-mono text-slate-705 pt-1.5">¥ {{ Math.round(globalStore.metrics.chargerTodayRevenue * 0.75).toLocaleString() }}</div>
          <p class="text-[10px] text-slate-400 mt-1">占比份额: 75% 厂房回收代扣</p>
        </div>

        <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
          <span class="text-xs text-emerald-700 font-bold">快慢充电桩自主运营服务服务商返利</span>
          <div class="text-xl font-black font-mono text-slate-705 pt-1.5">¥ {{ Math.round(globalStore.metrics.chargerTodayRevenue * 0.25).toLocaleString() }}</div>
          <p class="text-[10px] text-emerald-600 font-bold mt-1">占比份额: 25% 平台增值服务税</p>
        </div>

        <div class="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-1">
          <span class="text-xs text-amber-900 font-bold">示范桩群日合并收益结算</span>
          <div class="text-xl font-black font-mono text-amber-500 pt-1.5">¥ {{ globalStore.metrics.chargerTodayRevenue }}</div>
          <p class="text-[10px] text-slate-500 mt-1">财务结算中心每日夜零点自动勾兑</p>
        </div>
      </div>
      
      <!-- 财务对齐协议 -->
      <div class="p-3.5 bg-slate-50 border border-slate-250 rounded-lg text-xs leading-relaxed text-slate-550">
        • 全站点一期充电收益与第三方平台（星络、运营商）完成100.0%的数据级安全勾稽，每笔由于在桩释放的绿电均可被自动溯源，实现绿色减耗证书自动溯源、结算、返提款闭环。
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { globalStore } from '@/store';
import { mockOrders } from '@/mock/data';
import { Workflow, TrendingUp } from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';

const subTabs = [
  { label: '充电桩群总览', value: 'overview' },
  { label: '终端联控台账', value: 'piles' },
  { label: '用户交易订单', value: 'orders' },
  { label: '并网运营结算', value: 'revenue' }
];

const activeSubTab = ref('overview');

const mockPiles = ref([
  { id: 'EVCS-001', name: '120kW双枪直流快充桩01', type: '分布式直流快卡', plugs: '2枪', status: '运行', kw: '68.5 kW', current: '145 A', sum: '420 kWh' },
  { id: 'EVCS-002', name: '120kW双枪直流快充桩02', type: '分布式直流快卡', plugs: '2枪', status: '待机', kw: '0.0 kW', current: '0 A', sum: '380 kWh' },
  { id: 'EVCS-003', name: '7kW单相交流慢充桩01', type: '便携挂箱交流慢充', plugs: '1枪', status: '运行', kw: '6.2 kW', current: '28 A', sum: '56 kWh' }
]);

const pileColumns = [
  { title: '独立终端编号', dataIndex: 'id', key: 'id', fontWeight: 'bold' },
  { title: '充电桩登记全称', dataIndex: 'name', key: 'name' },
  { title: '设备分类', dataIndex: 'type', key: 'type' },
  { title: '枪口配量', dataIndex: 'plugs', key: 'plugs' },
  { title: '心跳状态', dataIndex: 'status', key: 'status' },
  { title: '瞬时输出交流功率', dataIndex: 'kw', key: 'kw' },
  { title: '当前反馈输出阻抗', dataIndex: 'current', key: 'current' },
  { title: '今日充放电电能累计', dataIndex: 'sum', key: 'sum' },
  { title: '远程接退控', key: 'action' }
];

const remoteRestartPile = (id: string) => {
  message.loading({ content: `正在触发对充配端网卡【${id}】的自愈序列命令...`, duration: 1 })
    .then(() => {
      message.success(`设备【${id}】远程心跳重新拨码握手成功，清空 transient error 成功。`);
    });
};

const ordersList = ref([...mockOrders]);

const orderColumns = [
  { title: '记账订单编号', dataIndex: 'id', key: 'id', fontWeight: 'bold' },
  { title: '承耗终端桩号', dataIndex: 'pileId', key: 'pileId' },
  { title: '充电开始时分', dataIndex: 'startTime', key: 'startTime' },
  { title: '充电终了时分', dataIndex: 'endTime', key: 'endTime' },
  { title: '累计通话时长', dataIndex: 'duration', key: 'duration' },
  { title: '加注能电度 (kWh)', dataIndex: 'energy', key: 'energy' },
  { title: '订单金额合计 (元)', dataIndex: 'amount', key: 'amount' },
  { title: '支付状态', dataIndex: 'paymentStatus', key: 'paymentStatus' },
  { title: '交易终态', dataIndex: 'orderStatus', key: 'orderStatus' }
];

// ECharts
const chargingChartRef = ref<HTMLDivElement | null>(null);
let chargingChart: echarts.ECharts | null = null;

const initChargingChart = () => {
  if (!chargingChartRef.value) return;
  if (chargingChart) chargingChart.dispose();
  
  chargingChart = echarts.init(chargingChartRef.value);
  const mult = globalStore.activeSiteKey === 'site-01' ? 1.0 : globalStore.activeSiteKey === 'site-02' ? 0.6 : 0.8;
  
  const fastData = [10*mult, 10*mult, 5*mult, 45*mult, 110*mult, 180*mult, 160*mult, 110*mult, 140*mult, 190*mult, 80*mult, 20*mult];
  const slowData = [5*mult, 8*mult, 12*mult, 15*mult, 18*mult, 22*mult, 20*mult, 15*mult, 18*mult, 24*mult, 15*mult, 8*mult];
  const xHrs = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  
  const option: echarts.EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['120kW直流快充累和', '7kW交流慢充累和'], textStyle: { color: '#64748B' } },
    grid: { left: '3%', right: '2%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: xHrs, axisLine: { lineStyle: { color: '#CBD5E1' } } },
    yAxis: { type: 'value', name: '总取能功率 (kW)', splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } } },
    series: [
      {
        name: '120kW直流快充累和',
        type: 'line',
        stack: 'total',
        areaStyle: {},
        smooth: true,
        itemStyle: { color: '#3B82F6' },
        data: fastData
      },
      {
        name: '7kW交流慢充累和',
        type: 'line',
        stack: 'total',
        areaStyle: {},
        smooth: true,
        itemStyle: { color: '#10B981' },
        data: slowData
      }
    ]
  };
  chargingChart.setOption(option);
};

watch([activeSubTab, () => globalStore.activeSiteKey], () => {
  setTimeout(() => {
    if (activeSubTab.value === 'overview') initChargingChart();
  }, 100);
});

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  setTimeout(() => {
    initChargingChart();
  }, 100);
  
  resizeObserver = new ResizeObserver(() => {
    chargingChart?.resize();
  });
  if (chargingChartRef.value) resizeObserver.observe(chargingChartRef.value);
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  chargingChart?.dispose();
});
</script>

<style scoped>
</style>
