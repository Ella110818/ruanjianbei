<template>
  <div class="ai-content">
    <!-- 顶部图片区域 -->
    <div class="image-row">
      <img src="@/assets/timu.png" alt="题目生成" />
      <img src="@/assets/study.png" alt="教学助手" />
      <img src="@/assets/ppt.png" alt="PPT创作" />
    </div>
    <!-- 底部输入和历史记录区域 -->
    <div class="ai-bottom-row">
      <div class="bottom-input-panel">
        <div class="input-bar">
          <textarea
            v-model="bottomInput"
            class="plain-input"
            :placeholder="'你想咨询什么...'"
            rows="3"
            @keyup.enter="handleSend"
          />
          <button class="send-btn-rect" @click="handleSend">
            <svg viewBox="0 0 1024 1024" width="18" height="18" style="vertical-align:middle;margin-right:4px;"><path d="M928 112L96 464c-15.2 6.4-15.2 28.8 0 35.2l160 67.2c8 3.2 16 3.2 24 0l160-67.2c15.2-6.4 15.2-28.8 0-35.2l-160-67.2c-8-3.2-16-3.2-24 0L96 464c-15.2 6.4-15.2 28.8 0 35.2l832 352c15.2 6.4 32-4.8 32-21.6V133.6c0-16.8-16.8-28-32-21.6z" fill="#fff"/></svg>
            发送
          </button>
        </div>
      </div>
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

// 新增底部输入框相关
const bottomInput = ref('')
const handleSend = () => {
  if (bottomInput.value.trim()) {
    // 这里可以添加发送逻辑
    bottomInput.value = ''
  }
}
</script>

<style scoped>
.ai-content {
  padding: 40px 0 0 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ebff 100%);
}

.image-row {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 40px;
}

.image-row img {
  width: 380px;
  height: 300px;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: 0 6px 24px rgba(99,102,241,0.10);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}
.image-row img:hover {
  transform: scale(1.04);
  box-shadow: 0 12px 32px rgba(99,102,241,0.18);
}

.ai-bottom-row {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 48px;
  margin-top: 60px;
}

.bottom-input-panel {
  width: 700px;
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(99,102,241,0.10);
  padding: 24px 24px 16px 24px;
  position: static;
  z-index: 2000;
}

.input-bar {
  display: flex;
  align-items: flex-end;
  background: transparent;
  border-radius: 16px;
  box-shadow: none;
  padding: 0;
}

.plain-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 17px;
  background: #f7f8fa;
  color: #333;
  padding: 12px 0 12px 0;
  min-height: 60px;
  max-height: 180px;
  resize: vertical;
  line-height: 1.7;
  border-radius: 12px;
  width: 100%;
  box-sizing: border-box;
  transition: box-shadow 0.2s, border 0.2s;
  border: 1.5px solid #e0e7ef;
}
.plain-input:focus {
  border: 1.5px solid #6366f1;
  box-shadow: 0 0 0 2px #e0e7ef;
}

.send-btn-rect {
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #6366f1 0%, #2979ff 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 0 26px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  margin-left: 18px;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.10);
}
.send-btn-rect:hover {
  background: linear-gradient(90deg, #4f46e5 0%, #1565c0 100%);
  box-shadow: 0 4px 16px rgba(99,102,241,0.15);
}

.history-panel {
  width: 320px;
  min-height: 420px;
  max-height: 600px;
  background: rgba(255,255,255,0.95);
  display: flex;
  flex-direction: column;
  padding: 24px 20px 20px 20px;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(99,102,241,0.10);
  overflow: hidden;
  backdrop-filter: blur(2px);
  position: static;
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
  flex: 1;
  overflow-y: auto;
  margin-top: 12px;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: #e0e7ef #fff;
}
.history-list::-webkit-scrollbar {
  width: 6px;
  background: #fff;
}
.history-list::-webkit-scrollbar-thumb {
  background: #e0e7ef;
  border-radius: 6px;
}

.history-item {
  padding: 12px 16px;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 10px;
  margin-bottom: 4px;
}
.history-item:hover {
  background-color: #f0f4ff;
  color: #6366f1;
}
</style> 