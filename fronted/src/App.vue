<template>
  <router-view />
  <EnvironmentSwitch />
</template>

<script setup>
import EnvironmentSwitch from '@/components/EnvironmentSwitch.vue'
import { onMounted } from 'vue'

onMounted(() => {
  // 设置为生产环境
  localStorage.setItem('USE_MOCK', 'false')
})
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
