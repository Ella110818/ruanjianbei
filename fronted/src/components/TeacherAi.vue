<template>
  <div class="ai-container">
    <!-- 底部区域：输入框和历史记录 -->
    <div class="bottom-section">
      <!-- 左侧主要区域 -->
      <div class="main-content">
        <!-- 功能卡片区域 -->
        <div class="features-section">
          <div class="feature-grid">
            <img 
              src="@/assets/study.png" 
              alt="实时记录" 
              class="feature-image" 
              @click="handleFeatureClick('record')"
            >
            <img 
              src="@/assets/timu.png" 
              alt="阅读助手" 
              class="feature-image" 
              @click="handleFeatureClick('quiz')"
            >
            <img 
              src="@/assets/ppt.png" 
              alt="PPT创作" 
              class="feature-image" 
              @click="handleFeatureClick('ppt')"
            >
          </div>
        </div>

        <!-- 输入框区域 -->
        <div class="chat-input-section">
          <div class="chat-input-container">
            <input 
              type="text" 
              class="chat-input" 
              placeholder="你想问什么..."
              v-model="inputMessage"
              @keyup.enter="handleSendMessage"
            >
            <button class="send-button" @click="handleSendMessage">
              <span class="send-icon">➤</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧历史记录 -->
      <div class="history-section">
        <div class="history-list">
          <div class="history-item" v-for="(record, index) in recentRecords" :key="index">
            <div class="history-content">
              <div class="history-title">{{ record.title }}</div>
              <div class="history-info">
                <span class="history-type">{{ record.type }}</span>
                <span class="history-time">{{ record.time }}</span>
              </div>
            </div>
            <div class="history-icon">
              <i>{{ record.icon }}</i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeacherAi',
  data() {
    return {
      inputMessage: '',
      recentRecords: [
        { 
          title: '会议网课语音转文字',
          type: '音频',
          time: '02-47:46',
          icon: '🎤'
        },
        { 
          title: 'AI帮你解读西游记',
          type: '图书本',
          time: '08-29 11:42',
          icon: '📚'
        },
        { 
          title: '一分钟读透专业论文',
          type: '论文稿',
          time: '08-29 11:41',
          icon: '📄'
        }
      ]
    }
  },
  methods: {
    handleFeatureClick(type) {
      switch(type) {
        case 'record':
          console.log('开始录音');
          break;
        case 'quiz':
          console.log('生成题目');
          break;
        case 'ppt':
          console.log('开始创作PPT');
          break;
      }
    },
    handleSendMessage() {
      if (this.inputMessage.trim()) {
        console.log('发送消息:', this.inputMessage);
        this.inputMessage = '';
      }
    }
  }
}
</script>

<style scoped>
.ai-container {
  padding: 32px;
  min-height: 100vh;
  background: #F4F8FB;
  display: flex;
  flex-direction: column;
}

.bottom-section {
  display: flex;
  gap: 24px;
  flex: 1;
  height: calc(100vh - 100px);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.features-section {
  flex: 1;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 20px 0;
}

.feature-image {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.feature-image:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

/* 输入框区域样式 */
.chat-input-section {
  padding: 0 20px 20px 20px;
  margin-top: auto;
}

.chat-input-container {
  display: flex;
  align-items: center;
  background: #F4F8FB;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  height: 64px;
}

.chat-input {
  flex: 1;
  border: none;
  padding: 12px;
  font-size: 16px;
  outline: none;
  background: transparent;
  height: 100%;
  color: #333;
}

.chat-input::placeholder {
  color: #9CA3AF;
}

.send-button {
  background: #6366F1;
  color: white;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 8px;
}

.send-button:hover {
  background: #4F46E5;
}

.send-icon {
  font-size: 20px;
  transform: rotate(90deg);
}

/* 历史记录区域样式 */
.history-section {
  width: 300px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  background: #F4F8FB;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.history-item:hover {
  transform: translateX(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.history-content {
  flex: 1;
}

.history-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-type {
  font-size: 12px;
  color: #666;
}

.history-time {
  font-size: 12px;
  color: #999;
}

.history-icon {
  font-size: 20px;
  color: #666;
  margin-left: 12px;
}
</style> 