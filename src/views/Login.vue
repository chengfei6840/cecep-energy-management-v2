<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
    
    <!-- 背景流光特效与抽象电网脉络 -->
    <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]"></div>
    <div class="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse"></div>
    <div class="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-600/10 blur-[120px] animate-pulse"></div>

    <!-- 登录窗口主体：分左右两栏的尊贵现代感面板 -->
    <div class="w-full max-w-5xl bg-slate-900/85 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 m-4">
      
      <!-- 左栏：中节能愿景与宏伟指标插画 -->
      <div class="w-full md:w-1/2 p-10 bg-gradient-to-br from-emerald-950/80 via-slate-955 to-slate-950 flex flex-col justify-between border-r border-slate-800/50">
        <div>
          <!-- Logo & 企业标识 -->
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
              节
            </div>
            <div class="flex flex-col">
              <span class="text-white font-extrabold tracking-widest text-lg leading-none">中国节能 CECEP</span>
              <span class="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold mt-1">China Energy Conservation</span>
            </div>
          </div>
          
          <div class="mt-16 space-y-6">
            <h2 class="text-2xl font-bold text-white leading-snug tracking-wide">
              光储充一体化智慧能源管理平台
            </h2>
            <p class="text-slate-400 text-sm leading-relaxed max-w-md">
              中国节能“多能互联，碳索未来”一期示范项目。构建光伏并网遥测、储能削峰填谷决策、智慧充电负荷均衡及结算的绿色综合运营中枢。
            </p>
          </div>
        </div>

        <div class="mt-12 space-y-4 pt-8 border-t border-slate-800/60 pb-4 hidden md:block">
          <div class="flex items-center gap-4">
            <div class="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span class="text-emerald-400 font-bold font-mono text-sm">32G</span>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-300">秒级数据高频云映射</div>
              <div class="text-[10px] text-slate-500">第三方平台API及网关高吞吐吞吐吞吐接入</div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span class="text-emerald-400 font-bold font-mono text-sm">98%</span>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-300">绿电消纳闭环预测</div>
              <div class="text-[10px] text-slate-500">站内光伏绿电完全覆盖负荷充储配给</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右栏：高保真登录表单表区域 -->
      <div class="w-full md:w-1/2 p-10 flex flex-col justify-center bg-slate-900/40">
        <div class="mb-8">
          <h3 class="text-xl font-bold text-white">欢迎回到控制中心</h3>
          <p class="text-xs text-slate-500 mt-2">请登录以查阅站点实时能流图与电网结算收益项</p>
        </div>

        <a-form layout="vertical" class="space-y-4">
          <!-- 用户名 -->
          <a-form-item label="管理员账号(Account)" class="custom-label">
            <a-input
              v-model:value="form.username"
              placeholder="请输入登录名 / admin"
              size="large"
              class="custom-input"
            >
              <template #prefix>
                <UserIcon class="text-slate-500" :size="16" />
              </template>
            </a-input>
          </a-form-item>

          <!-- 密码 -->
          <a-form-item label="安全访问授权码(Password)" class="custom-label">
            <a-input-password
              v-model:value="form.password"
              placeholder="请输入密码 / 123456"
              size="large"
              class="custom-input"
              @pressEnter="handleLogin"
            >
              <template #prefix>
                <LockIcon class="text-slate-500" :size="16" />
              </template>
            </a-input-password>
          </a-form-item>

          <!-- 备用选项 -->
          <div class="flex items-center justify-between text-xs pb-2">
            <a-checkbox v-model:checked="rememberMe" class="custom-chk">
              <span class="text-slate-400 font-medium">记住本安全设备</span>
            </a-checkbox>
            <a class="text-emerald-500 hover:text-emerald-400 cursor-pointer transition">忘记授权密钥?</a>
          </div>

          <!-- 登录按钮 -->
          <a-button
            type="primary"
            size="large"
            block
            :loading="loading"
            class="!h-11 !rounded-lg !bg-emerald-600 hover:!bg-emerald-500 !border-none font-bold text-sm tracking-wider"
            @click="handleLogin"
          >
            鉴权进入能控中枢
          </a-button>
        </a-form>

        <!-- 凭据小贴纸演示 -->
        <div class="mt-8 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 flex items-center gap-3">
          <div class="h-6 w-6 rounded bg-emerald-500/15 flex items-center justify-center">
            <InfoIcon class="text-emerald-400" :size="14" />
          </div>
          <div class="text-slate-400 text-xs">
            演示首期账号: <span class="text-emerald-400 font-bold font-mono">admin</span> 
            密码: <span class="text-emerald-400 font-bold font-mono">123456</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { User as UserIcon, Lock as LockIcon, Info as InfoIcon } from 'lucide-vue-next';

const router = useRouter();

const form = reactive({
  username: 'admin',
  password: 'admin' // 默认测试密码也可以是 123456
});

const rememberMe = ref(true);
const loading = ref(false);

const handleLogin = () => {
  // 密码或登录验证
  if (!form.username || !form.password) {
    message.error('请输入登录名与安全访问密码！');
    return;
  }

  if (form.username === 'admin' && (form.password === '123456' || form.password === 'admin')) {
    loading.value = true;
    message.loading({ content: '正在完成中节能一期鉴权中心签名校验并解密能流参数...', duration: 1.2 })
      .then(() => {
        localStorage.setItem('cecep_is_logged_in', 'true');
        message.success({ content: '欢迎回来，张建国！数字签名已验证，能流控制台已开启。', duration: 3 });
        router.push({ name: 'Dashboard' });
        loading.value = false;
      });
  } else {
    message.error('账号或密码不匹配，签名鉴权拒绝！请核对控制台预设密码：admin / 123456');
  }
};
</script>

<style scoped>
/* 针对暗黑质感定制 labels */
:deep(.custom-label .ant-form-item-label > label) {
  color: #94A3B8 !important; /* text-slate-400 */
  font-size: 11px !important;
  font-weight: 600 !important;
  text-transform: uppercase;
}

:deep(.custom-input.ant-input-affix-wrapper) {
  background: rgba(15, 23, 42, 0.4) !important;
  border-color: #334155 !important;
  color: #FFFFFF !important;
  transition: all 0.2s ease;
}

:deep(.custom-input.ant-input-affix-wrapper:hover),
:deep(.custom-input.ant-input-affix-wrapper-focused) {
  border-color: #10B981 !important; /* emerald-550 border */
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15) !important;
}

:deep(.custom-input input) {
  color: #FFFFFF !important;
}

:deep(.custom-chk .ant-checkbox-inner) {
  background-color: transparent !important;
  border-color: #475569 !important;
}

:deep(.custom-chk .ant-checkbox-checked .ant-checkbox-inner) {
  background-color: #10B981 !important;
  border-color: #10B981 !important;
}
</style>
