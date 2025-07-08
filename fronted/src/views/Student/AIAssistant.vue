<template>
  <div class="ai-assistant-page">
    <StudentHeader />
    <div class="ai-assistant-container">
      <div class="background-overlay"></div>
      
      <div class="content-wrapper">
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
          <div class="features-grid" v-if="activeMainTab === 'features'">
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

          <!-- 历史记录区域 -->
          <div class="history-list" v-if="activeMainTab === 'history'">
            <div class="history-item" v-for="item in historyList" :key="item.id">
              <div class="history-header">
                <h3>{{ item.title }}</h3>
                <span class="history-time">{{ item.time }}</span>
              </div>
              <p class="history-content">{{ item.content }}</p>
            </div>
          </div>
        </div>

        <!-- 聊天部分 -->
        <div class="chat-section" v-if="showChat">
          <el-card class="chat-card">
            <div class="chat-header">
              <h3>对话记录</h3>
              <div class="chat-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="handleExport('json')"
                  :loading="exporting"
                >
                  导出JSON
                </el-button>
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handleExport('csv')"
                  :loading="exporting"
                >
                  导出CSV
                </el-button>
              </div>
            </div>
            <div class="chat-messages" ref="chatMessages">
              <div v-for="message in messages" :key="message.id" 
                   :class="['message', message.type]">
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time">{{ message.time }}</div>
              </div>
            </div>
            
            <div class="chat-input">
              <el-input
                v-model="inputMessage"
                placeholder="输入你的问题..."
                @keyup.enter="sendMessage"
                :disabled="loading"
              >
                <template #append>
                  <el-button type="primary" @click="sendMessage" :loading="loading">发送</el-button>
                </template>
              </el-input>
            </div>
          </el-card>
        </div>

        <!-- 添加配置面板 -->
        <div class="config-panel" v-if="showChat">
          <el-form :model="currentConfig" label-width="100px">
            <el-form-item label="知识点">
              <el-select v-model="currentConfig.knowledgePointIds" multiple placeholder="选择知识点">
                <el-option
                  v-for="point in questionConfig.knowledgePoints"
                  :key="point.id"
                  :label="point.name"
                  :value="point.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="题目类型">
              <el-select v-model="currentConfig.selectedTypes" multiple placeholder="选择题目类型">
                <el-option
                  v-for="type in questionConfig.questionTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="题目数量">
              <el-select v-model="currentConfig.quantity" placeholder="选择题目数量">
                <el-option
                  v-for="qty in questionConfig.quantities"
                  :key="qty.value"
                  :label="qty.label"
                  :value="qty.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="难度等级">
              <el-select v-model="currentConfig.difficulty" placeholder="选择难度等级">
                <el-option
                  v-for="diff in questionConfig.difficulties"
                  :key="diff.value"
                  :label="diff.label"
                  :value="diff.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="environment-status">
        当前环境: {{ currentEnvironment }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StudentHeader from '@/components/StudentHeader.vue'
import { API_CONFIG, exportQuestions } from '@/api/index.js'
import { ElMessage } from 'element-plus'

const searchQuery = ref('')
const activeMainTab = ref('features')
const activeSubTab = ref('marketing')
const showChat = ref(false)
const loading = ref(false)
const currentEnvironment = ref('生产API')
const exporting = ref(false)

// 添加配置选项
const questionConfig = ref({
  knowledgePoints: [
    { id: 1, name: '基础知识' },
    { id: 2, name: '进阶概念' },
    { id: 3, name: '高级应用' }
  ],
  questionTypes: [
    { value: 'single_choice', label: '单选题' },
    { value: 'multiple_choice', label: '多选题' },
    { value: 'true_false', label: '判断题' },
    { value: 'short_answer', label: '简答题' }
  ],
  difficulties: [
    { value: 1, label: '简单' },
    { value: 3, label: '中等' },
    { value: 5, label: '困难' }
  ],
  quantities: [
    { value: 5, label: '5题' },
    { value: 10, label: '10题' },
    { value: 20, label: '20题' },
    { value: 50, label: '50题' }
  ]
})

// 当前选择的配置
const currentConfig = ref({
  knowledgePointIds: [1],  // 默认选择第一个知识点
  selectedTypes: ['single_choice'],  // 默认单选题
  quantity: 1,  // 改为1题
  difficulty: 1  // 改为最简单难度
})

// 生成唯一的会话ID
const generateSessionId = () => {
  return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// 当前会话ID
const currentSessionId = ref(generateSessionId());

// API调用函数
const generateQuestions = async (input) => {
  try {
    loading.value = true;
    const sessionId = currentSessionId.value;
    const response = await fetch(`${API_CONFIG.BASE_URL}/questions-generate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        knowledge_point_ids: currentConfig.value.knowledgePointIds,
        question_types: currentConfig.value.selectedTypes,
        quantity: currentConfig.value.quantity,
        difficulty: currentConfig.value.difficulty,
        chatInput: input,
        sessionId: sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`网络请求失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('API响应:', data);
    return data;
  } catch (error) {
    console.error('生成问题失败:', error);
    throw error;
  } finally {
    loading.value = false;
  }
}

// 处理搜索
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    showChat.value = true;
    try {
      loading.value = true;
      // 添加用户消息
      messages.value.push({
        id: messages.value.length + 1,
        type: 'user',
        content: searchQuery.value,
        time: '刚刚'
      });

      // 添加AI思考消息
      const loadingMessageId = messages.value.length + 1;
      messages.value.push({
        id: loadingMessageId,
        type: 'ai',
        content: '正在思考中...',
        time: '刚刚'
      });

      // 调用API获取响应
      const response = await generateQuestions(searchQuery.value);
      
      // 更新AI消息
      const messageIndex = messages.value.findIndex(m => m.id === loadingMessageId);
      if (messageIndex !== -1) {
        if (response && response.data) {
          messages.value[messageIndex].content = response.data;
        } else {
          messages.value[messageIndex].content = '抱歉，我现在无法回答这个问题。请稍后再试。';
        }
      }

      // 清空搜索框
      searchQuery.value = '';
    } catch (error) {
      console.error('搜索请求失败:', error);
      messages.value.push({
        id: messages.value.length + 1,
        type: 'ai',
        content: '抱歉，发生了错误。请稍后再试。',
        time: '刚刚'
      });
    } finally {
      loading.value = false;
    }
  }
}

// 处理功能卡片点击
const handleFeatureClick = (feature) => {
  showChat.value = true;
  sendMessage(`请帮我${feature.title}：${feature.description}`);
}

// 聊天相关逻辑
const inputMessage = ref('')
const messages = ref([
  {
    id: 1,
    type: 'ai',
    content: '你好！我是你的AI学习助手，有什么我可以帮你的吗？',
    time: '刚刚'
  }
])

const sendMessage = async (message = null) => {
  const userInput = message || inputMessage.value;
  if (!userInput.trim()) return;

  // 添加用户消息
  messages.value.push({
    id: messages.value.length + 1,
    type: 'user',
    content: userInput,
    time: '刚刚'
  });

  if (!message) {
    inputMessage.value = '';
  }

  try {
    // 添加加载中的消息
    const loadingMessageId = messages.value.length + 1;
    messages.value.push({
      id: loadingMessageId,
      type: 'ai',
      content: '正在思考中...',
      time: '刚刚'
    });

    // 调用API获取响应
    const response = await generateQuestions(userInput);
    
    // 更新AI消息
    const messageIndex = messages.value.findIndex(m => m.id === loadingMessageId);
    if (messageIndex !== -1) {
      if (response && response.data) {
        messages.value[messageIndex].content = response.data;
      } else {
        messages.value[messageIndex].content = '抱歉，我现在无法回答这个问题。请稍后再试。';
      }
    }
  } catch (error) {
    console.error('发送消息失败:', error);
    messages.value.push({
      id: messages.value.length + 1,
      type: 'ai',
      content: '抱歉，发生了错误。请稍后再试。',
      time: '刚刚'
    });
  }
}

// 历史记录数据
const historyList = ref([
  {
    id: 1,
    title: '知识点解析',
    time: '2024-03-20 14:30',
    content: '完成了数学函数相关知识点的解析'
  },
  {
    id: 2,
    title: '练习题生成',
    time: '2024-03-19 16:45',
    content: '生成了一套数学练习题'
  }
])

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

// 定义主选项卡
const mainTabs = ref([
  { id: 'features', name: '功能助手' },
  { id: 'history', name: '历史记录' }
])

// 根据当前选项卡获取对应的功能特性（按行分组）
const currentFeatureRows = computed(() => {
  if (activeMainTab.value === 'features') {
    return features.value[activeSubTab.value] || []
  }
  return []
})

// 处理导出
const handleExport = async (format) => {
  try {
    if (!currentSessionId.value) {
      ElMessage.warning('请先生成问题后再导出');
      return;
    }

    exporting.value = true;
    const filename = `问题导出_${new Date().toISOString().split('T')[0]}`;
    const result = await exportQuestions(currentSessionId.value, format, filename);
    
    if (result.code === 0) {
      ElMessage.success(result.msg);
    } else {
      ElMessage.error(result.msg || '导出失败');
    }
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败，请稍后重试');
  } finally {
    exporting.value = false;
  }
}
</script>

<style scoped>
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
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
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
  height: 400px;
  display: flex;
  flex-direction: column;
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

/* 历史记录样式 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-item {
  background: rgba(255, 255, 255, 0.7);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
}

.history-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(31, 38, 135, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-header h3 {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.history-time {
  font-size: 14px;
  color: #666;
}

.history-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
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
</style> 
