<template>
  <div class="ai-content">
    <!-- 顶部图片区域 -->
    <div class="image-row">
      <img src="@/assets/timu.png" alt="题目生成" />
      <img src="@/assets/study.png" alt="教学助手" @click="handleCourseGeneration"/>
      <img src="@/assets/ppt.png" alt="PPT创作" />
    </div>
    <!-- 底部输入和历史记录区域 -->
    <div class="ai-bottom-row">
      <div class="bottom-input-panel">
        <div class="input-bar">
          <textarea
            v-model="bottomInput"
            class="plain-input"
            :placeholder="currentMode === 'course' ? '请输入课程要求，包含：\n1. 课程名称\n2. 课程描述\n3. 学科\n4. 年级\n5. 其他要求' : '你想咨询什么...'"
            rows="3"
            @keyup.enter="handleSend"
          />
          <button class="send-btn-rect" @click="handleSend" :disabled="loading">
            <svg v-if="!loading" viewBox="0 0 1024 1024" width="18" height="18" style="vertical-align:middle;margin-right:4px;"><path d="M928 112L96 464c-15.2 6.4-15.2 28.8 0 35.2l160 67.2c8 3.2 16 3.2 24 0l160-67.2c15.2-6.4 15.2-28.8 0-35.2l-160-67.2c-8-3.2-16-3.2-24 0L96 464c-15.2 6.4-15.2 28.8 0 35.2l832 352c15.2 6.4 32-4.8 32-21.6V133.6c0-16.8-16.8-28-32-21.6z" fill="#fff"/></svg>
            <span v-else class="loading-spinner"></span>
            {{ loading ? '生成中...' : '发送' }}
          </button>
        </div>
      </div>
      <div class="history-panel">
        <div class="history-header">
          <el-button class="new-chat-btn" type="primary" color="#6366f1" @click="newChat">
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

    <!-- 对话内容展示区域 -->
    <div v-if="messages.length > 0" class="chat-messages">
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.type]">
        <div class="message-content" v-html="message.content"></div>
        <div class="message-time">{{ message.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { generateCourseContent } from '@/api/index.js'
import { ElMessage } from 'element-plus'

const searchQuery = ref('')
const historyList = ref([
  { content: '最近30天' },
  { content: '你是一个帮用我解决问题的AI' },
  { content: '你提长篇博论：1.简短' }
])

const currentMode = ref('normal') // 'normal' 或 'course'
const loading = ref(false)
const messages = ref([])

// 新增底部输入框相关
const bottomInput = ref('')

// 解析用户输入的课程信息
const parseCourseInput = (input) => {
  const lines = input.split('\n')
  const courseInfo = {
    course_name: 'Python编程基础',
    course_description: 'Python入门课程，包含基础语法和简单应用',
    subject: 'Python编程',
    grade_level: '大学一年级',
    additional_requirements: '简单易懂，适合初学者',
    chapter_count: 5,  // 减少章节数，使内容更简洁
    chatInput: input || '默认Python基础课程生成',
    sessionId: 'session-' + Date.now()
  }

  // 如果用户有输入，则覆盖默认值
  if (input) {
    lines.forEach(line => {
      if (line.includes('课程名称')) {
        courseInfo.course_name = line.split('：')[1]?.trim() || courseInfo.course_name
      } else if (line.includes('课程描述')) {
        courseInfo.course_description = line.split('：')[1]?.trim() || courseInfo.course_description
      } else if (line.includes('学科')) {
        courseInfo.subject = line.split('：')[1]?.trim() || courseInfo.subject
      } else if (line.includes('年级')) {
        courseInfo.grade_level = line.split('：')[1]?.trim() || courseInfo.grade_level
      } else if (line.includes('其他要求')) {
        courseInfo.additional_requirements = line.split('：')[1]?.trim() || courseInfo.additional_requirements
      }
    })
  }

  return courseInfo
}

// 处理课程生成模式
const handleCourseGeneration = () => {
  currentMode.value = 'course'
  messages.value = [{
    type: 'ai',
    content: `已设置默认课程信息：<br>
    1. 课程名称：Python编程基础<br>
    2. 课程描述：Python入门课程，包含基础语法和简单应用<br>
    3. 学科：Python编程<br>
    4. 年级：大学一年级<br>
    5. 其他要求：简单易懂，适合初学者<br><br>
    您可以直接点击发送使用默认配置，或输入新的课程信息覆盖默认配置。`,
    time: new Date().toLocaleTimeString()
  }]
}

const handleSend = async () => {
  if (currentMode.value === 'course') {
    loading.value = true
    try {
      // 如果是课程模式，即使用户没有输入也可以使用默认值
      const courseInfo = parseCourseInput(bottomInput.value.trim())
      
      // 添加用户消息，显示实际使用的配置
      messages.value.push({
        type: 'user',
        content: `生成课程：<br>
        课程名称：${courseInfo.course_name}<br>
        课程描述：${courseInfo.course_description}<br>
        学科：${courseInfo.subject}<br>
        年级：${courseInfo.grade_level}<br>
        其他要求：${courseInfo.additional_requirements}`,
        time: new Date().toLocaleTimeString()
      })

      bottomInput.value = ''
      
      const response = await generateCourseContent(courseInfo)
      
      if (response.code === 0) {
        messages.value.push({
          type: 'ai',
          content: `课程内容生成成功：<br><pre>${JSON.stringify(response.data, null, 2)}</pre>`,
          time: new Date().toLocaleTimeString()
        })
      } else {
        throw new Error(response.msg)
      }
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
      messages.value.push({
        type: 'ai',
        content: `错误：${error.message || '生成失败，请重试'}`,
        time: new Date().toLocaleTimeString()
      })
    } finally {
      loading.value = false
    }
    return
  }

  // 普通对话模式的处理
  if (!bottomInput.value.trim()) return
  
  const userInput = bottomInput.value
  bottomInput.value = ''
  
  messages.value.push({
    type: 'user',
    content: userInput,
    time: new Date().toLocaleTimeString()
  })

  loading.value = true
  try {
    // 普通对话模式的处理逻辑
    messages.value.push({
      type: 'ai',
      content: '收到您的消息，我会尽快回复。',
      time: new Date().toLocaleTimeString()
    })
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
    messages.value.push({
      type: 'ai',
      content: `错误：${error.message || '生成失败，请重试'}`,
      time: new Date().toLocaleTimeString()
    })
  } finally {
    loading.value = false
  }
}

const newChat = () => {
  currentMode.value = 'normal'
  messages.value = []
  bottomInput.value = ''
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

.chat-messages {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.message {
  margin-bottom: 20px;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
  background: #6366f1;
  color: white;
  padding: 12px 20px;
  border-radius: 12px 12px 0 12px;
}

.message.ai {
  margin-right: auto;
  background: white;
  color: #333;
  padding: 12px 20px;
  border-radius: 12px 12px 12px 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.loading-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}
</style> 