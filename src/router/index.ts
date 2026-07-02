import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '用户登录 - CECEP 平台' }
  },
  {
    path: '/big-screen',
    name: 'BigScreen',
    component: () => import('@/views/BigScreen.vue'),
    meta: { title: '光储充能源运营高保真大屏' }
  },
  {
    path: '/',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页总览' }
      },
      {
        path: 'integration',
        name: 'ThirdPartyIntegration',
        component: () => import('@/views/ThirdPartyIntegration.vue'),
        meta: { title: '第三方数据接入' }
      },
      {
        path: 'tariff',
        name: 'TariffManage',
        component: () => import('@/views/TariffManage.vue'),
        meta: { title: '分时电价管理' }
      },
      {
        path: 'pv',
        name: 'PvMonitor',
        component: () => import('@/views/PvMonitor.vue'),
        meta: { title: '光伏智能监测' }
      },
      {
        path: 'storage',
        name: 'StorageMonitor',
        component: () => import('@/views/StorageMonitor.vue'),
        meta: { title: '能储系统监测' }
      },
      {
        path: 'charging',
        name: 'ChargingMonitor',
        component: () => import('@/views/ChargingMonitor.vue'),
        meta: { title: '充电桩群控制' }
      },
      {
        path: 'grid',
        name: 'GridMonitor',
        component: () => import('@/views/GridMonitor.vue'),
        meta: { title: '并网计量监测' }
      },
      {
        path: 'energy-flow',
        name: 'EnergyFlow',
        component: () => import('@/views/EnergyFlow.vue'),
        meta: { title: '多能流分析' }
      },
      {
        path: 'revenue',
        name: 'RevenueOverview',
        component: () => import('@/views/RevenueCenter.vue'),
        meta: { title: '收益结算中心' }
      },
      {
        path: 'device',
        name: 'DeviceManage',
        component: () => import('@/views/DeviceConfig.vue'),
        meta: { title: '资产台账与点位' }
      },
      {
        path: 'alarm',
        name: 'AlarmManage',
        component: () => import('@/views/AlarmManage.vue'),
        meta: { title: '系统安全告警' }
      },
      {
        path: 'report',
        name: 'ReportCenter',
        component: () => import('@/views/ReportCenter.vue'),
        meta: { title: '数据报表报推' }
      },
      {
        path: 'system',
        name: 'SystemManage',
        component: () => import('@/views/SystemManage.vue'),
        meta: { title: '系统策略管理' }
      },
      {
        path: 'system/role',
        name: 'RoleManage',
        component: () => import('@/views/system/RoleManage.vue'),
        meta: { title: '角色权限管理' }
      },
      {
        path: 'system/member',
        name: 'UserManage',
        component: () => import('@/views/system/UserManage.vue'),
        meta: { title: '用户组织管理' }
      },
      {
        path: 'system/site-manage',
        name: 'SiteManage',
        component: () => import('@/views/system/SiteManage.vue'),
        meta: { title: '站点网格管理' }
      },
      {
        path: 'patrol/plan',
        name: 'PatrolPlan',
        component: () => import('@/views/patrol/PatrolPlan.vue'),
        meta: { title: '巡检计划' }
      },
      {
        path: 'patrol/task',
        name: 'PatrolTask',
        component: () => import('@/views/patrol/PatrolTask.vue'),
        meta: { title: '巡检任务' }
      },
      {
        path: 'patrol/record',
        name: 'PatrolRecord',
        component: () => import('@/views/patrol/PatrolRecord.vue'),
        meta: { title: '巡检记录' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// 路由守卫：模拟登录拦截
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('cecep_is_logged_in') === 'true';
  if (to.name !== 'Login' && !isLoggedIn) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
