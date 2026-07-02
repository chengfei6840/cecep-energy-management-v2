<template>
  <div class="space-y-6 font-sans">
    
    <!-- 子标签 -->
    <div class="bg-white p-2 rounded-xl border border-slate-150 shadow-sm flex flex-wrap gap-2">
      <button
        v-for="tab in alarmTabs"
        :key="tab.value"
        @click="activeSubTab = tab.value"
        class="px-4 py-2 text-xs rounded-lg font-bold transition cursor-pointer"
        :class="activeSubTab === tab.value ? 'bg-[#005BAC] text-white shadow-sm shadow-[#005BAC]/25' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 过滤器面板 -->
    <div class="bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex flex-wrap gap-3 items-center text-xs">
      <span class="font-bold text-slate-500">告警级别过滤:</span>
      <a-select v-model:value="levelFilter" style="width: 140px" placeholder="全部等级">
        <a-select-option value="ALL">全部级别风险</a-select-option>
        <a-select-option value="紧急">级1-紧急故障 (Red)</a-select-option>
        <a-select-option value="警告">级2-常规警告 (Orange)</a-select-option>
        <a-select-option value="提示">级3-常态提示 (Blue)</a-select-option>
      </a-select>

      <span class="font-bold text-slate-500 ml-2">站点快速路由:</span>
      <a-select v-model:value="siteFilter" style="width: 180px">
        <a-select-option value="ALL">示范站全群</a-select-option>
        <a-select-option value="中节能光储充示范站">中节能光储充示范站</a-select-option>
        <a-select-option value="中节能上海临港微网站点1">中节能上海临港微网站点1</a-select-option>
      </a-select>
    </div>

    <!-- TAB 1: 当前活动中未清除告警 -->
    <div v-if="activeSubTab === 'active'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0 text-red-650">
          <AlertTriangle :size="16" class="text-red-500 animate-pulse" />
          厂网异常瞬时遥信活动异常队列
        </h3>
        
        <div class="flex gap-2">
          <a-button type="primary" danger class="text-xs font-bold" @click="confirmAllAlarms">
            一键确认全部瞬时告警
          </a-button>
        </div>
      </div>

      <a-table :data-source="filteredActiveAlarms" :columns="activeColumns" size="middle" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black" :class="getLevelBadgeStyle(record.level)">
              ● {{ record.level }}
            </span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge :status="record.status === '已确认' ? 'success' : 'processing'" :text="record.status" />
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex items-center gap-2">
              <a-button 
                size="small" 
                type="link" 
                class="!text-xs !p-0 text-[#005BAC]" 
                :disabled="record.status === '已确认'"
                @click="acknowledgeAlarm(record)"
              >
                {{ record.status === '已确认' ? '已确权' : '安全确认并标记' }}
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- TAB 2: 已终结并闭环历史告警归档 -->
    <div v-if="activeSubTab === 'history'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800 m-0">一期已治理排除安全隐患历史日志</h3>
        <a-tag color="default" class="m-0 text-[10px]">保留存证 180 天</a-tag>
      </div>

      <a-table :data-source="filteredHistoryAlarms" :columns="historyColumns" size="middle" :pagination="{ pageSize: 5 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
              ● {{ record.level }}
            </span>
          </template>
          <template v-else-if="column.key === 'duration'">
            <span class="font-mono text-xs">{{ record.duration }}</span>
          </template>
        </template>
      </a-table>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { globalStore } from '@/store';
import { AlertTriangle } from 'lucide-vue-next';
import { message } from 'ant-design-vue';

const alarmTabs = [
  { label: '瞬时活动未消除告警', value: 'active' },
  { label: '历史安全消纳归档簿', value: 'history' }
];

const activeSubTab = ref('active');

const levelFilter = ref('ALL');
const siteFilter = ref('ALL');

// 当前活动中
const filteredActiveAlarms = computed(() => {
  return globalStore.alarms.filter(al => {
    let levelMatch = true;
    if (levelFilter.value === '紧急') levelMatch = al.level.includes('一级') || al.level.includes('紧急');
    else if (levelFilter.value === '警告') levelMatch = al.level.includes('二级') || al.level.includes('重要');
    else if (levelFilter.value === '提示') levelMatch = al.level.includes('三级') || al.level.includes('次要');
    
    const meetSite = siteFilter.value === 'ALL' || al.device.includes('储能') || al.device.includes('变频') || al.device.includes('变压器');
    return levelMatch && meetSite && al.status !== '已处理';
  });
});

// 历史已封存
const mockHistoryAlarms = ref([
  { id: 'ALM-H-001', device: '2号储能组变流回路', content: '2号储能电池包高热超速温升报警恢复', level: '一级(紧急)', time: '2026-05-22 14:20:00', duration: '28分钟', handler: '自动空调控制自愈' },
  { id: 'ALM-H-002', device: '1号关口总线计量表', content: '主站端-MQTT上行连接抖动恢复成功', level: '三级(次要)', time: '2026-05-22 09:12:00', duration: '12秒', handler: '重试守护机制' },
  { id: 'ALM-H-003', device: '快充桩1号接引端', content: '快充桩1号刷卡认证网关过载回复', level: '二级(重要)', time: '2026-05-21 18:40:00', duration: '5分钟', handler: '人工操作指令清除' }
]);

const filteredHistoryAlarms = computed(() => {
  return mockHistoryAlarms.value.filter(al => {
    let levelMatch = true;
    if (levelFilter.value === '紧急') levelMatch = al.level.includes('一级') || al.level.includes('紧急');
    else if (levelFilter.value === '警告') levelMatch = al.level.includes('二级') || al.level.includes('重要');
    else if (levelFilter.value === '提示') levelMatch = al.level.includes('三级') || al.level.includes('次要');
    
    const meetSite = siteFilter.value === 'ALL' || al.device.includes('储能') || al.device.includes('桩') || al.device.includes('电表') || al.device.includes('变压器');
    return levelMatch && meetSite;
  });
});

const getLevelBadgeStyle = (lvl: string) => {
  if (lvl.includes('一级') || lvl.includes('紧急')) return 'bg-red-50 text-red-650 border border-red-100';
  if (lvl.includes('二级') || lvl.includes('重要') || lvl.includes('警告')) return 'bg-orange-50 text-orange-655 border border-orange-100';
  return 'bg-blue-50 text-blue-600 border border-blue-100';
};

const acknowledgeAlarm = (record: any) => {
  record.status = '已确认';
  message.success({ content: `警报【${record.content}】确权完毕！` });
};

const confirmAllAlarms = () => {
  globalStore.alarms.forEach(al => {
    if (al.status === '待确认') {
      al.status = '已确认';
    }
  });
  message.success({ content: '一期系统全部瞬时未消除报警已执行安全确认，自愈完成！' });
};

const activeColumns = [
  { title: '特异警情内码', dataIndex: 'id', key: 'id', fontWeight: 'bold' },
  { title: '被测硬件资产', dataIndex: 'device', key: 'device' },
  { title: '警备安全风险级', dataIndex: 'level', key: 'level' },
  { title: '心跳事件描述', dataIndex: 'content', key: 'content' },
  { title: '触发电秒时刻', dataIndex: 'time', key: 'time' },
  { title: '闭锁状态', key: 'status' },
  { title: '安全安防交互', key: 'action' }
];

const historyColumns = [
  { title: '历史告警 ID', dataIndex: 'id', key: 'id' },
  { title: '已恢复硬件', dataIndex: 'device', key: 'device' },
  { title: '当时风险级别', dataIndex: 'level', key: 'level' },
  { title: '已愈故障描述', dataIndex: 'content', key: 'content' },
  { title: '遥触发时刻', dataIndex: 'time', key: 'time' },
  { title: '治理清除耗用', key: 'duration' },
  { title: '自动排障决策源', dataIndex: 'handler', key: 'handler' }
];
</script>

<style scoped>
</style>
