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

    <!-- TAB 1: 实时拓扑流向 -->
    <div v-if="activeSubTab === 'realtime'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <Workflow :size="16" class="text-emerald-600" />
          中节能示范区多温控有功物理能流网络流变图
        </h3>
        <a-tag color="success" class="m-0">有因可溯</a-tag>
      </div>

      <!-- 实景能网拓扑 -->
      <div class="min-h-[420px] bg-slate-950 rounded-xl p-8 relative flex flex-col justify-between overflow-hidden select-none">
        <!-- SVG 流道背景飞点 -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <!-- 骨干线 A: 光伏 -> 储能 -->
            <path d="M 230 80 Q 400 80 400 135" stroke="rgba(16,185,129,0.3)" stroke-width="2" fill="none" class="animate-dash" stroke-dasharray="5,5" />
            <!-- 骨干线 B: 光伏 -> 充电 -->
            <path d="M 230 80 Q 260 220 260 280" stroke="rgba(16,185,129,0.35)" stroke-width="2" fill="none" class="animate-dash" stroke-dasharray="5,5" />
            <!-- 骨干线 C: 电网 -> 负载 -->
            <path d="M 230 220 L 530 220" stroke="rgba(139,92,246,0.25)" stroke-width="2" fill="none" class="animate-dash" stroke-dasharray="5,5" />
            <!-- 骨干线 D: 储能 -> 充电 -->
            <path d="M 400 135 L 260 280" stroke="rgba(59,130,246,0.3)" stroke-width="2" fill="none" class="animate-dash" stroke-dasharray="5,5" />
          </svg>
        </div>

        <!-- LINE 1: 绿能收集侧 -->
        <div class="flex justify-start">
          <div class="h-16 w-52 bg-slate-900 border border-emerald-500/45 rounded-xl p-3 flex items-center gap-3 shadow-lg z-10 hover:border-emerald-500 transition">
            <div class="h-10 w-10 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center justify-center shrink-0">
              <Sun :size="20" class="animate-spin-slow" />
            </div>
            <div class="overflow-hidden">
              <div class="text-[10px] text-slate-500 font-bold truncate">1号并网分布式光伏</div>
              <div class="text-sm font-black font-mono text-white mt-0.5">{{ globalStore.metrics.pvPower }} kW</div>
            </div>
          </div>
        </div>

        <!-- LINE 2: 转换蓄能与变容中控 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-20">
          <!-- 购电网关 -->
          <div class="h-16 w-52 bg-slate-900 border border-violet-500/45 rounded-xl p-3 flex items-center gap-3 shadow-lg z-10 hover:border-violet-500 transition">
            <div class="h-10 w-10 text-violet-400 bg-violet-500/10 border border-violet-500/30 rounded flex items-center justify-center shrink-0">
              <Radio :size="18" />
            </div>
            <div class="overflow-hidden">
              <div class="text-[10px] text-slate-500 font-bold truncate font-sans">网侧10kV高压主并线</div>
              <div class="text-sm font-black font-mono text-white mt-0.5">{{ globalStore.metrics.gridPower }} kW</div>
            </div>
          </div>

          <!-- 电化学电池柜 -->
          <div class="h-20 w-56 bg-slate-900 border border-emerald-400/40 rounded-2xl p-4 flex items-center gap-3 shadow-xl z-10 hover:scale-105 transition">
            <div class="h-12 w-12 text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded-lg flex flex-col items-center justify-center font-mono text-[9px] font-bold shrink-0">
              <Battery :size="20" />
              <span>SoC {{ globalStore.metrics.essSoc }}%</span>
            </div>
            <div class="overflow-hidden leading-snug">
              <div class="text-[10px] text-slate-400 font-bold truncate">磷酸铁锂高自律储堆</div>
              <div class="text-sm font-black font-mono text-white mt-0.5">{{ globalStore.metrics.essPower }} kW</div>
              <div class="text-[9px] text-slate-500 mt-1">{{ globalStore.metrics.essPower > 0 ? '▼ 释能放电' : '▲ 市电谷充' }}</div>
            </div>
          </div>
        </div>

        <!-- LINE 3: 终端充用和生产负载 -->
        <div class="flex justify-between gap-6 pt-4">
          <!-- 直流充电桩 -->
          <div class="h-16 w-52 bg-slate-900 border border-blue-500/45 rounded-xl p-3 flex items-center gap-3 shadow-lg z-10 hover:border-blue-500 transition">
            <div class="h-10 w-10 text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded flex items-center justify-center shrink-0">
              <Zap :size="18" />
            </div>
            <div class="overflow-hidden">
              <div class="text-[10px] text-slate-500 font-bold truncate">120kW直流快速充电桩</div>
              <div class="text-sm font-black font-mono text-white mt-0.5">占用: {{ globalStore.metrics.chargerOccupied }}枪 / 160kW</div>
            </div>
          </div>

          <!-- 园区用电 -->
          <div class="h-16 w-52 bg-slate-900 border border-slate-700/80 rounded-xl p-3 flex items-center gap-3 shadow-lg z-10 hover:border-slate-500 transition">
            <div class="h-10 w-10 text-slate-400 bg-slate-800 border border-slate-600/30 rounded flex items-center justify-center shrink-0">
              <Activity :size="18" />
            </div>
            <div class="overflow-hidden">
              <div class="text-[10px] text-slate-500 font-bold truncate font-sans">厂房办公及照明负载</div>
              <div class="text-sm font-black font-mono text-white mt-0.5">152.5 kW</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: 能桑基分配配 -->
    <div v-if="activeSubTab === 'sankey'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="border-b border-slate-100 pb-3">
        <h3 class="text-sm font-bold text-slate-800 m-0">一期园区能耗源流桑基配用级联图 (Sankey Flow)</h3>
      </div>
      <div ref="sankeyRef" class="w-full h-[450px]"></div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { globalStore } from '@/store';
import { Workflow, Sun, Radio, Battery, Zap, Activity } from 'lucide-vue-next';
import * as echarts from 'echarts';

const subTabs = [
  { label: '实时多能物理流图', value: 'realtime' },
  { label: '级联能源桑基分析', value: 'sankey' }
];

const activeSubTab = ref('realtime');

const sankeyRef = ref<HTMLDivElement | null>(null);
let sankeyChart: echarts.ECharts | null = null;

const initSankey = () => {
  if (!sankeyRef.value) return;
  if (sankeyChart) sankeyChart.dispose();
  
  sankeyChart = echarts.init(sankeyRef.value);
  
  const mult = globalStore.activeSiteKey === 'site-01' ? 1.0 : globalStore.activeSiteKey === 'site-02' ? 0.6 : 0.8;
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: { focus: 'adjacency' },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5
        },
        data: [
          { name: '分布式光伏发电', itemStyle: { color: '#10B981' } },
          { name: '市电有功购入', itemStyle: { color: '#8256F6' } },
          { name: '电化学储能充能', itemStyle: { color: '#059669' } },
          { name: '磷酸储能放电', itemStyle: { color: '#06B6D4' } },
          { name: '直流快充桩群消耗', itemStyle: { color: '#3B82F6' } },
          { name: '厂房生产负能', itemStyle: { color: '#F59E0B' } },
          { name: '余电并网上网结算', itemStyle: { color: '#64748B' } }
        ],
        links: [
          { source: '分布式光伏发电', target: '直流快充桩群消耗', value: Math.round(1800 * mult) },
          { source: '分布式光伏发电', target: '电化学储能充能', value: Math.round(800 * mult) },
          { source: '分布式光伏发电', target: '余电并网上网结算', value: Math.round(620 * mult) },
          { source: '市电有功购入', target: '厂房生产负能', value: Math.round(3200 * mult) },
          { source: '市电有功购入', target: '电化学储能充能', value: Math.round(1200 * mult) },
          { source: '磷酸储能放电', target: '直流快充桩群消耗', value: Math.round(1500 * mult) }
        ],
        label: {
          fontSize: 11,
          fontFamily: 'sans-serif',
          color: '#1E293B',
          fontWeight: 'bold'
        }
      }
    ]
  };
  
  sankeyChart.setOption(option);
};

watch([activeSubTab, () => globalStore.activeSiteKey], () => {
  setTimeout(() => {
    if (activeSubTab.value === 'sankey') initSankey();
  }, 100);
});

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  setTimeout(() => {
    if (activeSubTab.value === 'sankey') initSankey();
  }, 100);
  
  resizeObserver = new ResizeObserver(() => {
    sankeyChart?.resize();
  });
  if (sankeyRef.value) resizeObserver.observe(sankeyRef.value);
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  sankeyChart?.dispose();
});
</script>

<style scoped>
@keyframes dash {
  to {
    stroke-dashoffset: -20;
  }
}
.animate-dash {
  animation: dash 1s linear infinite;
}
.animate-spin-slow {
  animation: spin 12s linear infinite;
}
</style>
