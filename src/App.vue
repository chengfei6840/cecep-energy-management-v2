<template>
  <a-config-provider :locale="zhCN" :theme="customTheme">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';

// 定义中节能专属蓝绿交相辉映的 B端 品牌主题色
const customTheme = {
  token: {
    colorPrimary: '#1677FF',     // Modern minimalist primary blue
    colorSuccess: '#62B32E',     // Clean CECEP Green
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    borderRadius: 6,             // Crisper, sleeker corners
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  }
};
</script>

<style>
/* 全局平滑过渡与排版微调 */
body {
  margin: 0;
  background-color: #F5F7FA;
  font-family: var(--font-sans);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
