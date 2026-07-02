<template>
  <div class="space-y-6 font-sans">
    
    <!-- 子页面标签 -->
    <div class="bg-white p-2 rounded-xl border border-slate-150 shadow-sm flex flex-wrap gap-2">
      <button
        v-for="tab in sysTabs"
        :key="tab.value"
        @click="activeSubTab = tab.value"
        class="px-4 py-2 text-xs rounded-lg font-bold transition cursor-pointer"
        :class="activeSubTab === tab.value ? 'bg-[#005BAC] text-white shadow-sm shadow-[#005BAC]/25' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- TAB 1: 用户及权限 -->
    <div v-if="activeSubTab === 'users'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <h3 class="text-sm font-bold text-slate-850 m-0 flex items-center gap-1.5">
          <Users :size="15" class="text-[#005BAC]" />
          平台入册管理用户及角色审计清单
        </h3>
        <a-button type="primary" class="!bg-[#005BAC] hover:!bg-blue-650 !border-none text-xs font-bold" @click="openUserModal(null)">
          + 邀请驻场用户
        </a-button>
      </div>

      <a-table :data-source="globalStore.users" :columns="userColumns" size="middle" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'role'">
            <a-tag color="processing">{{ record.role }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge status="success" text="有效在职" />
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex items-center gap-3">
              <a-button size="small" type="link" class="!text-xs !p-0 text-[#005BAC]" @click="openUserModal(record)">
                编辑
              </a-button>
              <a-button size="small" type="link" class="!text-xs !p-0 text-amber-500" @click="toggleUser(record)">
                禁用
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- TAB 2: 全局运行策略选项 -->
    <div v-if="activeSubTab === 'policy'" class="bg-white rounded-xl border border-slate-150 shadow-sm p-5 space-y-5">
      <div class="border-b border-slate-100 pb-3">
        <h3 class="text-sm font-bold text-slate-850 m-0">微网自适应联动自动驾驶参数</h3>
      </div>

      <div class="max-w-2xl space-y-4">
        <div class="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-205 rounded-xl">
          <div>
            <div class="text-xs font-bold text-slate-700">自动峰谷放电联动调节安全自愈 (Peak Arbitrage Sync)</div>
            <p class="text-[11px] text-slate-400 mt-1">触发时，EMS自愈决策中枢直接下发120kW级逆变变压指令，防范总线最大需量越界。</p>
          </div>
          <a-switch v-model:checked="autoBalance" @change="onTogglePolicy('自适应自愈放电控哨')" />
        </div>

        <div class="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-205 rounded-xl">
          <div>
            <div class="text-xs font-bold text-slate-700">充电桩峰时并网动态限流保护并载阀</div>
            <p class="text-[11px] text-slate-400 mt-1">在10:00-15:00尖段，桩最大输入有功缩减 10% 优先回补主厂房加工高能耗。</p>
          </div>
          <a-switch v-model:checked="autoShaving" @change="onTogglePolicy('动态过负限载')" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span class="text-[11.5px] font-bold text-slate-500">网侧 CT 主备高频轮询耗阻时刻度:</span>
            <a-select v-model:value="pollingSpeed" style="width: 100%" @change="onTogglePolicy('高频采样延迟')">
              <a-select-option value="high">每 2 秒一次 (极稳)</a-select-option>
              <a-select-option value="mid">每 5 秒一次 (平衡)</a-select-option>
              <a-select-option value="low">每 10 秒一次 (低耗)</a-select-option>
            </a-select>
          </div>

          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span class="text-[11.5px] font-bold text-slate-500">微网历史结算冷归档期限:</span>
            <a-select v-model:value="archiveDays" style="width: 100%" @change="onTogglePolicy('数据自动归档周期')">
              <a-select-option value="90">90 天 (紧凑)</a-select-option>
              <a-select-option value="180">180 天 (规范)</a-select-option>
              <a-select-option value="360">360 天 (全账期)</a-select-option>
            </a-select>
          </div>
        </div>
      </div>
    </div>

    <!-- 成员编辑模态弹窗 -->
    <a-modal
      v-model:open="isUserModalOpen"
      title="中节能系统微网成员成员登记审计"
      @ok="saveUser"
      ok-text="确认并核发主钥匙密钥"
      cancel-text="放弃"
    >
      <a-form layout="vertical" class="space-y-3.5 p-3">
        <a-form-item label="成员全姓名" required>
          <a-input v-model:value="userModel.name" />
        </a-form-item>
        <div class="grid grid-cols-2 gap-3">
          <a-form-item label="企业用户工号 (SSID)" required>
            <a-input v-model:value="userModel.username" />
          </a-form-item>
          <a-form-item label="角色权限分类" required>
            <a-select v-model:value="userModel.role">
              <a-select-option value="系统超级管理员">系统超级管理员</a-select-option>
              <a-select-option value="站房运营操作官">站房运营操作官</a-select-option>
              <a-select-option value="差费结算会计">差费结算会计</a-select-option>
            </a-select>
          </a-form-item>
        </div>
        <a-form-item label="手机号码/双重对位认证" required>
          <a-input v-model:value="userModel.phone" />
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { globalStore } from '@/store';
import { Users } from 'lucide-vue-next';
import { message } from 'ant-design-vue';

const sysTabs = [
  { label: '企业用户访问审计', value: 'users' },
  { label: '全局调度策略总网', value: 'policy' }
];

const activeSubTab = ref('users');

const userColumns = [
  { title: '平台工号 ID', dataIndex: 'id', key: 'id', fontWeight: 'bold' },
  { title: '登录标识', dataIndex: 'username', key: 'username' },
  { title: '成员真姓名', dataIndex: 'name', key: 'name' },
  { title: '授权角色组别', dataIndex: 'role', key: 'role' },
  { title: '登记安全手机', dataIndex: 'phone', key: 'phone' },
  { title: '当前访问状态', key: 'status' },
  { title: '操作区', key: 'action' }
];

const toggleUser = (record: any) => {
  message.info(`已执行对成员【${record.name}】的临时冻结保护，停止密钥认证成功。`);
};

// 策略
const autoBalance = ref(true);
const autoShaving = ref(false);
const pollingSpeed = ref('mid');
const archiveDays = ref('180');

const onTogglePolicy = (title: string) => {
  message.loading({ content: `正在安全修改全局策略【${title}】并同步向微网下发参数...`, duration: 0.8 })
    .then(() => {
      message.success(`参数【${title}】已于 CECEP 网关核心完成热部署并落盘保存。`);
    });
};

// 成员 modal
const isUserModalOpen = ref(false);
const userModel = reactive<any>({
  id: '',
  username: '',
  name: '',
  role: '站房运营操作官',
  phone: ''
});

const openUserModal = (record: any | null) => {
  if (record) {
    Object.assign(userModel, {
      id: record.id,
      username: record.username,
      name: record.name,
      role: record.role,
      phone: record.phone
    });
  } else {
    Object.assign(userModel, {
      id: 'USR-' + Date.now().toString().slice(-4),
      username: 'cecep_staff',
      name: '李工',
      role: '站房运营操作官',
      phone: '13800138000'
    });
  }
  isUserModalOpen.value = true;
};

const saveUser = () => {
  if (!userModel.name || !userModel.username) {
    message.error('请把成员全名和工卡账号填写完整！');
    return;
  }
  
  const idx = globalStore.users.findIndex(u => u.id === userModel.id);
  if (idx !== -1) {
    globalStore.users[idx] = { ...globalStore.users[idx], ...userModel };
    message.success(`成员【${userModel.name}】档案修订成功。`);
  } else {
    globalStore.users.push({
      id: userModel.id,
      username: userModel.username,
      name: userModel.name,
      role: userModel.role,
      phone: userModel.phone,
      status: '启用'
    });
    message.success(`新驻场成员【${userModel.name}】注册成功，主登入口密码已发送至其手机！`);
  }
  isUserModalOpen.value = false;
};
</script>

<style scoped>
</style>
