<template>
  <div class="space-y-6 font-sans">
    
    <!-- 精美多维子页选择卡 -->
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

    <!-- TAB 1: 第三方平台管理 -->
    <div v-if="activeSubTab === 'platform'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <h2 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <Share2 :size="16" class="text-emerald-600" />
          物联网第三方汇接平台台账
        </h2>
        <a-button type="primary" class="!bg-emerald-600 hover:!bg-emerald-500 !border-none text-xs font-bold" @click="openPlatformModal(null)">
          + 新增接入平台
        </a-button>
      </div>

      <!-- 搜索项 -->
      <div class="flex items-center gap-3">
        <a-input v-model:value="platSearch" placeholder="搜索平台名称、负责人..." class="max-w-xs" />
        <a-select v-model:value="platTypeFilter" style="width: 150px" placeholder="平台类型">
          <a-select-option value="">全部类型</a-select-option>
          <a-select-option v-for="t in platTypes" :key="t" :value="t">{{ t }}</a-select-option>
        </a-select>
      </div>

      <!-- 数据表 -->
      <a-table 
        :data-source="filteredPlatforms" 
        :columns="platColumns" 
        :pagination="{ pageSize: 5 }" 
        size="middle"
        class="cecep-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '正常' ? 'success' : record.status === '停用' ? 'default' : 'error'">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex items-center gap-2">
              <a-button size="small" type="link" class="!text-xs !p-0 text-emerald-600" @click="testPlatformConnection(record.name)">
                测试连接
              </a-button>
              <a-button size="small" type="link" class="!text-xs !p-0 text-[#005BAC]" @click="openPlatformModal(record)">
                编辑
              </a-button>
              <a-button 
                size="small" 
                type="link" 
                class="!text-xs !p-0"
                :class="record.status === '停用' ? 'text-emerald-600' : 'text-amber-500'" 
                @click="togglePlatformStatus(record)"
              >
                {{ record.status === '停用' ? '启用' : '禁用' }}
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- TAB 2: 接口配置调试 -->
    <div v-if="activeSubTab === 'config'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
        <h3 class="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-1.5 m-0">
          <Terminal :size="15" class="text-[#005BAC]" /> API 底层报文拉取模拟器
        </h3>
        
        <a-form layout="vertical" class="space-y-3.5">
          <div class="grid grid-cols-3 gap-3">
            <a-form-item label="网关平台" class="col-span-2">
              <a-select v-model:value="apiTestForm.platform">
                <a-select-option v-for="p in platformsList" :key="p.id" :value="p.name">{{ p.name }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="请求协议">
              <a-select v-model:value="apiTestForm.method">
                <a-select-option value="GET">GET</a-select-option>
                <a-select-option value="POST">POST</a-select-option>
              </a-select>
            </a-form-item>
          </div>

          <a-form-item label="端点映射 (Endpoint)">
            <a-input v-model:value="apiTestForm.url" placeholder="https://" />
          </a-form-item>

          <a-form-item label="鉴权凭证配置 (Headers Token)">
            <a-input v-model:value="apiTestForm.token" placeholder="Bearer DEMO_TOKEN" />
          </a-form-item>

          <div class="flex justify-end gap-2">
            <a-button @click="resetApiTest" class="text-xs">重置域</a-button>
            <a-button type="primary" :loading="apiTesting" class="!bg-[#005BAC] !border-none text-xs text-white" @click="runApiTest">
              发送测试报文请求
            </a-button>
          </div>
        </a-form>
      </div>

      <!-- 响应内容 -->
      <div class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 flex flex-col">
        <h3 class="text-sm font-bold text-slate-850 pb-2 border-b border-slate-100 flex items-center gap-1.5 m-0 mb-4 h-6">
          <Code :size="15" class="text-emerald-600" />
          边缘采集设备返回 JSON 载荷
        </h3>
        <div class="flex-1 bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-400 overflow-auto whitespace-pre h-72">
          {{ apiTestingResult }}
        </div>
      </div>
    </div>

    <!-- TAB 3: 数据同步任务 -->
    <div v-if="activeSubTab === 'task'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <Activity :size="15" class="text-emerald-600" />
          周期高频时钟同步控制器
        </h2>
      </div>

      <a-table :data-source="syncTasks" :columns="taskColumns" :pagination="false" size="middle">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '成功' ? 'success' : record.status === '失败' ? 'error' : 'processing'">
              <span class="flex items-center gap-1">
                <span v-if="record.status === '进行中'" class="h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
                {{ record.status }}
              </span>
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex items-center gap-2">
              <a-button size="small" type="link" class="!text-xs !p-0 text-emerald-600" @click="triggerSyncNow(record)">
                立即执行
              </a-button>
              <a-button size="small" type="link" class="!text-xs !p-0 text-slate-500" @click="showTaskLogs(record.name)">
                查看日志
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- TAB 4: 数据映射管理 -->
    <div v-if="activeSubTab === 'mapping'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-4 space-y-4">
      <a-tabs v-model:activeKey="mappingSubTab" type="card">
        <!-- 4.1 设备映射 -->
        <a-tab-pane key="device" tab="外部设备资产映射 (Device Map)">
          <div class="flex items-center justify-between py-2 mb-2">
            <span class="text-xs text-slate-400">将第三方采集的资产编码与中国节能标准的设备树台账节点进行双向映射联结。</span>
          </div>
          <a-table :data-source="mockDeviceMappings" :columns="devMappingColumns" size="small" :pagination="{ pageSize: 5 }" />
        </a-tab-pane>

        <!-- 4.2 点位映射 -->
        <a-tab-pane key="point" tab="通信遥测遥信点位映射 (Point Map)">
          <div class="flex items-center justify-between py-2 mb-2">
            <span class="text-xs text-slate-400">电量计算依赖点位。将第三方厂商特有的寄存器与CECEP平台统一电量、电压点位映射。</span>
          </div>
          <a-table :data-source="mockPointMappings" :columns="pointMappingColumns" size="small" :pagination="{ pageSize: 5 }" />
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- TAB 5: 同步日志 -->
    <div v-if="activeSubTab === 'log'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0">
          <BookOpen :size="15" class="text-emerald-500" />
          接口轮询及推送实时事务审计日志
        </h3>
        <a-button @click="clearLogs" class="text-xs">
          清空审计缓存
        </a-button>
      </div>

      <a-table :data-source="syncLogs" :columns="logColumns" size="middle" :pagination="{ pageSize: 6 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'result'">
            <a-tag :color="record.result === '成功' ? 'success' : 'error'">
              {{ record.result }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </div>

    <!-- TAB 6: 接入安全异控 -->
    <div v-if="activeSubTab === 'exceptions'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5 m-0 text-red-650">
          <AlertTriangle :size="16" class="text-red-500 animate-bounce" />
          第三方数据同步接入异常监视库
        </h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 bg-red-50 rounded-xl border border-red-100 flex flex-col justify-between">
          <div>
            <div class="text-[10px] text-red-500 font-bold">接口超时阻遏</div>
            <div class="text-2xl font-black font-mono text-red-700 mt-1">1 起</div>
          </div>
          <span class="text-[10px] text-slate-400 mt-2">导致数据滞回3分钟，威胜高频结算网点</span>
        </div>
        <div class="p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-col justify-between">
          <div>
            <div class="text-[10px] text-amber-600 font-bold">空字段与转换断节</div>
            <div class="text-2xl font-black font-mono text-amber-700 mt-1">1 起</div>
          </div>
          <span class="text-[10px] text-slate-400 mt-2">高特EMS 3号单体极值温控字段异常</span>
        </div>
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-150 flex flex-col justify-between">
          <div>
            <div class="text-[10px] text-slate-500 font-bold">自适应证书刷新</div>
            <div class="text-2xl font-black font-mono text-slate-700 mt-1">已捕获恢复 13 起</div>
          </div>
          <span class="text-[10px] text-slate-400 mt-2">星络云端鉴权安全事件已被网关防护捕获</span>
        </div>
      </div>

      <a-table :data-source="globalStore.exceptions" :columns="excColumns" size="middle" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'severity'">
            <a-tag :color="record.severity === '高' ? 'red' : record.severity === '中' ? 'orange' : 'blue'">
              {{ record.severity }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge :status="record.status === '已恢复' ? 'success' : 'error'" :text="record.status" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button size="small" type="link" class="!text-xs !p-0 text-[#005BAC]" :disabled="record.status === '已恢复'" @click="resolveException(record)">
              重试并标为恢复
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增 / 编辑平台抽屉弹框 -->
    <a-modal
      v-model:open="isPlatModalOpen"
      :title="platFormMode === 'add' ? '新增边缘采集汇接平台 Gateway' : '编辑第三方平台参数'"
      @ok="savePlatform"
      ok-text="确认注册"
      cancel-text="取消"
    >
      <a-form layout="vertical" class="space-y-3 p-2">
        <a-form-item label="平台名称 (Platform Name)" required>
          <a-input v-model:value="platFormModel.name" placeholder="请输入平台名称" />
        </a-form-item>
        <div class="grid grid-cols-2 gap-3">
          <a-form-item label="平台类型" required>
            <a-select v-model:value="platFormModel.type">
              <a-select-option v-for="t in platTypes" :key="t" :value="t">{{ t }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="汇接协议" required>
            <a-select v-model:value="platFormModel.method">
              <a-select-option value="API拉取">API拉取</a-select-option>
              <a-select-option value="消息推送">消息推送</a-select-option>
              <a-select-option value="文件同步">文件同步</a-select-option>
            </a-select>
          </a-form-item>
        </div>
        <a-form-item label="网关API网卡端点 (Endpoint URL)" required>
          <a-input v-model:value="platFormModel.url" placeholder="https://api..." />
        </a-form-item>
        <div class="grid grid-cols-2 gap-3">
          <a-form-item label="签名鉴权机制">
            <a-select v-model:value="platFormModel.authType">
              <a-select-option value="AppKey-Secret">AppKey + Secret</a-select-option>
              <a-select-option value="Token">静态 Bearer Token</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="高频同步网关周期">
            <a-select v-model:value="platFormModel.period">
              <a-select-option value="30秒">30秒</a-select-option>
              <a-select-option value="1分钟">1分钟</a-select-option>
              <a-select-option value="5分钟">5分钟</a-select-option>
              <a-select-option value="15分钟">15分钟</a-select-option>
              <a-select-option value="1小时">1小时</a-select-option>
            </a-select>
          </a-form-item>
        </div>
        <div class="grid grid-cols-2 gap-3" v-if="platFormModel.authType === 'AppKey-Secret'">
          <a-form-item label="AppKey">
            <a-input v-model:value="platFormModel.appKey" />
          </a-form-item>
          <a-form-item label="Secret Key">
            <a-input-password v-model:value="platFormModel.secret" />
          </a-form-item>
        </div>
        <a-form-item label="运营安全负责人">
          <a-input v-model:value="platFormModel.owner" placeholder="张工" />
        </a-form-item>
        <a-form-item label="汇接备注">
          <a-textarea v-model:value="platFormModel.remark" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { globalStore } from '@/store';
import { mockPlatforms, mockSyncTasks, Platform, SyncTask } from '@/mock/data';
import { Share2, Terminal, Code, Activity, BookOpen, AlertTriangle } from 'lucide-vue-next';

// 选项
const subTabs = [
  { label: '第三方平台管理', value: 'platform' },
  { label: '接口底层调试', value: 'config' },
  { label: '时钟同步任务', value: 'task' },
  { label: '数据模型映射', value: 'mapping' },
  { label: '推送审计日志', value: 'log' },
  { label: '接入安全异控', value: 'exceptions' }
];

const activeSubTab = ref('platform');
const mappingSubTab = ref('point');

// 平台数据驱动
const platformsList = ref<Platform[]>([...mockPlatforms]);
const platSearch = ref('');
const platTypeFilter = ref('');
const platTypes = ['光伏平台', '储能平台', '充电桩平台', '电表平台', '气象平台'];

const filteredPlatforms = computed(() => {
  return platformsList.value.filter(p => {
    const matchSearch = p.name.includes(platSearch.value) || p.owner.includes(platSearch.value);
    const matchType = !platTypeFilter.value || p.type === platTypeFilter.value;
    return matchSearch && matchType;
  });
});

// Platform表头
const platColumns = [
  { title: '平台网关名称', dataIndex: 'name', key: 'name', fontWeight: 'bold' },
  { title: '平台服务性质', dataIndex: 'type', key: 'type' },
  { title: '拉取通道', dataIndex: 'method', key: 'method' },
  { title: '网卡极度心跳状态', dataIndex: 'status', key: 'status' },
  { title: '最近抓取时钟', dataIndex: 'lastSync', key: 'lastSync' },
  { title: '本班组负责人', dataIndex: 'owner', key: 'owner' },
  { title: '管理面板操作', key: 'action' }
];

// 新增编辑弹窗
const isPlatModalOpen = ref(false);
const platFormMode = ref<'add' | 'edit'>('add');
const platFormModel = reactive<any>({
  id: '',
  name: '',
  type: '光伏平台',
  method: 'API拉取',
  url: '',
  authType: 'AppKey-Secret',
  appKey: '',
  secret: '',
  period: '5分钟',
  owner: '张工',
  remark: ''
});

const openPlatformModal = (record: Platform | null) => {
  if (record) {
    platFormMode.value = 'edit';
    Object.assign(platFormModel, { ...record });
  } else {
    platFormMode.value = 'add';
    Object.assign(platFormModel, {
      id: 'plat-' + Date.now(),
      name: '',
      type: '光伏平台',
      method: 'API拉取',
      url: 'https://',
      authType: 'Token',
      appKey: '',
      secret: 'DEMO_SECRET',
      period: '5分钟',
      owner: '张工',
      remark: ''
    });
  }
  isPlatModalOpen.value = true;
};

const savePlatform = () => {
  if (!platFormModel.name || !platFormModel.url) {
    message.error('请填写完整的采集名称及网关端点 URL！');
    return;
  }
  
  if (platFormMode.value === 'add') {
    platformsList.value.unshift({
      id: platFormModel.id,
      name: platFormModel.name,
      type: platFormModel.type,
      method: platFormModel.method,
      status: '正常',
      lastSync: '刚刚同步完成',
      owner: platFormModel.owner,
      url: platFormModel.url,
      authType: platFormModel.authType,
      appKey: platFormModel.appKey,
      secret: platFormModel.secret,
      period: platFormModel.period,
      remark: platFormModel.remark
    });
    message.success(`安全网关平台【${platFormModel.name}】注册签名校验通过，正式部署。`);
  } else {
    const idx = platformsList.value.findIndex(p => p.id === platFormModel.id);
    if (idx !== -1) {
      platformsList.value[idx] = { ...platformsList.value[idx], ...platFormModel };
      message.success(`外部平台【${platFormModel.name}】映射数据同步参数已成功调整。`);
    }
  }
  isPlatModalOpen.value = false;
};

const togglePlatformStatus = (record: Platform) => {
  record.status = record.status === '正常' ? '停用' : '正常';
  message.info(`平台【${record.name}】已被更改工作状态，现在为: ${record.status}`);
};

const testPlatformConnection = (name: string) => {
  message.loading({ content: `正在联通至【${name}】握手网关...`, duration: 1 })
    .then(() => {
      message.success(`对端链路反馈: 握手成功！耗时: 124ms. API证书签名极客可信。`);
    });
};

// API底层调试
const apiTestForm = reactive({
  platform: '固德威固瑞光伏监控平台',
  method: 'GET',
  url: 'https://api.goodwe-power.com/v2/metrics?site_id=CECEP-01',
  token: 'Bearer DEMO_TOKEN'
});

const apiTestingResult = ref<string>('{\n  "status": "idle",\n  "tip": "请点击下方【发送测试报文请求】进行网关联调"\n}');
const apiTesting = ref(false);

const resetApiTest = () => {
  apiTestForm.platform = '固德威固瑞光伏监控平台';
  apiTestForm.method = 'GET';
  apiTestForm.url = 'https://api.goodwe-power.com/v2/metrics?site_id=CECEP-01';
  apiTestingResult.value = '{\n  "status": "idle",\n  "tip": "参数已清除，等待复核联调"\n}';
};

const runApiTest = () => {
  apiTesting.value = true;
  apiTestingResult.value = `// Sending request to gateway [${apiTestForm.platform}]...`;
  setTimeout(() => {
    apiTesting.value = false;
    apiTestingResult.value = JSON.stringify({
      code: 200,
      timestamp: Date.now(),
      clientId: "CECEP-IOT-GATEWAY-009",
      payload: {
        siteId: "CECEP-ESS-01",
        inverterId: "GWE-300K-001",
        activePowerAc: 145.2,
        pacUnit: "kW",
        gridDailyEnergyKwh: 1680.5,
        bmsGroupSoc: 68.0,
        pcsInvMode: "Discharge",
        commChannelStatus: "Normal_TLS1.3"
      },
      audit: {
        latencyMs: 114,
        decryptedSign: "RSA_SHA256_VALID_CECEP_ROOT_CRT"
      }
    }, null, 2);
    message.success('API 底层报文请求交互完毕，设备数据完全解密就绪。');
  }, 1000);
};

// 时钟同步任务
const syncTasks = ref<SyncTask[]>([...mockSyncTasks]);
const taskColumns = [
  { title: '时钟同步任务名称', dataIndex: 'name', key: 'name' },
  { title: '外部依存源平台', dataIndex: 'platform', key: 'platform' },
  { title: '映射数据包物理性质', dataIndex: 'target', key: 'target' },
  { title: '高频遥测周期', dataIndex: 'period', key: 'period' },
  { title: '最近一班同步时钟', dataIndex: 'lastExecution', key: 'lastExecution' },
  { title: '任务阻遏状态', dataIndex: 'status', key: 'status' },
  { title: '本轮成功包数', dataIndex: 'successCount', key: 'successCount' },
  { title: '本操作累坏数', dataIndex: 'failCount', key: 'failCount' },
  { title: '调度盘控制', key: 'action' }
];

const triggerSyncNow = (record: SyncTask) => {
  record.status = '进行中';
  message.loading({ content: `正在触发对端【${record.platform}】的遥测映射指令...`, duration: 1.2 })
    .then(() => {
      record.status = '成功';
      record.successCount += 1;
      const now = new Date();
      record.lastExecution = now.toISOString().replace('T', ' ').substring(0, 19);
      message.success(`任务【${record.name}】本轮主动同步完成，增加 ${Math.floor(Math.random() * 5 + 1)} 条数据库行。`);
    });
};

const showTaskLogs = (taskName: string) => {
  activeSubTab.value = 'log';
  message.info(`已定位至同步审计，过滤任务: ${taskName}`);
};

// 数据模型映射库
const devMappingColumns = [
  { title: '第三方网关代号', dataIndex: 'thirdId', key: 'thirdId' },
  { title: '第三方设备登记名称', dataIndex: 'thirdName', key: 'thirdName' },
  { title: '中节能统一标准分类', dataIndex: 'cecepType', key: 'cecepType' },
  { title: '中国节能系统标准台账绑定节点', dataIndex: 'cecepTarget', key: 'cecepTarget' },
  { title: '通信映射一致率', dataIndex: 'matchRatio', key: 'matchRatio' }
];

const mockDeviceMappings = [
  { key: '1', thirdId: 'GWE-300K-001', thirdName: 'GW_300K_INV_A', cecepType: '逆变器', cecepTarget: '1号-300kW光伏逆变器', matchRatio: '100% 同步完全' },
  { key: '2', thirdId: 'GOT-PCS-500K-1', thirdName: 'GOT_PCS_CABINET', cecepType: '储能PCS', cecepTarget: '500kW储能变流器PCM', matchRatio: '100% 同步完全' },
  { key: '3', thirdId: 'STR-CS-120K-1', thirdName: 'STAR_PILE_120K_01', cecepType: '充电桩', cecepTarget: '120kW双枪直流快充桩01', matchRatio: '100% 同步完全' },
  { key: '4', thirdId: 'WAS-METER-10KV', thirdName: 'METER_GATE_10KV_MAIN', cecepType: '关口电表', cecepTarget: '10kV网侧并网总电表', matchRatio: '100% 同步完全' }
];

const pointMappingColumns = [
  { title: '第三方底层寄存器字段', dataIndex: 'thirdField', key: 'thirdField' },
  { title: '统一国家电网点位编码', dataIndex: 'pointCode', key: 'pointCode' },
  { title: '变量物理中文标识', dataIndex: 'pointName', key: 'pointName' },
  { title: '默认计量单位', dataIndex: 'unit', key: 'unit' },
  { title: '映射状态', dataIndex: 'status', key: 'status' }
];

const mockPointMappings = [
  { key: '1', thirdField: 'ActivePower_AC', pointCode: 'PV_01_PAC', pointName: '光伏1号交流有功功率', unit: 'kW', status: '✅ 一致度对齐' },
  { key: '2', thirdField: 'E_Day_AC', pointCode: 'PV_01_EDAY', pointName: '光伏1号日发电量', unit: 'kWh', status: '✅ 一致度对齐' },
  { key: '3', thirdField: 'StateOfCharge', pointCode: 'ESS_SOC', pointName: '电池系统SOC', unit: '%', status: '✅ 一致度对齐' },
  { key: '4', thirdField: 'InvPowerActive', pointCode: 'PCS_PAC', pointName: '储能PCS有功功率', unit: 'kW', status: '✅ 一致度对齐' },
  { key: '5', thirdField: 'PortA_Current', pointCode: 'EV_01_IA', pointName: '120kW快充桩01A枪头电流', unit: 'A', status: '✅ 一致度对齐' }
];

// 同步日志 Audit
const syncLogs = ref([
  { key: '1', time: '2026-05-23 08:53:30', platform: '高特电子储能EMS平台', api: 'GET /v1/realtime', result: '成功', latency: '65ms', rows: '12条' },
  { key: '2', time: '2026-05-23 08:53:15', platform: '星络充电桩运营平台', api: '推送 /cecep/orders', result: '成功', latency: '40ms', rows: '1条' },
  { key: '3', time: '2026-05-23 08:53:00', platform: '固德威固瑞光伏监控平台', api: 'GET /v2/metrics', result: '成功', latency: '124ms', rows: '25条' },
  { key: '4', time: '2026-05-23 08:52:12', platform: '高特电子储能EMS平台', api: 'GET /v1/realtime', result: '成功', latency: '72ms', rows: '12条' },
  { key: '5', time: '2026-05-23 08:45:22', platform: '威胜电表计量网关平台', api: 'GET /meter/api', result: '失败', latency: '5002ms', rows: '0条' }
]);

const logColumns = [
  { title: '请求物理时间戳', dataIndex: 'time', key: 'time' },
  { title: '接入外部网关', dataIndex: 'platform', key: 'platform' },
  { title: '动作路径', dataIndex: 'api', key: 'api' },
  { title: '响应开销', dataIndex: 'latency', key: 'latency' },
  { title: '本轮提取物理条目', dataIndex: 'rows', key: 'rows' },
  { title: '事务判定', dataIndex: 'result', key: 'result' }
];

const clearLogs = () => {
  syncLogs.value = [];
  message.success('本地事务审计缓冲日志已清空。');
};

// 接入安全异控
const excColumns = [
  { title: '发生时钟', dataIndex: 'time', key: 'time' },
  { title: '故障依存源', dataIndex: 'platform', key: 'platform' },
  { title: '网络异常类别', dataIndex: 'type', key: 'type' },
  { title: '具体诊断信息报文', dataIndex: 'content', key: 'content' },
  { title: '高频极度严重等级', dataIndex: 'severity', key: 'severity' },
  { title: '现状判定', dataIndex: 'status', key: 'status' },
  { title: '控制台动作区', key: 'action' }
];

const resolveException = (record: any) => {
  message.loading({ content: '正在为故障平台注入重试序列并调合网卡...', duration: 1.2 })
    .then(() => {
      record.status = '已恢复';
      message.success(`握手重拨自律成功！异常【${record.type}】被排除，通道恢复正常传输线。`);
    });
};
</script>

<style scoped>
</style>
