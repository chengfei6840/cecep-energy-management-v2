<template>
  <a-layout class="min-h-screen">
    <!-- 左侧主侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      :width="256"
      style="background: #001529; box-shadow: 2px 0 8px 0 rgba(29,35,41,.05);"
    >
      <!-- 平台专属 Logo 区 -->
      <div class="flex items-center p-5 gap-2 border-b border-white/10">
        <div class="h-8 w-8 rounded bg-[#62B32E] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/10">
          CE
        </div>
        <div v-if="!collapsed" class="flex flex-col select-none transition-all duration-300">
          <span class="text-white font-bold leading-tight tracking-tight text-sm">CECEP 能源管理</span>
          <span class="text-[9px] text-white/40 font-medium tracking-normal mt-0.5 uppercase">Energy Control</span>
        </div>
      </div>

      <!-- 侧边栏主菜单 -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        class="border-none mt-3"
        style="background: transparent;"
        @click="handleMenuClick"
      >
        <a-menu-item key="dashboard" class="!my-1">
          <template #icon>
            <LayoutDashboard :size="18" class="text-slate-300" />
          </template>
          <span>首页总览</span>
        </a-menu-item>

        <a-menu-item key="big-screen" class="!my-1">
          <template #icon>
            <Tv :size="18" class="text-emerald-400 font-bold" />
          </template>
          <span class="text-emerald-300 font-medium">运营大屏</span>
        </a-menu-item>

        <a-sub-menu key="monitor-parent">
          <template #icon>
            <Activity :size="18" class="text-slate-300" />
          </template>
          <template #title>
            <span>运行监测</span>
          </template>
          <a-menu-item key="pv">
            <span>光伏智能监测</span>
          </a-menu-item>
          <a-menu-item key="storage">
            <span>储能系统监测</span>
          </a-menu-item>
          <a-menu-item key="charging">
            <span>充电桩群控制</span>
          </a-menu-item>
          <a-menu-item key="grid">
            <span>并网计量监测</span>
          </a-menu-item>
          <a-menu-item key="energy-flow">
            <span>实时能流分析</span>
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="report-parent">
          <template #icon>
            <FileSpreadsheet :size="18" class="text-slate-300" />
          </template>
          <template #title>
            <span>报表</span>
          </template>
          <a-menu-item key="revenue">
            <span>收益结算</span>
          </a-menu-item>
          <a-menu-item key="report">
            <span>数据报表</span>
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="smart-ops">
          <template #icon>
            <Wrench :size="18" class="text-slate-300" />
          </template>
          <template #title>
            <span>智慧运维</span>
          </template>
          <a-menu-item key="patrol-plan">
            <span>巡检计划</span>
          </a-menu-item>
          <a-menu-item key="patrol-task">
            <span>巡检任务</span>
          </a-menu-item>
          <a-menu-item key="patrol-record">
            <span>巡检记录</span>
          </a-menu-item>
          <a-menu-item key="alarm">
            <span class="flex items-center justify-between">
              <span>系统安全告警</span>
              <span v-if="activeAlarmsCount > 0" class="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
            </span>
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="management-parent">
          <template #icon>
            <Settings :size="18" class="text-slate-300" />
          </template>
          <template #title>
            <span>综合管理</span>
          </template>
          <a-menu-item key="integration">
            <span>第三方数据接入</span>
          </a-menu-item>
          <a-menu-item key="device">
            <span>资产台账与点位</span>
          </a-menu-item>
          <a-menu-item key="role">
            <span>角色管理</span>
          </a-menu-item>
          <a-menu-item key="member">
            <span>人员管理</span>
          </a-menu-item>
          <a-menu-item key="site-manage">
            <span>站点管理</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <!-- 右侧内容区域架 -->
    <a-layout class="flex flex-col">
      <!-- 顶部高保真 B 端导航 Header -->
      <a-layout-header class="!bg-white !px-6 flex items-center justify-between border-b border-slate-150 shadow-sm" style="height: 64px; line-height: 64px;">
        <!-- 侧栏收拢控制 & 站点标题 -->
        <div class="flex items-center gap-4">
          <button @click="collapsed = !collapsed" class="text-slate-500 hover:text-slate-800 transition cursor-pointer p-1 rounded hover:bg-slate-100">
            <Menu v-if="collapsed" :size="20" />
            <MenuIcon v-else :size="20" />
          </button>
          
          <span class="text-lg font-semibold text-slate-800 hidden sm:inline-block">
            光储充能源管理平台 一一 <span class="text-emerald-600 font-bold font-sans">一期工程</span>
          </span>
        </div>

        <!-- 顶部操作区 -->
        <div class="flex items-center gap-6">
          <!-- 核心交互1：站点动态切换 -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 flex items-center gap-1"><MapPin :size="14" /> 监控站点:</span>
            <a-select
              v-model:value="globalStore.activeSiteKey"
              style="width: 210px"
              class="cecep-station-select"
              :bordered="false"
              dropdown-class-name="cecep-dropdown"
              @change="handleSiteChange"
            >
              <a-select-option v-for="site in globalStore.sites" :key="site.key" :value="site.key">
                {{ site.name }}
              </a-select-option>
            </a-select>
          </div>

          <!-- 核心交互2：时间尺度切换 -->
          <div class="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              v-for="opt in timeOptions"
              :key="opt.value"
              @click="globalStore.timeWindow = opt.value"
              class="px-2.5 py-1 text-xs rounded-md font-medium transition cursor-pointer"
              :class="globalStore.timeWindow === opt.value ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-850'"
            >
              {{ opt.label }}
            </button>
          </div>

          <!-- 核心交互3：告警通知弹框/铃铛 -->
          <a-popover placement="bottomRight" trigger="click" width="340">
            <template #content>
              <div class="w-80 p-1">
                <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                  <span class="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                    <span class="h-2 w-2 rounded-full bg-red-500"></span> 瞬时异常告警 ({{ activeAlarmsCount }})
                  </span>
                  <router-link to="/alarm" class="text-xs text-emerald-600 hover:underline">查看全部</router-link>
                </div>
                <div class="space-y-2.5 max-h-72 overflow-y-auto">
                  <div
                    v-for="al in pendingAlarms"
                    :key="al.id"
                    class="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition border border-red-50"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-red-600 px-1.5 py-0.5 bg-red-50 rounded">{{ al.level }}</span>
                      <span class="text-[10px] text-slate-400">{{ al.time }}</span>
                    </div>
                    <div class="text-xs font-semibold text-slate-800 mt-1">{{ al.device }} - {{ al.type }}</div>
                    <p class="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{{ al.content }}</p>
                  </div>
                  <div v-if="pendingAlarms.length === 0" class="py-6 text-center text-slate-400 text-xs">
                    当前站点无未处理告警
                  </div>
                </div>
              </div>
            </template>
            <div class="relative cursor-pointer hover:bg-slate-50 p-1.5 rounded transition">
              <Bell :size="19" class="text-slate-600" />
              <span v-if="activeAlarmsCount > 0" class="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none animate-pulse">
                {{ activeAlarmsCount }}
              </span>
            </div>
          </a-popover>

          <!-- 核心操作区：用户头像及下拉 -->
          <a-dropdown placement="bottomRight">
            <div class="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded transition select-none">
              <div class="h-8 w-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                建
              </div>
              <div class="flex flex-col text-left leading-none">
                <span class="text-xs font-bold text-slate-700">张建国</span>
                <span class="text-[10px] text-slate-400 mt-1 font-sans">系统管理员</span>
              </div>
            </div>
            <template #overlay>
              <a-menu @click="handleUserMenu">
                <a-menu-item key="site">
                  <template #icon><MapPin :size="13" /></template>
                  <span>站点设置</span>
                </a-menu-item>
                <a-menu-item key="profile">
                  <template #icon><UserIcon :size="13" /></template>
                  <span>个人中心</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" class="!text-red-500">
                  <template #icon><LogOut :size="13" class="text-red-500" /></template>
                  <span>退出系统</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 二级导航 & 面包屑 -->
      <div class="bg-white border-b border-slate-100 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm shrink-0">
        <div class="flex items-center gap-3">
          <h1 class="text-base font-bold text-slate-800 m-0 leading-none flex items-center gap-2 border-r border-slate-200 pr-3">
            {{ pageTitle }}
          </h1>
          <a-breadcrumb class="m-0 leading-none">
            <a-breadcrumb-item><router-link to="/dashboard" class="text-xs">CECEP 平台</router-link></a-breadcrumb-item>
            <a-breadcrumb-item class="text-xs">{{ pageTitle }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        
        <!-- 今日安全运行天数等系统数据 -->
        <div class="flex items-center gap-4 text-xs">
          <span class="text-slate-400 flex items-center gap-1.5">
            中国节能绿色值: <span class="text-emerald-600 font-bold font-mono text-xs">{{ globalStore.metrics.todayCarbon }} tCO₂ 减排</span>
          </span>
          <span class="text-slate-300">|</span>
          <span class="text-slate-400">
            安全稳定运行: <span class="text-emerald-600 font-bold font-mono">1,428 天</span>
          </span>
        </div>
      </div>

      <!-- 核心页面视图容器 -->
      <a-layout-content class="flex-1 p-6 overflow-y-auto bg-[#F5F7FA]">
        <router-view v-slot="{ Component }">
          <transition name="fade-in" mode="out-made">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { globalStore } from '@/store';
import { mockSites } from '@/mock/data';

// 导入所有 Lucide 矢量图标
import {
  LayoutDashboard,
  Share2,
  Scale,
  Sun,
  Battery,
  Zap,
  Radio,
  Workflow,
  TrendingUp,
  Cpu,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  Bell,
  LogOut,
  MapPin,
  Menu,
  Menu as MenuIcon,
  User as UserIcon,
  Tv,
  Wrench,
  ClipboardList,
  CheckSquare,
  History,
  Activity
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

const collapsed = ref(false);
const selectedKeys = ref<string[]>([route.name?.toString().toLowerCase() || 'dashboard']);
const openKeys = ref<string[]>([]);

const timeOptions = [
  { label: '今日视图', value: 'today' },
  { label: '本月累计', value: 'month' },
  { label: '本年累计', value: 'year' }
];

// 计算当前页面名称
const pageTitle = computed(() => {
  return route.meta?.title || '能流分析与决策';
});

// 计算待处理故障数
const pendingAlarms = computed(() => {
  return globalStore.alarms.filter(a => a.status === '待确认');
});

const activeAlarmsCount = computed(() => {
  return pendingAlarms.value.length;
});

// 左栏选项点击
const keyToRouteNameMap: Record<string, string> = {
  'dashboard': 'Dashboard',
  'big-screen': 'BigScreen',
  'integration': 'ThirdPartyIntegration',
  'tariff': 'TariffManage',
  'pv': 'PvMonitor',
  'storage': 'StorageMonitor',
  'charging': 'ChargingMonitor',
  'grid': 'GridMonitor',
  'energy-flow': 'EnergyFlow',
  'revenue': 'RevenueOverview',
  'device': 'DeviceManage',
  'alarm': 'AlarmManage',
  'report': 'ReportCenter',
  'system': 'SystemManage',
  'patrol-plan': 'PatrolPlan',
  'patrol-task': 'PatrolTask',
  'patrol-record': 'PatrolRecord',
  'role': 'RoleManage',
  'member': 'UserManage',
  'site-manage': 'SiteManage'
};

const handleMenuClick = ({ key }: { key: string }) => {
  const targetRouteName = keyToRouteNameMap[key];
  if (targetRouteName) {
    router.push({ name: targetRouteName });
  } else if (['alarm-config', 'alarm-data', 'repair', 'washing-plan'].includes(key)) {
    const names: Record<string, string> = {
      'alarm-config': '组串告警配置',
      'alarm-data': '组串告警数据',
      'repair': '故障报修',
      'washing-plan': '清洗计划'
    };
    message.info(`原型演示：【${names[key]}】等模块暂未向演示账号开放。`);
  }
};

// 刷新路由菜单高亮
router.afterEach((to) => {
  // 根据路由路由名匹配高亮
  const nameStr = to.name?.toString();
  if (nameStr) {
    const foundKey = Object.keys(keyToRouteNameMap).find(k => keyToRouteNameMap[k] === nameStr);
    if (foundKey) {
      selectedKeys.value = [foundKey];
      
      // 自动展开对应的父级折叠菜单
      if (['pv', 'storage', 'charging', 'grid', 'energy-flow'].includes(foundKey)) {
        openKeys.value = ['monitor-parent'];
      } else if (['revenue', 'report'].includes(foundKey)) {
        openKeys.value = ['report-parent'];
      } else if (['patrol-plan', 'patrol-task', 'patrol-record', 'alarm'].includes(foundKey)) {
        openKeys.value = ['smart-ops'];
      } else if (['integration', 'device', 'role', 'member', 'site-manage'].includes(foundKey)) {
        openKeys.value = ['management-parent'];
      }
    } else {
      selectedKeys.value = [nameStr.toLowerCase()];
    }
  }
});

// 核心站点变动
const handleSiteChange = (val: string) => {
  const findSite = globalStore.sites.find(s => s.key === val);
  if (findSite) {
    message.success({
      content: `系统已重定向并刷新监控中心到: ${findSite.name}`,
      duration: 3
    });
  }
};

// 退出与用户设置
const handleUserMenu = ({ key }: { key: string }) => {
  if (key === 'logout') {
    localStorage.removeItem('cecep_is_logged_in');
    message.loading({ content: '正在安全退出中节能能源管理控制台...', duration: 1.5 })
      .then(() => {
        router.push({ name: 'Login' });
        message.success('您已成功断开控制台长连接并离线。');
      });
  } else {
    message.info(`原型演示：触发了【${key === 'profile' ? '个人中心' : '站点设置'}】菜单`);
  }
};
</script>

<style scoped>
/* 保证站点选择器足够干净不被默认主题干扰 */
.cecep-station-select :deep(.ant-select-selector) {
  padding: 0 4px !important;
  color: #10B981 !important; /* text-emerald-600 */
  font-weight: 700 !important;
  font-size: 14px !important;
  cursor: pointer;
}
.cecep-station-select :deep(.ant-select-arrow) {
  color: #10B981 !important;
}

/* 视图转场特效 */
.fade-in-enter-active,
.fade-in-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
}
</style>
