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
        <div class="exercise-form-container">
          <el-form :model="exerciseForm" label-width="120px" class="exercise-form">
            <el-form-item label="生成主题" required>
              <el-input 
                v-model="exerciseForm.query" 
                placeholder="请输入生成习题的查询主题"
                :minlength="1"
              />
            </el-form-item>

            <el-form-item label="知识点" required>
              <el-select 
                v-model="exerciseForm.knowledge_point_ids" 
                multiple 
                placeholder="请选择知识点" 
                style="width: 100%"
                :loading="knowledgePointsLoading"
              >
                <el-option 
                  v-for="point in knowledgePoints" 
                  :key="point.id" 
                  :label="point.title" 
                  :value="point.id"
                >
                  <div class="knowledge-point-option">
                    <span>{{ point.title }}</span>
                    <small v-if="point.content" class="knowledge-point-desc">
                      {{ point.content.length > 50 ? point.content.slice(0, 50) + '...' : point.content }}
                    </small>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="题目类型" required>
              <el-select 
                v-model="exerciseForm.question_types" 
                multiple 
                placeholder="请选择题目类型" 
                style="width: 100%"
              >
                <el-option label="单选题" value="single_choice" />
                <el-option label="多选题" value="multiple_choice" />
                <el-option label="填空题" value="fill_blank" />
                <el-option label="简答题" value="short_answer" />
                <el-option label="编程题" value="coding" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="题目数量" required>
              <el-input-number 
                v-model="exerciseForm.quantity" 
                :min="1" 
                :max="10"
                :default-value="3"
                placeholder="请输入题目数量"
              />
            </el-form-item>

            <el-form-item label="题目难度" required>
              <el-input-number 
                v-model="exerciseForm.difficulty" 
                :min="1" 
                :max="5"
                :default-value="3"
                placeholder="请选择难度等级(1-5)"
              />
            </el-form-item>

            <el-form-item class="form-buttons">
              <el-button type="primary" @click="handleGenerate">生成习题</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- AI聊天区域 -->
        <div class="chat-container">
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
import MarkdownIt from 'markdown-it'
import { getKnowledgePoints, generateQuestions } from '@/api'

// 创建 markdown 解析器
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  highlight: function (str, lang) {
    return '<pre class="code-block"><code class="language-' + lang + '">' +
      str.replace(/[{}<>]/g, function(c) {
        return {'<': '&lt;', '>': '&gt;', '{': '&#123;', '}': '&#125;'}[c];
      }) +
      '</code></pre>';
  }
})

// 格式化消息内容
const formatMessageContent = (content) => {
  if (typeof content !== 'string') return content
  return md.render(content)
}

// 格式化时间函数
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 状态变量
const sideTab = ref('exercise-gen')
const courseMenuOpen = ref(false)
const courses = ref([])

// AI聊天相关
const aiAvatar = new URL('@/assets/智能助手-copy.png', import.meta.url).href
const userAvatar = new URL('@/assets/avatar.png', import.meta.url).href
const chatMessages = ref(null)

// 聊天消息
const messages = ref([
  {
    id: 1,
    type: 'ai',
    content: '你好！我是你的AI助手，可以帮你生成习题。请在左侧填写相关信息，我会为你生成符合要求的习题。',
    time: formatTime(new Date())
  }
])

// 表单数据
const exerciseForm = ref({
  query: '',
  knowledge_point_ids: [],
  question_types: [],
  quantity: 3,
  difficulty: 3
})

// 知识点相关
const knowledgePoints = ref([])
const knowledgePointsLoading = ref(false)

// 加载知识点
const loadKnowledgePoints = async () => {
  knowledgePointsLoading.value = true
  try {
    const response = await getKnowledgePoints()
    
    if (response.success && response.status_code === 200 && response.data) {
      knowledgePoints.value = response.data.results
      console.log('知识点加载成功:', knowledgePoints.value)
    } else {
      throw new Error(response.message || '获取知识点列表失败')
    }
  } catch (error) {
    console.error('加载知识点失败:', error)
    ElMessage.error(error.message || '加载知识点失败，请稍后重试')
  } finally {
    knowledgePointsLoading.value = false
  }
}

// 更新侧边栏状态
const updateSideTab = (value) => {
  sideTab.value = value
}

const updateCourseMenuOpen = (value) => {
  courseMenuOpen.value = value
}

// 生成习题
const handleGenerate = async () => {
  try {
    // 表单验证
    if (!exerciseForm.value.query) {
      ElMessage.warning('请输入生成主题')
      return
    }

    if (exerciseForm.value.knowledge_point_ids.length === 0) {
      ElMessage.warning('请选择至少一个知识点')
      return
    }

    if (exerciseForm.value.question_types.length === 0) {
      ElMessage.warning('请至少选择一种题目类型')
      return
    }

    // 添加用户消息
    messages.value.push({
      id: messages.value.length + 1,
      type: 'user',
      content: `请根据主题"${exerciseForm.value.query}"生成习题`,
      time: formatTime(new Date())
    })

    // 添加AI思考消息
    const thinkingMessageId = messages.value.length + 1
    messages.value.push({
      id: thinkingMessageId,
      type: 'ai',
      content: '正在为您生成习题，请稍候...',
      time: formatTime(new Date())
    })

    // 调用生成接口
    const response = await generateQuestions({
      query: exerciseForm.value.query,
      knowledge_point_ids: exerciseForm.value.knowledge_point_ids,
      question_types: exerciseForm.value.question_types,
      quantity: exerciseForm.value.quantity,
      difficulty: exerciseForm.value.difficulty
    })

    if (response.success && response.status_code === 200) {
      const { questions, sources } = response.data
      
      // 构建生成结果的markdown内容
      let content = `# 生成的习题\n\n`
      
      // 添加基本信息
      content += `## 基本信息\n`
      content += `- **生成主题**：${exerciseForm.value.query}\n`
      content += `- **知识点**：${exerciseForm.value.knowledge_point_ids.map(id => 
        knowledgePoints.value.find(p => p.id === id)?.title
      ).join(', ')}\n`
      content += `- **题目类型**：${exerciseForm.value.question_types.map(type => getQuestionTypeName(type)).join(', ')}\n`
      content += `- **题目数量**：${questions.length}\n`
      content += `- **难度等级**：${exerciseForm.value.difficulty}\n\n`

      // 添加题目内容
      questions.forEach((question, index) => {
        content += `## 题目 ${index + 1}\n\n`
        content += `### 题目内容\n${question.content}\n\n`
        
        if (Array.isArray(question.answer_template)) {
          content += `### 选项\n`
          question.answer_template.forEach((option, optIndex) => {
            content += `${String.fromCharCode(65 + optIndex)}. ${option}\n`
          })
          content += '\n'
        }
      })

      // 如果有参考资料，添加到内容中
      if (sources && sources.length > 0) {
        content += `## 参考资料\n`
        sources.forEach(source => {
          content += `- ${source.title}\n`
        })
      }

      // 更新AI消息内容
      const messageIndex = messages.value.findIndex(m => m.id === thinkingMessageId)
      if (messageIndex !== -1) {
        messages.value[messageIndex].content = content
      }

      ElMessage.success('习题生成成功')
    } else {
      throw new Error(response.message || 'AI生成题目失败')
    }
  } catch (error) {
    console.error('生成习题失败:', error)
    ElMessage.error(error.message || '生成习题失败，请稍后重试')
  }
}

// 在生成结果的展示部分，修改题目类型的显示名称
const getQuestionTypeName = (type) => {
  const typeMap = {
    'single_choice': '单选题',
    'multiple_choice': '多选题',
    'fill_blank': '填空题',
    'short_answer': '简答题',
    'coding': '编程题',
    'other': '其他'
  }
  return typeMap[type] || type
}

// 组件挂载时加载知识点
onMounted(() => {
  loadKnowledgePoints()
})

// 重置表单
const handleReset = () => {
  exerciseForm.value = {
    query: '',
    knowledge_point_ids: [],
    question_types: [],
    quantity: 3,
    difficulty: 3
  }
}
</script>

<style scoped>
.teacher-layout {
  min-height: 100vh;
  background: url('@/assets/back.png') no-repeat center center fixed;
  background-size: cover;
}

.main-container {
  display: flex;
  padding-top: 64px;
  min-height: calc(100vh - 64px);
}

.content-area {
  flex: 1;
  margin: 24px 24px 24px 248px;
  min-height: calc(100vh - 112px);
  display: flex;
  gap: 24px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.exercise-form-container {
  width: 420px;
  height: fit-content;
  padding: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.exercise-form {
  width: 100%;
}

.input-label {
  text-align: center;
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 14px;
  padding-bottom: 8px;
}

:deep(.el-input__wrapper),
:deep(.el-select .el-input__wrapper),
:deep(.el-input-number .el-input__wrapper),
:deep(.el-textarea__inner) {
  box-shadow: none !important;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-select:hover .el-input__wrapper),
:deep(.el-input-number:hover .el-input__wrapper),
:deep(.el-textarea__inner:hover) {
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.1) !important;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-select .el-input__wrapper.is-focus),
:deep(.el-input-number.is-focus .el-input__wrapper),
:deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
}

.form-buttons {
  margin-top: 32px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

:deep(.el-button) {
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff 0%, #3088ff 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

:deep(.el-button--primary:active) {
  transform: translateY(0);
}

/* AI聊天区域样式 */
.chat-container {
  flex: 1;
  height: calc(100vh - 112px);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.5s ease-out 0.2s backwards;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 85%;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-ai {
  align-self: flex-start;
}

.message-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content-wrapper {
  flex: 1;
  max-width: calc(100% - 60px);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.message-sender {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.message-time {
  font-size: 12px;
  color: #666;
}

.message-content {
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-ai .message-content {
  background: #f8f9fa;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.message-user .message-content {
  background: linear-gradient(135deg, #e8f3ff 0%, #d1e9ff 100%);
  border: none;
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "Courier New", Courier, monospace;
  margin: 0;
  padding: 0;
  line-height: 1.8;
}

:deep(.markdown-content) {
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.markdown-content a) {
  color: #409eff;
  text-decoration: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  transition: all 0.3s ease;
}

:deep(.markdown-content a:hover) {
  color: #66b1ff;
  text-decoration: underline;
}

/* 自定义滚动条 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* Markdown 样式优化 */
:deep(.markdown-content h1) {
  font-size: 24px;
  font-weight: 600;
  margin: 24px 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  color: #1a1a1a;
}

:deep(.markdown-content h2) {
  font-size: 20px;
  font-weight: 600;
  margin: 20px 0 14px;
  color: #1a1a1a;
}

:deep(.markdown-content h3) {
  font-size: 18px;
  font-weight: 600;
  margin: 18px 0 12px;
  color: #1a1a1a;
}

:deep(.markdown-content p) {
  margin: 12px 0;
  line-height: 1.8;
}

:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  padding-left: 24px;
  margin: 12px 0;
}

:deep(.markdown-content li) {
  margin: 6px 0;
  line-height: 1.6;
}

/* 响应式设计 */
@media screen and (max-width: 1440px) {
  .content-area {
    margin-left: 240px;
  }
  
  .exercise-form-container {
    width: 380px;
  }
}

@media screen and (max-width: 1280px) {
  .content-area {
    margin-left: 220px;
    gap: 16px;
  }
  
  .exercise-form-container {
    width: 340px;
    padding: 20px;
  }
}

@media screen and (max-width: 1024px) {
  .content-area {
    flex-direction: column;
    margin: 24px 16px 24px 220px;
  }
  
  .exercise-form-container {
    width: 100%;
  }
  
  .chat-container {
    height: auto;
    min-height: 500px;
  }
}
</style> 