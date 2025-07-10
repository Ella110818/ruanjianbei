<template>
  <div class="teacher-ai-container">
    <div class="action-buttons">
      <el-button 
        type="primary" 
        @click="handleGeneratePPT"
        :loading="isGeneratingPPT"
      >
        {{ isGeneratingPPT ? '正在生成PPT...' : '生成知识点PPT' }}
      </el-button>
    </div>
    <!-- 其他AI功能的内容可以在这里添加 -->
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isGeneratingPPT: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['generate-ppt'])

const handleGeneratePPT = () => {
  emit('generate-ppt')
}
</script>

<style scoped>
.teacher-ai-container {
  padding: 20px;
}

.action-buttons {
  margin-bottom: 20px;
}
</style> 