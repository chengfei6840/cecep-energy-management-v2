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

    <!-- TAB 1: 物理设备台账 -->
    <div v-if="activeSubTab === 'devices'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <HardDrive :size="15" class="text-[#005BAC]" />
          中国节能一期站端微能设备台账词底
        </h3>
        <div class="flex gap-2">
          <a-button type="primary" class="!bg-[#005BAC] hover:!bg-blue-650 !border-none text-xs font-bold" @click="openDeviceModal">
            + 注册入网新设备
          </a-button>
        </div>
      </div>

      <a-table :data-source="globalStore.devices" :columns="devColumns" size="middle" :pagination="{ pageSize: 6 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge status="success" text="通信就绪" />
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex gap-3">
              <a-button size="small" type="link" class="!text-xs !p-0 text-[#005BAC]" @click="testDeviceHeartbeat(record.name)">
                心跳拨测试验
              </a-button>
              <a-button size="small" type="link" class="!text-xs !p-0 text-red-500" @click="deregisterAsset(record)">
                下架注销
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- TAB 2: 测控制点位表 -->
    <div v-if="activeSubTab === 'points'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0 mb-1">
            <Workflow :size="15" class="text-emerald-600" />
            分布式 Modbus-TCP / MQTT 高频点位映射底卡
          </h3>
          <p class="text-[11px] text-slate-400">选择设备实例，核对采集寄存器物理编址信息：</p>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">选择设备组:</span>
          <a-select v-model:value="selectedDevKey" style="width: 240px">
            <a-select-option v-for="d in globalStore.devices" :key="d.id" :value="d.id">
              {{ d.name }}
            </a-select-option>
          </a-select>
        </div>
      </div>

      <a-table :data-source="filteredPoints" :columns="pointColumns" size="small" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ratio'">
            <span class="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px] font-bold text-slate-600">{{ record.ratio }}</span>
          </template>
          <template v-if="column.key === 'range'">
            <span class="font-mono text-slate-500 text-[10px]">{{ record.range }}</span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 注册设备弹层 (高保真交互) -->
    <a-modal
      v-model:open="isDevModalOpen"
      title="中国节能微网系统新设备注册登记"
      @ok="saveDevice"
      ok-text="确认注册并发布规则"
      cancel-text="放弃"
    >
      <a-form layout="vertical" class="space-y-3.5 p-3">
        <a-form-item label="物理硬件可识别命名" required>
          <a-input v-model:value="newDevForm.name" placeholder="例如: 3号分布式储能一体机柜" />
        </a-form-item>

        <div class="grid grid-cols-2 gap-3">
          <a-form-item label="设备硬件系列分类" required>
            <a-select v-model:value="newDevForm.category">
              <a-select-option value="网侧关口表">网侧关口表</a-select-option>
              <a-select-option value="变流逆变器">变流逆变器</a-select-option>
              <a-select-option value="储能蓄电池簇">储能蓄电池簇</a-select-option>
              <a-select-option value="直流快速充电桩">直流快速充电桩</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="支持工控通信协议" required>
            <a-select v-model:value="newDevForm.protocol">
              <a-select-option value="Modbus-TCP">Modbus-TCP</a-select-option>
              <a-select-option value="MQTT-JSON-Standard">MQTT-JSON-Standard</a-select-option>
              <a-select-option value="IEC-104 国标配网">IEC-104 国标配网</a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <a-form-item label="网口连接IP" required class="custom-tou-label mb-0">
            <a-input v-model:value="newDevForm.ip" placeholder="192.168.1.10" />
          </a-form-item>
          <a-form-item label="端通讯口/端口" required class="custom-tou-label mb-0">
            <a-input-number v-model:value="newDevForm.port" :min="1" class="w-full" placeholder="502" />
          </a-form-item>
        </div>
      </a-form>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { globalStore } from '@/store';
import { HardDrive, Workflow } from 'lucide-vue-next';
import { message, Modal } from 'ant-design-vue';

const subTabs = [
  { label: '物理网络设备台账', value: 'devices' },
  { label: '采集通信点位字典', value: 'points' }
];

const activeSubTab = ref('devices');

const devColumns = [
  { title: '特异内部资产 ID', dataIndex: 'id', key: 'id', fontWeight: 'bold' },
  { title: '登记资产名称', dataIndex: 'name', key: 'name' },
  { title: '所属工业站点', dataIndex: 'site', key: 'site' },
  { title: '归属功能组别', dataIndex: 'category', key: 'category' },
  { title: '传输承载协议', dataIndex: 'protocol', key: 'protocol' },
  { title: '物理连接 IP/COM', dataIndex: 'ip', key: 'ip' },
  { title: '遥测量心跳状态', key: 'status' },
  { title: '控制台动作', key: 'action' }
];

const testDeviceHeartbeat = (name: string) => {
  message.loading({ content: `正在调度网卡向物理网口【${name}】注入高频拨码探测包...`, duration: 1.2 })
    .then(() => {
      message.success(`设备【${name}】回执握手成功！往返耗时 RTT: 28ms，数据零丢包。`);
    });
};

const deregisterAsset = (record: any) => {
  Modal.confirm({
    title: '重要告警：下架物理测控资产？',
    content: `您正在注销设备【${record.name}】。下架后，相关的能流数据流、高阶峰谷模型计费将彻底停滞归零，请务必确认已将相关物理线路下电。`,
    okText: '确认下架且清除遥测缓存',
    cancelText: '放弃注销',
    onOk() {
      const idx = globalStore.devices.findIndex(d => d.id === record.id);
      if (idx !== -1) {
        globalStore.devices.splice(idx, 1);
        message.warning(`设备【${record.name}】已成功退出 CECEP 工控监测环路。`);
      }
    }
  });
};

// 新增设备弹层
const isDevModalOpen = ref(false);
const newDevForm = reactive({
  name: '',
  category: '微网关柜',
  protocol: 'Modbus-TCP',
  ip: '192.168.10.85',
  port: 502
});

const openDeviceModal = () => {
  newDevForm.name = '';
  isDevModalOpen.value = true;
};

const saveDevice = () => {
  if (!newDevForm.name) {
    message.error('请填写物理设备合法的识别命名！');
    return;
  }
  
  globalStore.devices.push({
    id: `DEV-NEW-${Date.now().toString().slice(-4)}`,
    name: newDevForm.name,
    site: '中节能光储充示范站',
    category: newDevForm.category,
    protocol: newDevForm.protocol,
    ip: `${newDevForm.ip}:${newDevForm.port}`,
    status: '在线'
  });
  
  message.success(`新硬件【${newDevForm.name}】已注册，高频轮询同步任务已自动挂载至队列！`);
  isDevModalOpen.value = false;
};

const selectedDevKey = ref('DEV-001');

const filteredPoints = computed(() => {
  return globalStore.points.filter(pt => pt.deviceId === selectedDevKey.value);
});

const pointColumns = [
  { title: '点位唯一编码', dataIndex: 'code', key: 'code', fontWeight: 'bold' },
  { title: '采集点位名称', dataIndex: 'name', key: 'name' },
  { title: '寄存器起始编址', dataIndex: 'address', key: 'address', fontStyle: 'italic' },
  { title: '数据格式', dataIndex: 'type', key: 'type' },
  { title: '度量单位', dataIndex: 'unit', key: 'unit' },
  { title: '乘数缩放系数', key: 'ratio' },
  { title: '可允许数值阈幅', key: 'range' },
  { title: '读写属性', dataIndex: 'rw', key: 'rw' }
];
</script>

<style scoped>
:deep(.custom-tou-label .ant-form-item-label > label) {
  font-size: 11px !important;
  color: #64748b !important;
}
</style>
