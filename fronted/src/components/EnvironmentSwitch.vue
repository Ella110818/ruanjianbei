<template>
  <div class="environment-switch">
    <el-button 
      type="primary" 
      size="small" 
      @click="handleSwitch"
      :class="{ 'is-local': isLocal }"
    >
      {{ currentEnvName }}
    </el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { currentEnvironment, switchEnvironment, API_CONFIG } from '@/api'

const isLocal = computed(() => currentEnvironment.value === 'LOCAL')
const currentEnvName = computed(() => API_CONFIG.ENVIRONMENTS[currentEnvironment.value].name)

const handleSwitch = () => {
  switchEnvironment()
}
</script>

<style scoped>
.environment-switch {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.environment-switch .el-button {
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.environment-switch .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.environment-switch .el-button.is-local {
  background-color: #67c23a;
  border-color: #67c23a;
}

.environment-switch .el-button.is-local:hover {
  background-color: #85ce61;
  border-color: #85ce61;
}
</style> 