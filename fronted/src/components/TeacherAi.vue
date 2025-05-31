<template>
  <div class="ai-content">
    <!-- 顶部图片区域 -->
    <div class="image-row">
      <img src="@/assets/ppt.png" alt="PPT创作" />
      <img src="@/assets/study.png" alt="教学助手" />
      <img src="@/assets/timu.png" alt="题目生成" />
    </div>
    
    <!-- 右下角历史记录 -->
    <div class="history-panel">
      <div class="history-header">
        <el-button class="new-chat-btn" type="primary" color="#6366f1">
          + 新建对话
        </el-button>
        <el-input
          v-model="searchQuery"
          class="search-input"
          placeholder="搜索"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <div class="history-list">
        <div class="history-item" v-for="(item, index) in historyList" :key="index">
          {{ item.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const searchQuery = ref('')
const historyList = ref([
  { content: '最近30天' },
  { content: '你是一个帮用我解决问题的AI' },
  { content: '你提长篇博论：1.简短' }
])
</script>

<style scoped>
.ai-content {
  padding: 20px;
  position: relative;
  min-height: calc(100vh - 40px);
}

.image-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 30px;
}

.image-row img {
  width: 380px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.history-panel {
  position: fixed;
  top: 420px;
  right: 20px;
  width: 280px;
  height: calc(100vh - 460px);
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.new-chat-btn {
  width: 100%;
  border-radius: 20px;
  height: 40px;
  font-size: 14px;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  background-color: #f5f5f5;
  height: 40px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
  overflow-y: auto;
  flex: 1;
}

.history-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 8px;
}

.history-item:hover {
  background-color: #f5f5f5;
  color: #6366f1;
}
</style> 