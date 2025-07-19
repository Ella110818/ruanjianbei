<template>
  <div class="teacher-layout">
    <TeacherHeader />
    <div class="main-container">
      <TeacherSidebar 
        :sideTab="sideTab"
        :courseMenuOpen="courseMenuOpen"
        :courses="courses"
        @update:sideTab="updateSideTab"
        @update:courseMenuOpen="updateCourseMenuOpen"
      />
      <div class="content-area">
        <div class="qa-container">
          <div class="chat-messages" ref="chatMessages">
            <div v-for="message in messages" :key="message.id" 
                 :class="['message', message.type === 'ai' ? 'message-ai' : 'message-user']">
              <div class="message-avatar">
                <img v-if="message.type === 'ai'" :src="aiAvatar" class="avatar-image" alt="AI助手">
                <img v-else :src="userAvatar" class="avatar-image" alt="用户头像">
              </div>
              <div class="message-content-wrapper">
                <div class="message-header">
                  <span class="message-sender">{{ message.type === 'user' ? '我' : 'AI助手' }}</span>
                  <span class="message-time">{{ message.time }}</span>
                </div>
                <div class="message-content" :class="{ 'user-message': message.type === 'user' }">
                  <div class="text-content" v-if="message.type === 'user'">{{ message.content }}</div>
                  <div class="text-content markdown-content" v-else v-html="formatMessageContent(message.content)"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="chat-input-area">
            <div class="input-box">
              <div class="input-area">
                <textarea 
                  v-model="userInput"
                  placeholder="请输入您的问题..."
                  class="chat-input"
                  @keyup.enter.exact="handleSend"
                  @keyup.shift.enter="userInput += '\n'"
                ></textarea>
              </div>
              <button class="send-button" @click="handleSend" :disabled="loading">
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
import { ref, onMounted } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import { ElMessage } from 'element-plus'
import { Position } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import { API_CONFIG } from '@/api'

// 创建markdown解析器
const md = new MarkdownIt({
  breaks: true,
  linkify: true
})

// 格式化时间函数
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 状态变量
const sideTab = ref('qa-assistant')
const courseMenuOpen = ref(false)
const courses = ref([])
const userInput = ref('')
const chatMessages = ref(null)
const loading = ref(false)
const currentSessionId = ref('session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9))

// AI聊天相关
const aiAvatar = new URL('@/assets/智能助手-copy.png', import.meta.url).href
const userAvatar = new URL('@/assets/avatar.png', import.meta.url).href

// 聊天消息
const messages = ref([
  {
    id: 1,
    type: 'ai',
    content: '你好！我是你的问答助手，请问有什么可以帮助你的吗？',
    time: formatTime(new Date())
  }
])

// 更新侧边栏状态
const updateSideTab = (value) => {
  sideTab.value = value
}

const updateCourseMenuOpen = (value) => {
  courseMenuOpen.value = value
}

// 格式化消息内容
const formatMessageContent = (content) => {
  if (typeof content !== 'string') return content
  
  if (content === '正在思考中...') {
    return `<div class="ai-loading"><span class="loading-dots">${content}</span></div>`
  }
  
  const sanitizedContent = content
    .replace(/<(?!\/?(strong|em|p|code|pre|blockquote|h[1-6]|ul|ol|li|hr|br)(?=>|\s.*>))\/?(?:.*?)>/gi, '')
    .replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;')
  
  return md.render(sanitizedContent)
}

// 处理发送消息
const handleSend = async () => {
  if (!userInput.value.trim()) return

  // 添加用户消息
  const messageId = messages.value.length + 1
  messages.value.push({
    id: messageId,
    type: 'user',
    content: userInput.value,
    time: formatTime(new Date())
  })

  // 添加AI思考消息
  const loadingMessageId = messages.value.length + 1
  messages.value.push({
    id: loadingMessageId,
    type: 'ai',
    content: '正在思考中...',
    time: formatTime(new Date())
  })

  // 清空输入
  const question = userInput.value
  userInput.value = ''

  try {
    loading.value = true
    
    const requestData = {
      query: question.trim(),
      session_id: currentSessionId.value,
      context: {}
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/ai/student-dialogue/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': localStorage.getItem('token') || ''
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.data) {
      // 替换加载消息为实际回复
      const messageIndex = messages.value.findIndex(msg => msg.id === loadingMessageId)
      if (messageIndex !== -1) {
        messages.value[messageIndex] = {
          id: loadingMessageId,
          type: 'ai',
          content: data.data.answer || '抱歉，我没有找到合适的答案',
          time: formatTime(new Date())
        }
      }

      // 更新会话ID
      if (data.data.session_id) {
        currentSessionId.value = data.data.session_id
      }
    } else {
      throw new Error(data.message || '获取AI回复失败')
    }
  } catch (error) {
    console.error('AI助手对话失败:', error)
    // 替换加载消息为错误消息
    const messageIndex = messages.value.findIndex(msg => msg.id === loadingMessageId)
    if (messageIndex !== -1) {
      messages.value[messageIndex] = {
        id: loadingMessageId,
        type: 'ai',
        content: '抱歉，服务出现了问题，请稍后再试。\n错误信息：' + error.message,
        time: formatTime(new Date())
      }
    }
    ElMessage.error('对话失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 可以在这里添加初始化逻辑
})
</script>

<style scoped>
/* 保持原有的基础样式 */
.teacher-layout {
  min-height: 100vh;
  background: #f5f7ff;
}

.main-container {
  display: flex;
  padding-top: 64px;
}

.content-area {
  flex: 1;
  margin-top: 25px;
  margin-left: 320px;
  padding: 0;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.qa-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

/* 聊天消息样式 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 80%;
  margin-bottom: 20px;
}

.message-ai {
  align-self: flex-start;
}

.message-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content-wrapper {
  flex: 1;
  max-width: calc(100% - 48px);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.message-sender {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-content {
  background: #f5f7ff;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  max-width: 100%;
}

.user-message {
  background: #e8f3ff !important;
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
}

/* 输入框样式 */
.chat-input-area {
  padding: 20px;
  border-top: 1px solid #e6e6e6;
  background: #fff;
  position: sticky;
  bottom: 0;
}

.input-box {
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.input-area {
  flex: 1;
  display: flex;
  flex-direction: column;
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

.send-button {
  align-self: flex-end;
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
  margin-left: 12px;
}

.send-button:hover {
  background: #66b1ff;
  transform: scale(1.05);
}

.send-button:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.send-icon {
  font-size: 18px;
}

/* AI加载动画样式 */
.ai-loading {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
}

.loading-dots {
  color: #666;
  font-size: 14px;
  position: relative;
}

.loading-dots::after {
  content: '';
  animation: loading-dots 1.5s infinite;
}

@keyframes loading-dots {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
  100% { content: ''; }
}

/* Markdown 内容样式 */
:deep(.markdown-content) {
  line-height: 1.6;
}

:deep(.markdown-content h3) {
  font-size: 1.2em;
  margin: 1em 0 0.5em;
  color: #333;
}

:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

:deep(.markdown-content li) {
  margin: 0.3em 0;
}

:deep(.markdown-content p) {
  margin: 0.5em 0;
}

:deep(.markdown-content strong) {
  font-weight: 600;
  color: #409EFF;
}

:deep(.markdown-content code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

:deep(.markdown-content pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

:deep(.markdown-content blockquote) {
  border-left: 4px solid #ddd;
  margin: 0;
  padding-left: 1em;
  color: #666;
}

/* 响应式设计 */
@media screen and (max-width: 1366px) {
  .content-area {
    margin-left: 260px;
  }
}

@media screen and (max-width: 1024px) {
  .content-area {
    margin-left: 240px;
  }
}
</style> 