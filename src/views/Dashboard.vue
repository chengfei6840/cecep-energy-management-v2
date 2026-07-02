<template>
  <div class="space-y-6 font-sans">
    
    <!-- 1. 核心看板指标网格：根据全球 Store 及时间维度切换，数据自动响应 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <!-- 今日发电量 -->
      <div 
        @click="goToPage('pv')"
        class="bg-white p-5 rounded-lg border border-slate-100 border-l-4 !border-l-[#62B32E] shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group"
      >
        <div class="absolute -right-2 -bottom-2 text-slate-50 opacity-15 group-hover:scale-110 group-hover:opacity-25 transition duration-300">
          <Sun :size="80" class="text-emerald-100" />
        </div>
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded bg-emerald-50 text-[#62B32E] flex items-center justify-center font-bold">
            <Sun :size="20" />
          </div>
          <span class="text-xs font-bold text-slate-400">光伏发电量</span>
        </div>
        <div class="mt-4 flex items-baseline gap-1.5">
          <span class="text-2xl font-bold font-mono text-slate-800">{{ formattedMetrics.pvEnergy }}</span>
          <span class="text-xs text-slate-400 font-medium">kWh</span>
        </div>
        <div class="mt-2 text-[10px] text-[#62B32E] font-bold flex items-center gap-1">
          <span>实时出力: {{ globalStore.metrics.pvPower }} kW</span>
        </div>
      </div>

      <!-- 今日充电桩量 -->
      <div 
        @click="goToPage('charging')"
        class="bg-white p-5 rounded-lg border border-slate-100 border-l-4 !border-l-[#1677FF] shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group"
      >
        <div class="absolute -right-2 -bottom-2 text-slate-50 opacity-15 group-hover:scale-110 group-hover:opacity-25 transition duration-300">
          <Zap :size="80" class="text-blue-100" />
        </div>
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded bg-blue-50 text-[#1677FF] flex items-center justify-center font-bold">
            <Zap :size="20" />
          </div>
          <span class="text-xs font-bold text-slate-400">电动车充电量</span>
        </div>
        <div class="mt-4 flex items-baseline gap-1.5">
          <span class="text-2xl font-bold font-mono text-slate-800">{{ formattedMetrics.chargerEnergy }}</span>
          <span class="text-xs text-slate-400 font-medium">kWh</span>
        </div>
        <div class="mt-2 text-[10px] text-[#1677FF] font-bold flex items-center gap-1">
          <span>枪机在线率: {{ globalStore.metrics.chargerOnline }}/{{ globalStore.metrics.chargerCount }} 枪</span>
        </div>
      </div>

      <!-- 网侧购电量 -->
      <div 
        @click="goToPage('grid')"
        class="bg-white p-5 rounded-lg border border-slate-100 border-l-4 !border-l-[#8B5CF6] shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group"
      >
        <div class="absolute -right-2 -bottom-2 text-slate-50 opacity-15 group-hover:scale-110 group-hover:opacity-25 transition duration-300">
          <Radio :size="80" class="text-violet-100" />
        </div>
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <Radio :size="20" />
          </div>
          <span class="text-xs font-bold text-slate-400">关口电网购电</span>
        </div>
        <div class="mt-4 flex items-baseline gap-1.5">
          <span class="text-2xl font-bold font-mono text-slate-800">{{ formattedMetrics.gridBuy }}</span>
          <span class="text-xs text-slate-400 font-medium">kWh</span>
        </div>
        <div class="mt-2 text-[10px] text-violet-600 font-bold flex items-center gap-1">
          <span>上网潮流: {{ globalStore.metrics.gridTodaySell }} kWh</span>
        </div>
      </div>

      <!-- 综合能源收益 -->
      <div 
        @click="goToPage('revenue')"
        class="bg-white p-5 rounded-lg border border-slate-100 border-l-4 !border-l-[#F59E0B] shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group"
      >
        <div class="absolute -right-2 -bottom-2 text-slate-50 opacity-15 group-hover:scale-110 group-hover:opacity-25 transition duration-300">
          <DollarSign :size="80" class="text-amber-100" />
        </div>
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign :size="18" />
          </div>
          <span class="text-xs font-bold text-slate-400">综合能源收益</span>
        </div>
        <div class="mt-4 flex items-baseline gap-1.5">
          <span class="text-2xl font-bold font-mono text-amber-600">¥ {{ formattedMetrics.revenue }}</span>
        </div>
        <div class="mt-2 text-[10px] text-amber-600 font-bold flex items-center gap-1">
          <span>综合减碳抵消: {{ globalStore.metrics.todayCarbon }} tCO₂</span>
        </div>
      </div>
    </div>

    <!-- 2. 能流拓扑 + 当前状态小看板 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- 实时流形能效拓扑 (左) -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-150 shadow-sm overflow-hidden flex flex-col">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <span class="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
            <Workflow :size="16" class="text-emerald-600" />
            中节能实时能流动态监测图表
          </span>
          <a-tag color="success" class="m-0 font-bold text-[10px]">实时联动</a-tag>
        </div>
        
        <!-- 实景能流渲染：纯 CSS/SVG 科技流向线条 -->
        <div class="flex-1 min-h-[340px] bg-slate-950 p-6 flex flex-col justify-between relative select-none">
          
          <!-- 二级连线网络流向箭头动画 -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <!-- SVG 流动导引线 -->
            <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <!-- 光伏 -> 充电桩/储能 -->
              <path d="M 120 70 L 280 180" stroke="rgba(16,185,129,0.3)" stroke-width="2" fill="none" stroke-dasharray="6,6" class="animate-dash" />
              <!-- 光伏 -> 站负荷 -->
              <path d="M 120 70 L 440 180" stroke="rgba(16,185,129,0.3)" stroke-width="2" fill="none" stroke-dasharray="6,6" class="animate-dash" />
              <!-- 电网 -> 锁储能 -->
              <path d="M 120 180 L 280 180" stroke="rgba(147,51,234,0.3)" stroke-width="2" fill="none" stroke-dasharray="6,6" class="animate-dash" />
              <!-- 电网 -> 站内负载 -->
              <path d="M 120 180 L 440 180" stroke="rgba(147,51,234,0.3)" stroke-width="2" fill="none" stroke-dasharray="6,6" class="animate-dash" />
              <!-- 储能 -> 充电桩 (放电流动) -->
              <path d="M 280 180 L 280 300" :stroke="globalStore.metrics.essPower > 0 ? 'rgba(16,185,129,0.5)' : 'rgba(100,116,139,0.3)'" stroke-width="2.5" fill="none" stroke-dasharray="6,6" :class="globalStore.metrics.essPower > 0 ? 'animate-dash-reverse' : ''" />
              <!-- 充电桩/负荷汇集 -->
              <path d="M 280 300 L 440 300" stroke="rgba(59,130,246,0.3)" stroke-width="2" fill="none" stroke-dasharray="6,6" class="animate-dash" />
            </svg>
          </div>

          <!-- 节点分布行 1: 光伏 -->
          <div class="flex justify-start">
            <div class="h-16 w-36 bg-slate-900 border border-emerald-500/30 rounded-lg p-2.5 flex items-center gap-3 z-10 hover:border-emerald-500 transition shadow-lg shrink-0">
              <div class="h-10 w-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-555/20 shrink-0">
                <Sun :size="18" />
              </div>
              <div class="overflow-hidden">
                <div class="text-[10px] text-slate-500 truncate font-semibold">分布式光伏发</div>
                <div class="text-xs font-bold text-white font-mono truncate mt-0.5">{{ globalStore.metrics.pvPower }} kW</div>
              </div>
            </div>
          </div>

          <!-- 节点分布行 2: 电网与电池 -->
          <div class="flex justify-between items-center gap-4">
            <!-- 交流网关节点 -->
            <div class="h-16 w-36 bg-slate-900 border border-violet-500/30 rounded-lg p-2.5 flex items-center gap-3 z-10 hover:border-violet-500 transition shadow-lg shrink-0">
              <div class="h-10 w-10 rounded bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-555/20 shrink-0">
                <Radio :size="18" />
              </div>
              <div class="overflow-hidden">
                <div class="text-[10px] text-slate-500 truncate font-semibold">市电电网接入</div>
                <div class="text-xs font-bold text-white font-mono truncate mt-0.5">{{ globalStore.metrics.gridPower }} kW</div>
              </div>
            </div>

            <!-- 核心电化学储能节点 -->
            <div 
              @click="goToPage('storage')"
              class="h-20 w-44 bg-slate-900 border border-emerald-400/40 rounded-xl p-3 flex items-center gap-3 z-10 hover:border-emerald-400 hover:scale-105 transition cursor-pointer shadow-xl shrink-0"
            >
              <div class="h-12 w-12 rounded-lg bg-emerald-550/10 flex flex-col items-center justify-center text-emerald-400 border border-emerald-500/30 font-mono text-[9px] shrink-0 font-bold">
                <Battery :size="20" class="mb-0.5 animate-pulse" />
                <span>{{ globalStore.metrics.essSoc }}%</span>
              </div>
              <div class="overflow-hidden">
                <div class="text-[10px] text-slate-400 truncate font-semibold">1.2MWh 磷酸储电池</div>
                <div class="text-sm font-bold text-white font-mono mt-0.5">{{ globalStore.metrics.essPower }} kW</div>
                <div class="text-[9px] text-slate-500 truncate mt-0.5">{{ globalStore.metrics.essPower > 0 ? '▼ 削峰放电中' : '▲ 电网充电中' }}</div>
              </div>
            </div>

            <!-- 站内一般负荷节点 -->
            <div class="h-16 w-36 bg-slate-900 border border-slate-700 rounded-lg p-2.5 flex items-center gap-3 z-10 hover:border-slate-500 transition shadow-lg shrink-0">
              <div class="h-10 w-10 rounded bg-slate-800 flex items-center justify-center text-slate-350 border border-slate-600/30 shrink-0">
                <Activity :size="18" />
              </div>
              <div class="overflow-hidden">
                <div class="text-[10px] text-slate-500 truncate font-semibold">站内生产负荷</div>
                <div class="text-xs font-bold text-white font-mono truncate mt-0.5">{{ Math.round((globalStore.metrics.gridPower + globalStore.metrics.pvPower + globalStore.metrics.essPower - 120 ) * 10) / 10 }} kW</div>
              </div>
            </div>
          </div>

          <!-- 节点分布行 3: 充电车位 -->
          <div class="flex justify-center">
            <div 
              @click="goToPage('charging')"
              class="h-16 w-40 bg-slate-900 border border-blue-500/30 rounded-lg p-2.5 flex items-center gap-3 z-10 hover:border-blue-500 transition cursor-pointer shadow-lg shrink-0"
            >
              <div class="h-10 w-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0">
                <Zap :size="18" />
              </div>
              <div class="overflow-hidden">
                <div class="text-[10px] text-slate-500 truncate font-semibold">直流快速充电桩群</div>
                <div class="text-xs font-bold text-white font-mono truncate mt-0.5">占用: {{ globalStore.metrics.chargerOccupied }} 枪 / 共 {{ globalStore.metrics.chargerCount }}</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <!-- 实控系统限额与SOC百分比 (右) -->
      <div class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 flex flex-col gap-5 justify-between">
        <div>
          <span class="font-bold text-slate-800 flex items-center gap-1.5 text-sm pb-1.5 border-b border-slate-100 mb-4">
            <Settings :size="16" class="text-emerald-600" />
            重点运维预警仪面板
          </span>

          <!-- 储能 SOC 动态进度 -->
          <div class="space-y-2 mt-4">
            <div class="flex justify-between items-center text-xs font-bold">
              <span class="text-slate-500">能储系统电量 (SOC)</span>
              <span class="text-emerald-600 font-mono">{{ globalStore.metrics.essSoc }}%</span>
            </div>
            <a-progress 
              :percent="globalStore.metrics.essSoc" 
              :stroke-color="{ '0%': '#10B981', '100%': '#059669' }" 
              status="active" 
              :show-info="false" 
            />
            <div class="flex justify-between text-[10px] text-slate-400">
              <span>充放动作: {{ globalStore.metrics.essPower > 0 ? '向负载侧放电中' : '自电网吸收绿电中' }}</span>
              <span>健康指数 (SOH): 98.4%</span>
            </div>
          </div>

          <!-- 网侧需量安全利用 -->
          <div class="space-y-2 mt-6">
            <div class="flex justify-between items-center text-xs font-bold">
              <span class="text-slate-500">网侧安全需量利用率</span>
              <span class="text-violet-600 font-mono">
                {{ Math.round((globalStore.metrics.currentDemand / globalStore.metrics.targetDemand) * 100) }}%
              </span>
            </div>
            <a-progress 
              :percent="Math.round((globalStore.metrics.currentDemand / globalStore.metrics.targetDemand) * 100)" 
              :stroke-color="{ '0%': '#8B5CF6', '100%': '#7C3AED' }" 
              :show-info="false" 
            />
            <div class="flex justify-between text-[10px] text-slate-400">
              <span>瞬时功率: {{ globalStore.metrics.currentDemand }} kW</span>
              <span>最高合同容量: {{ globalStore.metrics.targetDemand }} kW</span>
            </div>
          </div>
        </div>

        <!-- 当前活动运行桩机快速总览 -->
        <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <div class="text-left">
            <div class="text-[10px] text-slate-400 font-bold">智能终端联控率</div>
            <div class="text-lg font-black font-mono text-emerald-650 mt-1">100.0%</div>
          </div>
          <div class="text-right">
            <div class="text-[10px] text-slate-400 font-bold">接口同步轮询周期</div>
            <div class="text-xs font-black text-slate-700 mt-1.5 font-mono">30s / 高频次级</div>
          </div>
        </div>

      </div>
    </div>

    <!-- 3. 多曲线 ECharts 趋势图 + 瞬时告警台 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- 能量负荷曲线 (左) -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-150 shadow-sm p-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <span class="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
            <LineChart :size="16" class="text-emerald-600" />
            光伏发电峰值与电网荷载预测曲线
          </span>
          <div class="flex items-center gap-1">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span><span class="text-[10px] font-bold text-slate-400 mr-3">光伏输出 (kW)</span>
            <span class="h-2 w-2 rounded-full bg-violet-500"></span><span class="text-[10px] font-bold text-slate-400">电网耗用 (kW)</span>
          </div>
        </div>
        <div ref="lineChartRef" class="w-full h-72"></div>
      </div>

      <!-- 实时安全警报中心 (右) -->
      <div class="bg-white rounded-xl border border-slate-150 shadow-sm p-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <span class="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
            <AlertTriangle :size="16" class="text-red-500" />
            瞬时异常安全动态告警
          </span>
          <a @click="goToPage('alarm')" class="text-xs text-sky-600 hover:underline cursor-pointer">监测库 >></a>
        </div>

        <div class="space-y-3 max-h-72 overflow-y-auto">
          <div
            v-for="al in truncatedAlarms"
            :key="al.id"
            class="p-2.5 bg-slate-50 rounded-lg border border-slate-150/80 hover:bg-slate-100 transition relative overflow-hidden group"
          >
            <!-- 告警严重色块 -->
            <div 
              class="absolute left-0 top-0 bottom-0 w-1"
              :class="al.level.includes('一级') ? 'bg-red-500' : 'bg-amber-400'"
            ></div>

            <div class="flex items-center justify-between pl-2">
              <span class="text-[9.5px] font-bold font-mono" :class="al.level.includes('一级') ? 'text-red-650' : 'text-amber-600'">
                {{ al.level }}
              </span>
              <span class="text-[9.5px] text-slate-400 font-mono">{{ al.time }}</span>
            </div>
            <div class="text-xs font-bold text-slate-800 pl-2 mt-1.5">{{ al.device }}</div>
            <p class="text-xs text-slate-500 pl-2 mt-1 line-clamp-1 leading-snug">{{ al.content }}</p>

            <div class="pl-2 mt-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a-button size="small" type="link" class="!text-[10.5px] !p-0 !h-auto text-emerald-600" @click="confirmAlarm(al.id)">
                接警处理
              </a-button>
            </div>
          </div>

          <div v-if="truncatedAlarms.length === 0" class="py-12 text-center text-slate-400 text-xs">
            暂无瞬时异常，系统运行良好！
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { globalStore } from '@/store';
import * as echarts from 'echarts';

// 导入 Lucide Icons
import {
  Sun,
  Zap,
  Radio,
  Battery,
  Workflow,
  Settings,
  AlertTriangle,
  LineChart,
  Activity,
  DollarSign
} from 'lucide-vue-next';

const router = useRouter();
const lineChartRef = ref<HTMLDivElement | null>(null);
let lineChart: echarts.ECharts | null = null;

// 跳转逻辑
const pageRouteMap: Record<string, string> = {
  'pv': 'PvMonitor',
  'charging': 'ChargingMonitor',
  'grid': 'GridMonitor',
  'revenue': 'RevenueOverview'
};

const goToPage = (key: string) => {
  const targetRouteName = pageRouteMap[key] || key;
  router.push({ name: targetRouteName });
};

// 仪表盘核心指标格式化
const formattedMetrics = computed(() => {
  const m = globalStore.metrics;
  const t = globalStore.timeWindow;
  
  // 模拟不同时间维度的乘数
  let multiplier = 1;
  if (t === 'month') multiplier = 24.5;
  if (t === 'year') multiplier = 285;
  
  return {
    pvEnergy: Math.round(m.pvTodayEnergy * multiplier).toLocaleString(),
    chargerEnergy: Math.round(m.chargerTodayEnergy * multiplier).toLocaleString(),
    gridBuy: Math.round(m.gridTodayBuy * multiplier).toLocaleString(),
    revenue: Math.round(m.todayRevenue * multiplier).toLocaleString()
  };
});

// 安全警报中心列表
const truncatedAlarms = computed(() => {
  return globalStore.alarms.filter(a => a.status === '待确认').slice(0, 4);
});

// 接警瞬时接管
const confirmAlarm = (id: string) => {
  const alarm = globalStore.alarms.find(a => a.id === id);
  if (alarm) {
    alarm.status = '已确认';
    alarm.handler = '张建国';
    alarm.handleTime = '2026-05-23 08:53:00';
    message.success(`安全告警【${alarm.type}】已接入！已转派至张建国工作组。`);
  }
};

// 曲线数据构造
const initCharts = () => {
  if (!lineChartRef.value) return;
  
  // 如果已存在，先销毁
  if (lineChart) {
    lineChart.dispose();
  }
  
  lineChart = echarts.init(lineChartRef.value);
  
  // 根据时间维度生成不同的 X 轴和数据
  let xData: string[] = [];
  let pvYData: number[] = [];
  let gridYData: number[] = [];
  
  const mult = globalStore.activeSiteKey === 'site-01' ? 1.0 : globalStore.activeSiteKey === 'site-02' ? 0.6 : 0.8;
  
  if (globalStore.timeWindow === 'today') {
    xData = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    pvYData = [0, 0, 0, 20*mult, 110*mult, 240*mult, 280*mult, 260*mult, 150*mult, 10*mult, 0, 0];
    gridYData = [120*mult, 100*mult, 150*mult, 250*mult, 410*mult, 350*mult, 320*mult, 390*mult, 420*mult, 430*mult, 210*mult, 140*mult];
  } else if (globalStore.timeWindow === 'month') {
    xData = ['5-1', '5-5', '5-10', '5-15', '5-20', '2026-05-23'];
    pvYData = [2400*mult, 2650*mult, 1900*mult, 3100*mult, 3268*mult, 3268*mult];
    gridYData = [4500*mult, 4310*mult, 4820*mult, 4950*mult, 4850*mult, 4850*mult];
  } else {
    xData = ['1月', '2月', '3月', '4月', '5月'];
    pvYData = [55000*mult, 62000*mult, 71000*mult, 83000*mult, 92000*mult];
    gridYData = [125000*mult, 118000*mult, 134000*mult, 145000*mult, 112000*mult];
  }
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#334155',
      textStyle: {
        color: '#FFFFFF',
        fontSize: 11
      }
    },
    grid: {
      left: '4%',
      right: '2%',
      bottom: '10%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData,
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#64748B', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#F1F5F9' } },
      axisLabel: { color: '#64748B', fontSize: 10 }
    },
    series: [
      {
        name: '光伏输出功率',
        type: 'line',
        smooth: true,
        data: pvYData,
        itemStyle: { color: '#10B981' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
          ])
        }
      },
      {
        name: '网侧耗用负能',
        type: 'line',
        smooth: true,
        data: gridYData,
        itemStyle: { color: '#8B5CF6' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139, 92, 246, 0.2)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0)' }
          ])
        }
      }
    ]
  };
  
  lineChart.setOption(option);
};

// 深度表盘联动
watch([() => globalStore.activeSiteKey, () => globalStore.timeWindow], () => {
  initCharts();
});

// 监听挂载与注销
let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  initCharts();
  
  // 建立 Resize 契约防止画布错位
  if (lineChartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      lineChart?.resize();
    });
    resizeObserver.observe(lineChartRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  lineChart?.dispose();
});
</script>

<style scoped>
/* 纯 SVG/CSS 实现的高动态能流图飞线箭头动画 */
@keyframes dash {
  to {
    stroke-dashoffset: -20;
  }
}
@keyframes dash-reverse {
  to {
    stroke-dashoffset: 20;
  }
}
.animate-dash {
  animation: dash 1s linear infinite;
}
.animate-dash-reverse {
  animation: dash-reverse 1s linear infinite;
}
</style>
