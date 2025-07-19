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
        <div class="plan-form-container">
          <el-form :model="planForm" label-width="120px" class="plan-form">
            <el-form-item label="三纲一案" required>
              <el-select v-model="planForm.category" placeholder="教学大纲" class="form-select">
                <el-option label="教学大纲" value="syllabus" />
                <el-option label="课程大纲" value="course" />
                <el-option label="考试大纲" value="exam" />
              </el-select>
            </el-form-item>

            <el-form-item label="课程名称" required>
              <el-input 
                v-model="planForm.courseName" 
                placeholder="请输入课程名称"
                @input="updateObjectives" 
              />
            </el-form-item>

            <el-form-item label="教学时长" required>
              <el-input-number 
                v-model="planForm.teachingHours" 
                :min="1" 
                placeholder="请输入教学时长" 
                controls-position="right" 
              />
            </el-form-item>

            <el-form-item label="教学目标" required>
              <el-input
                v-model="planForm.objectives"
                type="textarea"
                :rows="4"
                placeholder="掌握计算机视觉的基本理论与核心"
              />
            </el-form-item>

            <el-form-item label="考核方式" required>
              <el-input
                v-model="planForm.examMethod"
                :readonly="true"
                placeholder="包括平时考核、期中考核和期末考核"
              />
            </el-form-item>

            <el-form-item label="教学方式" required>
              <el-select v-model="planForm.teachingMethod" placeholder="请选择教学方式">
                <el-option 
                  label="线下授课，讨论" 
                  value="offline" 
                />
                <el-option 
                  label="网络教学，讨论" 
                  value="online" 
                />
              </el-select>
            </el-form-item>

            <el-form-item class="form-buttons">
              <el-button type="primary" @click="handleSubmit">提交</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- AI聊天区域 -->
        <div class="chat-container">
          <div class="chat-messages" ref="chatMessages">
            <div v-for="(message, index) in messages" :key="index" 
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
                  <pre class="text-content" v-else>{{ message.content }}</pre>
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
import { ref } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import { ElMessage } from 'element-plus'

// 格式化时间函数
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 状态变量
const sideTab = ref('teaching-plan')
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
    content: '你好！我是你的AI助手，可以帮你生成教学文档。',
    time: formatTime(new Date())
  }
])

// 表单数据
const planForm = ref({
  category: '',
  courseName: '',
  teachingHours: 1,
  objectives: '',
  examMethod: '包括平时考核、期中考核和期末考核',
  teachingMethod: ''
})

// 更新侧边栏状态
const updateSideTab = (value) => {
  sideTab.value = value
}

const updateCourseMenuOpen = (value) => {
  courseMenuOpen.value = value
}

// 模拟AI生成文档
const simulateAIGeneration = async () => {
  const contentLines = [
    "让我来帮你生成这份教学大纲...",
    "",
    "Python编程基础教学大纲",
    "",
    "一、课程基本信息",
    "+----------------+------------------------------------------+",
    "| 项目           | 内容                                     |",
    "+----------------+------------------------------------------+",
    "| 课程名称       | Python编程基础                           |",
    `| 教学时长       | ${planForm.value.teachingHours}学时                                   |`,
    "| 教学方式       | 线下授课、课堂讨论                       |",
    "| 考核方式       | 平时考核（30%）、期中考核（30%）、       |",
    "|                | 期末考核（40%）                          |",
    "+----------------+------------------------------------------+",
    "",
    "二、教学目标",
    "",
    "（一）知识目标",
    "• 理解Python语言的基本语法规则",
    "• 掌握变量、数据类型及常用运算符的使用",
    "• 熟悉条件语句、循环结构的编程逻辑",
    "• 了解函数定义与调用的基本方法",
    "• 掌握列表、字典等数据结构的操作",
    "",
    "（二）能力目标",
    "• 能够独立编写简单的Python程序",
    "• 具备运用基本算法解决实际问题的能力",
    "• 学会使用Python标准库完成基础任务",
    "• 培养代码调试与错误处理的基本技能",
    "",
    "（三）素质目标",
    "• 培养逻辑思维与问题分析能力",
    "• 建立良好的编程规范与代码风格",
    "• 提升自主学习与团队协作意识",
    "",
    "三、课程内容与学时分配",
    "+------------+--------------------------------+--------+------------------+",
    "| 章节序号   | 教学内容                       | 学时   | 教学方式         |",
    "+------------+--------------------------------+--------+------------------+",
    "| 1          | Python简介与环境搭建           | 2      | 讲授+实践        |",
    "| 2          | 变量与数据类型                 | 2      | 讲授+案例分析    |",
    "| 3          | 运算符与表达式                 | 2      | 讲授+练习        |",
    "| 4          | 条件语句与分支结构             | 3      | 讲授+小组讨论    |",
    "| 5          | 循环结构与迭代                 | 3      | 讲授+实践        |",
    "| 6          | 函数定义与调用                 | 3      | 讲授+案例分析    |",
    "| 7          | 列表与字典应用                 | 2      | 讲授+练习        |",
    "| 8          | 综合复习与考核                 | 0      | 考试            |",
    "+------------+--------------------------------+--------+------------------+",
    "",
    "四、教学方法与手段",
    "• 理论讲授：核心概念与语法规则讲解",
    "• 案例分析：通过实际代码案例演示编程思想",
    "• 实践操作：课堂编程练习与即时反馈",
    "• 小组讨论：针对问题解决思路进行协作交流",
    "• 课后作业：巩固课堂所学内容的编程任务",
    "",
    "五、考核方式说明",
    "",
    "平时考核（30%）",
    "• 课堂参与度（10%）",
    "• 编程作业完成情况（20%）",
    "",
    "期中考核（30%）",
    "• 阶段性编程测试（闭卷）",
    "• 重点考察函数与控制流应用能力",
    "",
    "期末考核（40%）",
    "• 综合项目开发（开卷）",
    "• 要求独立完成一个小型应用程序",
    "",
    "六、推荐参考资料",
    "1. 《Python编程：从入门到实践》，埃里克·马瑟斯著",
    "2. 《Python Crash Course》，埃里克·马瑟斯著",
    "3. <a href='https://docs.python.org/3/' target='_blank'>Python官方文档</a>",
    "4. <a href='https://www.w3schools.com/python/' target='_blank'>W3Schools Python教程</a>",
    "",
    "七、教学进度安排",
    "+--------+--------------------------------+----------------+--------------------------------+",
    "| 周次   | 教学内容                       | 教学形式       | 作业安排                       |",
    "+--------+--------------------------------+----------------+--------------------------------+",
    "| 1      | Python环境搭建                 | 讲授+实践      | 安装Python并运行hello world    |",
    "| 2      | 变量与数据类型                 | 讲授+练习      | 数据类型转换练习               |",
    "| 3      | 运算符与表达式                 | 讲授+案例      | 编写简单计算程序               |",
    "| 4-5    | 控制流结构                     | 讲授+项目      | 分支与循环综合练习             |",
    "| 6-7    | 函数与模块化编程               | 讲授+实践      | 自定义函数实现计算器功能       |",
    "| 8      | 期中复习与考核                 | 考试           | -                              |",
    "| 9-10   | 数据结构应用                   | 讲授+案例      | 学生信息管理系统开发           |",
    "| 11     | 综合项目指导                   | 讨论+辅导      | 项目需求分析与设计             |",
    "| 12     | 期末项目开发与提交             | 实践           | 完成项目报告与代码提交         |",
    "+--------+--------------------------------+----------------+--------------------------------+",
    "",
    "教学大纲生成完成！这是一份完整的Python编程基础教学大纲，包含了课程信息、教学目标、内容安排、考核方式等详细内容。"
  ]

  // 添加用户消息
  messages.value.push({
    id: messages.value.length + 1,
    type: 'user',
    content: '请帮我生成Python编程基础的教学大纲',
    time: formatTime(new Date())
  })

  // 添加AI开始生成的消息
  messages.value.push({
    id: messages.value.length + 1,
    type: 'ai',
    content: '',
    time: formatTime(new Date())
  })

  // 逐行生成文档内容
  let currentContent = ''
  
  for (const line of contentLines) {
    await new Promise(resolve => setTimeout(resolve, 100))
    if (currentContent) {
      currentContent += '\n' + line
    } else {
      currentContent = line
    }
    
    // 更新最后一条AI消息的内容
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage.type === 'ai') {
      lastMessage.content = currentContent
    }
  }
}

// 监听课程名称变化，自动更新教学目标
const updateObjectives = () => {
  if (planForm.value.courseName) {
    planForm.value.objectives = `掌握${planForm.value.courseName}的基本理论与核心`
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 表单验证
    if (!planForm.value.category) {
      ElMessage.warning('请选择三纲一案类型')
      return
    }
    if (!planForm.value.courseName) {
      ElMessage.warning('请输入课程名称')
      return
    }

    // 直接开始模拟AI生成文档
    await simulateAIGeneration()
    
    ElMessage.success('生成完成')
  } catch (error) {
    console.error('生成失败:', error)
    ElMessage.error('生成失败，请稍后重试')
  }
}

// 重置表单
const handleReset = () => {
  planForm.value = {
    category: '',
    courseName: '',
    teachingHours: 1,
    objectives: '',
    examMethod: '包括平时考核、期中考核和期末考核',
    teachingMethod: ''
  }
}
</script>

<style scoped>
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
  margin-left: 280px; /* 增加左边距，避免被侧边栏遮挡 */
  min-height: calc(100vh - 64px);
  padding: 24px;
  background-color: #fff;
  display: flex;
  gap: 24px;
}

.plan-form-container {
  margin-top: 100px;
  width: 450px;
  padding: 20px;
  flex-shrink: 0;
}

.plan-form {
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper),
:deep(.el-select),
:deep(.el-input-number),
:deep(.el-textarea__inner) {
  box-shadow: none !important;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

:deep(.el-input__wrapper:hover),
:deep(.el-select:hover .el-input__wrapper),
:deep(.el-input-number:hover .el-input__wrapper),
:deep(.el-textarea__inner:hover) {
  border-color: #409eff;
}

:deep(.el-form-item__label) {
  font-weight: normal;
  color: #606266;
}

.form-buttons {
  margin-top: 30px;
}

:deep(.el-button) {
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 4px;
}

:deep(.el-button--primary) {
  background-color: #409eff;
}

/* AI聊天区域样式 */
.chat-container {
  flex: 1;
  height: calc(100vh - 88px);
  border-left: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  margin-top: 0; /* 移除上边距 */
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding-top: 20px; /* 添加内边距 */
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.ai-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.chat-subtitle {
  margin-top: 4px;
  font-size: 14px;
  color: #999;
}

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
  max-width: 100%;
  margin-bottom: 20px;
}

.message-ai {
  align-self: flex-start;
  background-color: #f5f7ff;
  color: #333;
}

.message-user {
  align-self: flex-end;
  background-color: #e8f3ff;
  color: #333;
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
}

.user-message {
  background: #e8f3ff !important;
}

.text-content {
  white-space: pre;
  word-break: break-word;
  font-family: "Courier New", Courier, monospace;  /* 更好看的等宽字体 */
  margin: 0;
  padding: 0;
  background: transparent;
  line-height: 1.8;  /* 增加行高 */
}

.text-content a {
  color: #409eff;
  text-decoration: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;  /* 链接使用非等宽字体 */
}

.text-content a:hover {
  text-decoration: underline;
}

pre.text-content {
  font-family: "Courier New", Courier, monospace;
  margin: 0;
  padding: 0;
  background: transparent;
}

.markdown-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-input-area {
  padding: 20px;
  border-top: 1px solid #e6e6e6;
}

.chat-tools {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

:deep(.el-textarea__inner) {
  resize: none;
  border-radius: 8px;
}

:deep(.el-button--primary) {
  border-radius: 8px;
  padding: 8px 24px;
}

/* 响应式设计 */
@media screen and (max-width: 1366px) {
  .content-area {
    margin-left: 260px;
  }
  
  .plan-form-container {
    width: 400px;
  }
}

@media screen and (max-width: 1024px) {
  .content-area {
    margin-left: 240px;
  }
  
  .plan-form-container {
    width: 350px;
  }
}
</style> 