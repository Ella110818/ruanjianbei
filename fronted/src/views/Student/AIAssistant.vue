<template>
  <div class="ai-assistant-page">
    <StudentHeader />
    <div class="ai-assistant-container">
      <div class="background-overlay"></div>
      
      <!-- 初始欢迎界面 - 保持不变 -->
      <div class="content-wrapper" v-if="!hasStartedChat">
        <div class="welcome-section">
          <h1>学伴AI</h1>
          <p class="subtitle">你的AI学习助手</p>
        </div>

        <!-- 搜索框部分 -->
        <div class="search-section">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="AI能帮你解决哪些学习难题？"
              class="search-input"
              @keyup.enter="handleSearch"
            >
            <button class="search-button" @click="handleSearch" :disabled="loading">
              <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </div>

        <!-- 功能区域 -->
        <div class="features-container">
          <!-- 主选项卡 -->
          <div class="main-tabs">
            <div class="main-tab-item" 
                 v-for="tab in mainTabs" 
                 :key="tab.id"
                 :class="{ active: activeMainTab === tab.id }"
                 @click="activeMainTab = tab.id">
              {{ tab.name }}
            </div>
          </div>

          <!-- 功能卡片区域 -->
          <div class="features-grid">
            <div class="feature-row" v-for="(row, rowIndex) in currentFeatureRows" :key="rowIndex">
              <div class="feature-card" 
                   v-for="feature in row" 
                   :key="feature.id"
                   @click="handleFeatureClick(feature)">
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 对话界面 -->
      <div class="chat-layout" v-else>
        <div class="chat-messages-container">
          <div class="message-list">
            <div v-for="message in messages" 
                 :key="message.id" 
                 class="message-box">
              <div class="message-avatar">
                <img v-if="message.type === 'ai'" src="@/assets/智能助手-copy.png" class="avatar-image" alt="AI助手">
                <el-icon v-else class="avatar-icon"><User /></el-icon>
              </div>
              <div class="message-content-wrapper">
                <div class="message-header">
                  <span class="message-sender">{{ message.type === 'user' ? '我' : 'AI助手' }}</span>
                  <span class="message-time">{{ message.time }}</span>
                </div>
                <div class="message-content" :class="{ 'user-message': message.type === 'user' }">
                  <div class="text-content">{{ message.content }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部输入框 -->
        <div class="chat-input-container">
          <div class="chat-input-wrapper">
            <!-- 修改输入框标题部分 -->
            <div class="input-box">
              <div class="input-area">
                <div class="input-title">
                  <i class="icon">✎</i>AI生题
                </div>
                <textarea 
                  v-model="inputMessage"
                  placeholder="输入你的问题..."
                  class="chat-input"
                  @keyup.enter.exact="sendMessage"
                  @keyup.shift.enter="inputMessage += '\n'"
                ></textarea>
              </div>
              <button class="send-button" @click="sendMessage" :disabled="loading">
                <el-icon class="send-icon"><Position /></el-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StudentHeader from '@/components/StudentHeader.vue'
import { getCurrentUser } from '@/api/index.js'
import { ElMessage } from 'element-plus'
import { User, Position } from '@element-plus/icons-vue'  // 移除 Edit 图标导入

const searchQuery = ref('')
const activeMainTab = ref('features')
const activeSubTab = ref('marketing')
const loading = ref(false)
const hasStartedChat = ref(false)
const inputMessage = ref('')
const messages = ref([
  {
    id: 1,
    type: 'ai',
    content: '你好！我是你的AI学习助手，有什么我可以帮你的吗？',
    time: '刚刚'
  }
])

// 生成唯一的会话ID
const generateSessionId = () => {
  return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// 当前会话ID
const currentSessionId = ref(generateSessionId());

// API调用函数
const generateQuestionsFromAPI = async (input) => {
  try {
    loading.value = true;
    const sessionId = currentSessionId.value;
    
    // 调用学生对话接口
    const response = await fetch('https://de566d16a53d.ngrok-free.app/api/ai/student-dialogue/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: input,
        session_id: sessionId,
        context: {
          description: ''  // 可选的上下文信息
        }
      })
    });

    const responseData = await response.json();
    console.log('API响应:', responseData);
    
    // 检查响应状态（支持两种格式）
    const isSuccess = (responseData.success && responseData.status_code === 200) || 
                     (responseData.code === 0 && responseData.msg);
                     
    if (!isSuccess) {
      throw new Error(responseData.message || responseData.msg || '请求失败');
    }
    
    return responseData;
  } catch (error) {
    console.error('生成回答失败:', error);
    throw error;
  } finally {
    loading.value = false;
  }
}

// 修改 generateQuestions 函数的响应处理
const handleQuestionResponse = (response) => {
  if (!response) {
    console.error('响应为空');
    return '抱歉，无法获取回答。';
  }
  
  try {
    // 检查API响应格式（支持两种格式）
    const isSuccess = (response.success && response.status_code === 200) || 
                     (response.code === 0 && response.msg === '获取知识点列表成功');
                     
    if (!isSuccess) {
      console.error('API响应失败:', response);
      return response.message || response.msg || '抱歉，无法获取回答。';
    }

    // 返回AI的回答
    const answer = response.data.answer;
    if (typeof answer === 'string') {
      // 尝试解析JSON字符串中的professional_answer
      try {
        const jsonAnswer = JSON.parse(answer);
        return jsonAnswer.response.professional_answer || '抱歉，没有获取到有效回答。';
      } catch (e) {
        // 如果解析失败，直接返回原始答案
        return answer;
      }
    }
    return '抱歉，没有获取到有效回答。';

  } catch (error) {
    console.error('处理题目响应失败:', error);
    return {
      questions: [],
      session_key: '',
      saved_exercises: [],
      failed_exercises: 0,
      error: '抱歉，处理题目数据时出错。'
    };
  }
}

// 添加用户状态管理
const currentUser = ref(null);

// 获取当前用户信息
const loadUserInfo = async () => {
  try {
    console.log('开始获取用户信息');
    const response = await getCurrentUser();
    console.log('获取用户信息响应:', response);
    
    // 检查响应状态（支持两种格式）
    const isSuccess = (response.success && response.status_code === 200) || 
                     (response.code === 0 && response.data);
                     
    if (isSuccess) {
      currentUser.value = response.data;
      console.log('当前用户信息:', currentUser.value);
    } else {
      console.error('获取用户信息失败:', response);
      ElMessage.error(response.message || response.msg || '获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};



// 组件挂载时加载用户信息
onMounted(() => {
  loadUserInfo();
});

// 修改 handleSearch 函数
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    hasStartedChat.value = true; // 设置为对话状态
    try {
      loading.value = true;
      const messageId = messages.value.length + 1;
      messages.value.push({
        id: messageId,
        type: 'user',
        content: searchQuery.value,
        time: formatTime(new Date())
      });

      const loadingMessageId = messages.value.length + 1;
      messages.value.push({
        id: loadingMessageId,
        type: 'ai',
        content: '正在思考中...',
        time: formatTime(new Date())
      });

      const response = await generateQuestionsFromAPI(searchQuery.value);
      const processedResponse = handleQuestionResponse(response);
      
      const messageIndex = messages.value.findIndex(m => m.id === loadingMessageId);
      if (messageIndex !== -1) {
        messages.value[messageIndex] = {
          id: loadingMessageId,
          type: 'ai',
          content: processedResponse,
          time: formatTime(new Date())
        };
      }

      searchQuery.value = '';
    } catch (error) {
      console.error('生成题目失败:', error);
      messages.value.push({
        id: messages.value.length + 1,
        type: 'ai',
        content: '抱歉，我现在无法回答你的问题。',
        time: formatTime(new Date())
      });
    } finally {
      loading.value = false;
    }
  }
}

// 添加时间格式化函数
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 处理功能卡片点击
const handleFeatureClick = (feature) => {
  hasStartedChat.value = true; // 设置为对话状态
  sendMessage(`请帮我${feature.title}：${feature.description}`);
}

// 聊天相关逻辑
const sendMessage = async (message = null) => {
  const userInput = message || inputMessage.value;
  if (!userInput.trim()) return;

  const messageId = messages.value.length + 1;
  messages.value.push({
    id: messageId,
    type: 'user',
    content: userInput,
    time: formatTime(new Date())
  });

  if (!message) {
    inputMessage.value = '';
  }

  try {
    const loadingMessageId = messages.value.length + 1;
    messages.value.push({
      id: loadingMessageId,
      type: 'ai',
      content: {
        questions: [],
        session_key: '',
        saved_exercises: [],
        failed_exercises: 0,
        error: '正在生成题目...'
      },
      time: formatTime(new Date())
    });

    const response = await generateQuestionsFromAPI(userInput);
    const processedResponse = handleQuestionResponse(response);
    
    const messageIndex = messages.value.findIndex(m => m.id === loadingMessageId);
    if (messageIndex !== -1) {
      messages.value[messageIndex] = {
        id: loadingMessageId,
        type: 'ai',
        content: processedResponse,
        time: formatTime(new Date())
      };
    }
  } catch (error) {
    console.error('生成题目失败:', error);
    messages.value.push({
      id: messages.value.length + 1,
      type: 'ai',
      content: {
        questions: [],
        session_key: '',
        saved_exercises: [],
        failed_exercises: 0,
        error: '抱歉，生成题目时发生错误。'
      },
      time: formatTime(new Date())
    });
  }
}

// 移除历史记录数据
// const historyList = ref([])

// 定义功能特性
const features = ref({
  marketing: [
    [
      {
        id: 1,
        title: '在线学习助手',
        description: '为学生提供即时的学习支持，以及教学内容的解答'
      },
      {
        id: 2,
        title: '实时练习指导',
        description: '根据学生当前学习进度，以及学生自身需求，生成练习题目'
      },
      {
        id: 3,
        title: '学习效果评估',
        description: '实时评估学习效果，提供个性化学习建议'
      },
      {
        id: 4,
        title: '学习进度跟踪',
        description: '记录和分析学习进度，生成学习报告'
      }
    ],
    [
      {
        id: 5,
        title: '知识点解析',
        description: '深入解析课程重难点，帮助理解和掌握'
      },
      {
        id: 6,
        title: '错题本管理',
        description: '智能记录错题，分析错误原因，提供改进建议'
      },
      {
        id: 7,
        title: '学习计划制定',
        description: '根据个人情况，制定合理的学习计划'
      },
      {
        id: 8,
        title: '学习资源推荐',
        description: '智能推荐相关学习资源和参考材料'
      }
    ]
  ]
})

// 移除历史记录选项卡
const mainTabs = ref([
  { id: 'features', name: '功能助手' }
])

// 根据当前选项卡获取对应的功能特性（按行分组）
const currentFeatureRows = computed(() => {
  if (activeMainTab.value === 'features') {
    return features.value[activeSubTab.value] || []
  }
  return []
})

</script>

<style scoped>
/* 保持原有的欢迎页面样式不变 */
.ai-assistant-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.ai-assistant-container {
  flex: 1;
  background-image: url('@/assets/ai2.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  height: calc(100vh - 80px); /* 调整容器高度，为输入框留出空间 */
  overflow-y: auto;
  padding-bottom: 160px; /* 增加底部padding */
}

/* 修改背景样式 */
.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background: transparent;
  pointer-events: none;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 10px;
  margin-top: 80px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-section h1 {
  font-size: 45px;
  color: #1B1B61;
  margin-bottom: 1px;
}

.subtitle {
  font-size: 20px;
  color: #606266;
}

/* 搜索框样式 */
.search-section {
  max-width: 900px;
  margin: 0 auto 40px;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 15px;
  padding: 5px;
  border: 2px solid #409EFF;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.search-input {
  flex: 1;
  border: none;
  padding: 15px 25px;
  font-size: 16px;
  outline: none;
  color: #333;
  background: transparent;
  width: 100%;
}

.search-input::placeholder {
  color: #999;
}

.search-button {
  background: #409EFF;
  border: none;
  border-radius: 50%;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 5px;
  color: white;
  transition: all 0.3s;
  padding: 0;
}

.search-button:hover {
  background: #66b1ff;
  transform: scale(1.05);
}

.search-button svg {
  width: 20px;
  height: 20px;
}

/* 功能区域样式优化 */
.features-container {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  max-width: 1100px;
  margin: 0 auto;
}

/* 主选项卡样式 */
.main-tabs {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.main-tab-item {
  font-size: 17px;
  color: #666;
  cursor: pointer;
  padding: 8px 0;
  position: relative;
  transition: all 0.3s;
}

.main-tab-item:hover {
  color: #409EFF;
}

.main-tab-item.active {
  color: #409EFF;
  font-weight: 600;
}

.main-tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #409EFF;
  border-radius: 2px;
}

/* 子选项卡样式调整 */
.category-tabs {
  display: flex;
  gap: 30px;
  margin: 10px 0 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.tab-item {
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding: 8px 0;
  position: relative;
  transition: all 0.3s;
}

.tab-item:hover {
  color: #409EFF;
}

.tab-item.active {
  color: #409EFF;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #409EFF;
  border-radius: 2px;
}

.features-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.feature-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.7);
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.feature-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 20px rgba(31, 38, 135, 0.1);
}

.feature-card h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.feature-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.chat-section {
  margin-top: 40px;
}

.chat-card {
  height: auto;
  min-height: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.chat-actions {
  display: flex;
  gap: 10px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  width: 100%;
  max-width: 100%;
}

.message {
  margin-bottom: 20px;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
}

.message.ai {
  margin-right: auto;
}

.message-content {
  padding: 12px 16px;
  border-radius: 8px;
  background: #f5f7fa;
  color: #303133;
}

.message.user .message-content {
  background: #409EFF;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-align: right;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #ebeef5;
}

/* 移除历史记录相关样式 */
.history-list,
.history-item,
.history-header,
.history-time,
.history-content {
  display: none;
}

/* 添加新的样式 */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.environment-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.search-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.config-panel {
  background: #f5f7fa;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 题目列表样式 */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.question-item {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.question-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  color: #666;
  font-size: 14px;
  align-items: center;
}

.question-number {
  font-weight: bold;
  color: #409EFF;
}

.question-type {
  background: #e6f1fc;
  color: #409EFF;
  padding: 2px 8px;
  border-radius: 4px;
}

.question-difficulty {
  color: #f56c6c;
}

.question-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.question-content {
  font-size: 15px;
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  padding: 8px 15px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.option-item:hover {
  background: #e6f1fc;
  color: #409EFF;
}

/* 调整AI消息样式 */
.message.ai .message-content {
  background: #ffffff;
  padding: 0;
  width: 100%;
}

.message.ai .question-list {
  background: transparent;
}

/* 调整消息容器样式 */
.message {
  margin-bottom: 20px;
  width: 100%;
}

.message.user {
  margin-left: auto;
  width: auto;
}

.message.ai {
  margin-right: auto;
  width: 100%;
}

/* 消息内容样式 */
.text-content {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
  text-align: left;
  background: rgba(255, 255, 255, 0.7); /* 将透明度从 0.9 改为 0.7，数值范围 0-1，越小越透明 */
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  width: 100%;
  margin: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

/* AI消息样式 */
.message.ai .message-content {
  background: transparent !important;
  padding: 12px 4px;
  box-shadow: none;
  text-align: left;
  width: 100%;
}

.message.ai .text-content {
  background: rgba(255, 255, 255, 0.7); /* 保持一致的透明度 */
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

/* 用户消息样式 - 完全移除背景和边框 */
.message.user .message-content {
  background: none;
  padding: 0;
  box-shadow: none;
  text-align: left;
  width: 100%;
}

.message.user .text-content {
  background: none;
  backdrop-filter: none;
  padding: 4px 0;
  border-radius: 0;
  box-shadow: none;
  color: #333;
  border: none;
}

/* 移除题目列表的特殊样式 */
.question-list {
  background: transparent;
}

.question-item {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 15px;
}

/* 移除所有可能的背景 */
.message-box {
  background: transparent !important;
}

.message-content-wrapper {
  background: none !important;
}

.message-content {
  background: none !important;
}

/* 消息框布局 */
.message-box {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 800px;
  padding: 0;
  margin-bottom: 24px;
  align-items: flex-start;
  justify-content: flex-start;
  background: transparent;
}

.message-content-wrapper {
  flex: 1;
  width: 100%;
  max-width: 800px;
}

.message-content {
  word-break: break-word;
  width: 100%;
  margin-bottom: 0;
}

/* 移除之前的用户消息蓝色背景样式 */
.message-content.user-message {
  background: transparent;
  width: 100%;
}

/* 调整头像大小和样式 */
.message-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 20px;
  color: #666;
}

/* 调整发送者名称和时间样式 */
.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px; /* 调整头部与内容的间距 */
}

/* 发送者名称和时间样式 */
.message-sender {
  font-size: 14px; /* 调整发送者名称大小 */
  font-weight: 500;
  color: #666;
}

.message-time {
  font-size: 12px; /* 调整时间字体大小 */
  color: #999;
}

/* 输入框容器样式 */
.chat-input-container {
  position: fixed;
  bottom: 800px; /* 增加到 80px，让输入框更明显地往上移 */
  left: 0;
  right: 0;
  padding: 20px;
  background: transparent;
  z-index: 10;
  display: flex;
  justify-content: center;
}

.chat-input-wrapper {
  width: 800px;
  position: relative;
  z-index: 11;
}

.input-box {
  display: flex;
  align-items: flex-start; /* 改为flex-start以适应更高的输入框 */
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-height: 120px; /* 设置容器最小高度 */
  position: relative;
  z-index: 12;
  width: 100%;
}

.chat-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px 18px;
  font-size: 14px;
  background: transparent;
  color: #333;
  height: 100px !important; /* 使用!important确保高度生效 */
  min-height: 100px !important; /* 使用!important确保最小高度生效 */
  line-height: 2;
  width: 100%;
  position: relative;
  z-index: 13;
  resize: none;
}

.send-button {
  align-self: flex-end; /* 将发送按钮对齐到底部 */
  min-width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #409EFF;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
  margin: 0 4px;
  position: relative;
  z-index: 13;
}

.send-button:hover {
  background: #66b1ff;
  transform: scale(1.05);
}

.send-button:disabled {
  background: #a0cfff;
  opacity: 0.7;
}

.send-icon {
  font-size: 18px;
}

.submit-button {
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.submit-button:hover {
  background: #66b1ff;
}

.submit-button:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

/* 移除可能导致进度条的样式 */
.chat-input-container::before,
.chat-input-container::after,
.chat-layout::before,
.chat-layout::after {
  display: none;
}

/* 移除所有可能的水平线 */
.chat-layout::before,
.chat-layout::after,
.chat-messages-container::before,
.chat-messages-container::after,
.message-box::before,
.message-box::after,
.chat-input-container::before,
.chat-input-container::after {
  display: none !important;
  content: none !important;
}

/* 确保背景图片不会显示额外的线条 */
.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background: transparent;
  pointer-events: none;
}

/* 聊天布局容器，调整底部padding，为输入框腾出空间 */
.chat-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 20px;
  padding-bottom: 180px; /* 相应增加底部padding */
  position: relative;
  z-index: 2;
  margin-top: 64px;
  overflow-y: auto;
}

/* 聊天消息容器 */
.chat-messages-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80px; /* 增加底部margin，确保内容不被输入框遮挡 */
}

/* 减少消息之间的间距 */
.message-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.message-box {
  margin-bottom: 8px;
}

/* 消息框样式 */
.message-box {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 0;
  margin-bottom: 20px;
  align-items: flex-start;
  justify-content: flex-start; /* 确保消息靠左对齐 */
}

/* 消息内容容器 */
.message-content-wrapper {
  flex: 1;
  max-width: calc(100% - 48px);
}

/* 输入框容器样式 */
.chat-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: transparent;
  z-index: 10;
  display: flex;
  justify-content: center;
}

.chat-input-wrapper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 11;
}

/* 调整头像大小和位置 */
.message-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

/* 消息内容样式 */
.message-content {
  width: 100%;
  word-break: break-word;
}

/* 调整AI消息样式使其更紧凑 */
.message.ai .message-content {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.message.ai .text-content {
  padding: 0;
  background: none;
  backdrop-filter: none;
  box-shadow: none;
}

/* 用户消息样式 */
.message.user .message-content {
  background: transparent;
  padding: 12px 4px; /* 调整用户消息的内边距 */
  box-shadow: none;
  text-align: left;
}

.message.user .text-content {
  padding: 0;
  font-size: 15px;
  line-height: 1.6;
}

/* 消息框布局 */
.message-box {
  display: flex;
  gap: 16px; /* 增加头像与消息之间的距离 */
  width: 100%;
  padding: 0;
  margin-bottom: 24px;
  align-items: flex-start;
  justify-content: flex-start;
}

/* 消息头部样式 */
.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px; /* 增加头部与内容的间距 */
  padding: 0 4px;
}

/* 调整消息头部样式 */
.message-header {
  margin-bottom: 4px;
  padding: 0;
}

/* 移除所有可能的背景和边框 */
.message-content-wrapper {
  background: none !important;
}

.message-content {
  background: none !important;
}

/* 修改输入框容器样式 */
.input-box-container {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.input-box-header {
  margin-bottom: 12px;
  padding: 0 8px;
}

.input-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  padding-left: 8px;
}

.input-subtitle {
  font-size: 12px;
  color: #666;
}

/* 修改输入框样式 */
.input-box {
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.input-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
  text-align: left;
}

.chat-input {
  border: none;
  outline: none;
  padding: 8px 0;
  font-size: 14px;
  background: transparent;
  color: #333;
  min-height: 60px;
  resize: vertical;
  line-height: 1.5;
  width: 100%;
}

.chat-input::placeholder {
  color: rgba(144, 147, 153, 0.6);
}

/* 调整发送按钮位置 */
.send-button {
  align-self: flex-end;
  margin-bottom: 8px;
}

/* 添加AI标题样式 */
.ai-title {
  font-size: 24px;
  font-weight: 600;
  color: #1B1B61;
  margin-bottom: 16px;
  text-align: center;
}

/* 调整输入框容器样式 */
.chat-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: transparent;
  z-index: 10;
  display: flex;
  justify-content: center;
}

.chat-input-wrapper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 11;
}

/* 恢复输入框标题样式 */
.input-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  padding-left: 8px;
}

/* 移除之前添加的ai-title样式 */
.input-title {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  padding-left: 4px;
}

.input-title .icon {
  font-style: normal;
  font-size: 16px;
  margin-right: 2px;
}
</style> 

