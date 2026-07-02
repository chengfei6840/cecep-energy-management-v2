<template>
  <div class="space-y-6 font-sans">
    
    <!-- 顶层过滤器 -->
    <div class="bg-white p-5 rounded-xl border border-slate-150 shadow-sm space-y-4">
      <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1.5 border-b border-slate-100 m-0">
        微网运行数据分析报表中枢 (Custom Metrics Export Panel)
      </h3>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        <!-- 报表类别 -->
        <div class="flex flex-col gap-1">
          <span class="text-[11px] font-bold text-slate-400">核算报表科目：</span>
          <a-select v-model:value="reportType" style="width: 100%" @change="generateReportData">
            <a-select-option value="pv">光伏逆变器日出力电量明细</a-select-option>
            <a-select-option value="ess">化学储能峰谷时段双充退对账</a-select-option>
            <a-select-option value="charge">星络充电桩今日订单财务清册</a-select-option>
            <a-select-option value="grid">并网主变低压关口需能潮流抄明</a-select-option>
          </a-select>
        </div>

        <!-- 站点 -->
        <div class="flex flex-col gap-1">
          <span class="text-[11px] font-bold text-slate-400">核验物理微网厂站：</span>
          <a-select v-model:value="selectedSite" style="width: 100%">
            <a-select-option value="site-01">中节能光储充示范站</a-select-option>
            <a-select-option value="site-02">中节能上海临港微网站点1</a-select-option>
          </a-select>
        </div>

        <!-- 时间视口 -->
        <div class="flex flex-col gap-1">
          <span class="text-[11px] font-bold text-slate-400">历史结算账期段：</span>
          <a-range-picker v-bg-white style="width: 100%" />
        </div>

        <!-- 触动作 -->
        <div class="flex items-end gap-2 shrink-0">
          <a-button type="primary" class="!bg-[#005BAC] hover:!bg-blue-650 !border-none text-xs font-bold w-full !h-8" @click="generateReportData">
            开始级联数据抓取
          </a-button>
          <a-button class="text-xs !h-8" @click="exportReportCsv">
            导出表格
          </a-button>
        </div>
      </div>
    </div>

    <!-- 报表呈现 -->
    <div class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div class="flex items-center gap-1.5">
          <div class="h-2 w-2 rounded-full bg-emerald-500"></div>
          <h2 class="text-sm font-bold text-slate-800 m-0 leading-normal">
            {{ reportTitle }}
          </h2>
        </div>
        <span class="text-[10px] text-slate-400 font-bold font-mono">累计行数: {{ tableData.length }}</span>
      </div>

      <a-table :data-source="tableData" :columns="tableColumns" size="middle" :pagination="{ pageSize: 12 }" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { globalStore } from '@/store';
import { message } from 'ant-design-vue';

const reportType = ref('pv');
const selectedSite = ref('site-01');

const tableData = ref<any[]>([]);

const reportTitle = computed(() => {
  if (reportType.value === 'pv') return '光伏有功AC侧并网输出数据报表';
  if (reportType.value === 'ess') return '储能PCS交直变换充发电运行对账单';
  if (reportType.value === 'charge') return '充电桩今日交易结算核查明细清单';
  return '关口计量主变电量有功潮流核记报表';
});

const generateReportData = () => {
  message.loading('智能微能网格正在抓取底层离线寄存器历史快照...', 1);
  
  const mult = selectedSite.value === 'site-01' ? 1.0 : 0.65;
  const list: any[] = [];
  
  if (reportType.value === 'pv') {
    for (let i = 0; i < 24; i++) {
      const hr = i < 10 ? '0' + i : '' + i;
      const genVal = (i >= 6 && i <= 18) ? Math.round((Math.sin((i - 6) / 12 * Math.PI) * 240) * mult) : 0;
      list.push({
        key: `r-${i}`,
        time: `${hr}:00 ~ ${hr}:59`,
        activePower: `${genVal} kW`,
        hourEnergy: `${Math.round(genVal * 0.95)} kWh`,
        irrValue: (i >= 6 && i <= 18) ? `${Math.round(Math.sin((i-6)/12*Math.PI)*850)} W/㎡` : '0 W/㎡',
        status: '正常并网中'
      });
    }
  } else if (reportType.value === 'ess') {
    for (let i = 0; i < 24; i++) {
      const hr = i < 10 ? '0' + i : '' + i;
      let charge = 0;
      let discharge = 0;
      let soc = 68;
      if (i >= 1 && i <= 5) { charge = Math.round(150 * mult); soc = 30 + (i * 12); }
      if (i >= 11 && i <= 14) { discharge = Math.round(200 * mult); soc = 90 - ((i-10) * 15); }
      
      list.push({
        key: `e-${i}`,
        time: `${hr}:00`,
        activeCharge: charge > 0 ? `${charge} kW` : '0 kW',
        activeDischarge: discharge > 0 ? `${discharge} kW` : '0 kW',
        socPercent: `${Math.min(100, Math.round(soc))}%`,
        cellTemp: '32.1 ℃',
        mode: charge > 0 ? '谷时自蓄' : discharge > 0 ? '尖放削峰' : '热备待机'
      });
    }
  } else if (reportType.value === 'charge') {
    const hours = ['09:12', '10:30', '12:15', '14:20', '16:05', '18:40', '20:10'];
    hours.forEach((hm, idx) => {
      const energyNum = Math.round((35 + idx * 8) * mult);
      const serviceFee = (energyNum * 0.35).toFixed(2);
      const baseFee = (energyNum * 1.05).toFixed(2);
      const sum = (parseFloat(serviceFee) + parseFloat(baseFee)).toFixed(2);
      list.push({
        key: `c-${idx}`,
        time: `2026-05-23 ${hm}`,
        pileId: `EVCS-00${(idx % 3) + 1}`,
        chargedVolume: `${energyNum} kWh`,
        serviceCharge: `¥ ${serviceFee}`,
        baseElectricity: `¥ ${baseFee}`,
        totalSum: `¥ ${sum}`,
        method: '星络第三方划账'
      });
    });
  } else {
    for (let i = 0; i < 24; i++) {
      const hr = i < 10 ? '0' + i : '' + i;
      const buyNum = Math.round((280 + Math.sin(i / 12 * Math.PI) * 100) * mult);
      const sellNum = (i >= 9 && i <= 15) ? Math.round(40 * mult) : 0;
      list.push({
        key: `g-${i}`,
        time: `${hr}:00`,
        gridImport: `${buyNum} kW`,
        gridExport: `${sellNum} kW`,
        cumulativePurchase: `${Math.round(buyNum * 12.5)} kWh`,
        voltageValue: '398.5 V',
        status: '联锁闭合正常'
      });
    }
  }
  
  tableData.value = list;
};

// 各种表格的字段
const tableColumns = computed(() => {
  if (reportType.value === 'pv') {
    return [
      { title: '核算时段视口', dataIndex: 'time', key: 'time', fontWeight: 'bold' },
      { title: '逆变器平均瞬时有功', dataIndex: 'activePower', key: 'activePower' },
      { title: '该小时有功发电电量累计', dataIndex: 'hourEnergy', key: 'hourEnergy' },
      { title: '瞬时日照强度 (W/㎡)', dataIndex: 'irrValue', key: 'irrValue' },
      { title: '并网安全状态', dataIndex: 'status', key: 'status' }
    ];
  } else if (reportType.value === 'ess') {
    return [
      { title: '采样时钟节点', dataIndex: 'time', key: 'time', fontWeight: 'bold' },
      { title: '储能 PCS 变流充电功率', dataIndex: 'activeCharge', key: 'activeCharge' },
      { title: '储能 PCS 变流放电功率', dataIndex: 'activeDischarge', key: 'activeDischarge' },
      { title: '电池 SoC 估算剩余电能', dataIndex: 'socPercent', key: 'socPercent' },
      { title: 'IGBT桥片极值运行温度', dataIndex: 'cellTemp', key: 'cellTemp' },
      { title: 'EMS 自主决策工况', dataIndex: 'mode', key: 'mode' }
    ];
  } else if (reportType.value === 'charge') {
    return [
      { title: '扫码结算确权时刻', dataIndex: 'time', key: 'time', fontWeight: 'bold' },
      { title: '承载直流枪桩位', dataIndex: 'pileId', key: 'pileId' },
      { title: '充入直流有功电量累计', dataIndex: 'chargedVolume', key: 'chargedVolume' },
      { title: '快慢充运营服务附加税', dataIndex: 'serviceCharge', key: 'serviceCharge' },
      { title: '吸收公有大工业输配基本电价', dataIndex: 'baseElectricity', key: 'baseElectricity' },
      { title: '实付总扣划账款 (元)', dataIndex: 'totalSum', key: 'totalSum' },
      { title: '第三方并账对口行', dataIndex: 'method', key: 'method' }
    ];
  } else {
    return [
      { title: '并网结算视口节点', dataIndex: 'time', key: 'time' },
      { title: '网侧输配变压有功输入功率', dataIndex: 'gridImport', key: 'gridImport' },
      { title: '光伏回馈逆功送网有功功率', dataIndex: 'gridExport', key: 'gridExport' },
      { title: '高压主电表买入无功有功累计', dataIndex: 'cumulativePurchase', key: 'cumulativePurchase' },
      { title: '线端稳态配相电压均值', dataIndex: 'voltageValue', key: 'voltageValue' },
      { title: '微电网安全同期闭锁', dataIndex: 'status', key: 'status' }
    ];
  }
});

const exportReportCsv = () => {
  message.loading('系统正在组装能能网格关系链、匹配 CECEP 模板表头格式...', 1.5)
    .then(() => {
      message.success('历史结算表格已生成。已打包传输 CECEP_Report_Pivot_Output.csv');
    });
};

onMounted(() => {
  generateReportData();
});
</script>

<style scoped>
</style>
