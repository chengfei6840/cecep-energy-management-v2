import { reactive, watch } from 'vue';
import { getOverviewMetrics, mockSites, mockTariffs, mockAlarms, mockUsers, mockExceptions, mockRoles } from '@/mock/data';

// 初始化全局共享响应式状态
const storedSite = localStorage.getItem('cecep_active_site') || 'site-01';
const storedTime = localStorage.getItem('cecep_time_window') || 'today';

export const globalStore = reactive({
  activeSiteKey: storedSite,
  timeWindow: storedTime, // 'today' | 'month' | 'year'
  
  // 模拟全局状态数据源，允许增删改，实现完全高保真联动
  users: [...mockUsers].map(u => ({
    ...u,
    allowedSites: u.id === 'u-1' ? ['site-01', 'site-02', 'site-03'] : u.id === 'u-2' ? ['site-01', 'site-02'] : ['site-01']
  })),
  roles: [...mockRoles],
  sites: [...mockSites],
  tariffs: [...mockTariffs],
  exceptions: [...mockExceptions],
  alarms: [...mockAlarms],
  
  // 生态计量计算属性
  get currentSite() {
    return this.sites.find(s => s.key === this.activeSiteKey) || this.sites[0];
  },
  
  get metrics() {
    return getOverviewMetrics(this.activeSiteKey);
  }
});

// 持久化机制
watch(() => globalStore.activeSiteKey, (newVal) => {
  localStorage.setItem('cecep_active_site', newVal);
});

watch(() => globalStore.timeWindow, (newVal) => {
  localStorage.setItem('cecep_time_window', newVal);
});

// 预装默认登录记录
if (!localStorage.getItem('cecep_is_logged_in')) {
  localStorage.setItem('cecep_is_logged_in', 'false');
}
