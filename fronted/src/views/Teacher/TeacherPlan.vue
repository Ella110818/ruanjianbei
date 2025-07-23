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
            <div v-if="isGenerating" class="loading-container">
              <div class="loading-animation">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              <div class="loading-text">AI正在思考中...</div>
            </div>
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
import { ref } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'

// 格式化时间函数
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 创建 markdown 解析器
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true
})

// 修改消息内容的显示方式
const formatMessageContent = (content) => {
  if (typeof content !== 'string') return content
  return md.render(content)
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

// 模拟AI生成教案
const simulateAIGeneration = async () => {
  // 将文件内容按行分割
  const contentLines = `# TensorFlow.js应用开发教学大纲

## 一、课程基本信息

| 项目         | 内容                     |
|--------------|--------------------------|
| **课程名称** | TensorFlow.js应用开发    |
| **总学时**   | ${planForm.value.teachingHours}学时（理论10学时+实践8学时） |
| **教学方式** | ${planForm.value.teachingMethod === 'offline' ? '线下授课、实践操作、项目开发' : '网络教学、实践操作、项目开发'} |
| **考核方式** | 平时作业（30%）、实践项目（40%）、期末考核（30%） |

## 二、教学目标

### 知识目标
1. 理解TensorFlow.js的核心概念、架构及技术优势
2. 掌握TensorFlow.js环境搭建方法（浏览器/Node.js）
3. 熟悉张量（Tensor）、变量（Variable）和操作（Ops）的使用
4. 了解模型构建的两种方式：Layers API与Core API
5. 掌握TensorFlow.js模型训练与部署的关键流程

### 能力目标
1. 能够使用Layers API构建简单的神经网络模型
2. 具备运用Core API实现自定义模型的能力
3. 掌握在浏览器环境中加载和运行预训练模型的方法
4. 能够在Node.js环境中进行模型训练与推理
5. 具备开发端侧AI应用（如图像识别、数据预测）的实践能力

### 素质目标
1. 培养前端与AI融合的跨界开发思维
2. 提升模型优化与性能调优的工程意识
3. 建立基于浏览器的机器学习应用设计理念
4. 增强团队协作与项目开发能力

## 三、课程内容与学时分配

| 章节序号 | 教学内容                     | 学时 | 教学方式       | 对应样章章节       |
|----------|------------------------------|------|----------------|--------------------|
| 1        | TensorFlow.js概述与优势      | 2    | 讲授+案例分析  | 7.1.1              |
| 2        | 核心概念与基础操作           | 4    | 讲授+实践      | 7.1.2              |
| 3        | 环境配置与开发工具           | 2    | 实践操作       | 7.1.3              |
| 4        | Layers API模型构建           | 3    | 讲授+案例分析  | 7.1.2、项目案例    |
| 5        | Core API与自定义模型         | 3    | 讲授+实践      | 7.1.2              |
| 6        | 模型部署与性能优化           | 2    | 实践操作       | 7.1.2、项目案例    |
| 7        | 综合项目开发（汽车油耗预测） | 2    | 项目开发       | 项目描述           |

## 四、教学重点与难点

### 教学重点
1. TensorFlow.js核心概念（张量、变量、操作）
2. Layers API模型构建流程
3. 浏览器/Node.js环境下的模型部署
4. 实际项目开发中的问题解决

### 教学难点
1. Core API自定义模型的数学原理
2. 内存管理与性能优化技巧
3. 模型转换与跨平台兼容性处理
4. 前端与AI融合的应用场景设计

## 五、教学内容纲要

### 第1章：TensorFlow.js概述与优势
1.1 TensorFlow.js发展历程与架构
1.2 技术优势分析（GPU加速、前后端统一、隐私保护）
1.3 典型应用案例（图像识别、语音处理、数据预测）

### 第2章：核心概念与基础操作
2.1 张量（Tensor）：创建、形状、数据类型
2.2 变量（Variable）：初始化与更新
2.3 操作（Ops）：数学运算、矩阵操作
2.4 内存管理：tf.tidy()与dispose()方法

### 第3章：环境配置与开发工具
3.1 浏览器环境：Script Tag引入方式
3.2 Node.js环境：NPM安装与Parcel构建
3.3 开发工具：Chrome DevTools调试技巧
3.4 环境测试与问题排查

### 第4章：Layers API模型构建
4.1 Sequential模型与Functional模型
4.2 常用层类型：Dense、Conv2D、LSTM
4.3 模型编译与训练：优化器、损失函数、评估指标
4.4 案例：手写数字识别模型构建

### 第5章：Core API与自定义模型
5.1 低级API操作：张量运算与梯度下降
5.2 自定义层与模型训练循环
5.3 模型保存与加载
5.4 案例：自定义线性回归模型

### 第6章：模型部署与性能优化
6.1 浏览器端模型部署：tf.loadLayersModel()
6.2 Node.js后端部署：模型推理服务
6.3 性能优化：量化、权重压缩、并行计算
6.4 跨平台兼容性处理

### 第7章：综合项目开发
7.1 项目需求分析：汽车油耗预测
7.2 数据预处理与特征工程
7.3 模型设计与训练
7.4 前端界面集成与部署测试

## 六、实践项目要求
1. **基础项目**：使用Layers API实现鸢尾花分类模型（个人作业）
2. **进阶项目**：基于Core API构建自定义回归模型（小组合作）
3. **综合项目**：汽车油耗预测系统开发（团队项目，3-4人/组）
   - 需求：实现数据可视化、模型训练、结果展示功能
   - 技术栈：TensorFlow.js + HTML/CSS/JavaScript + Node.js
   - 提交物：源代码、项目文档、演示视频

## 七、参考资料
1. 《TensorFlow.js官方文档》：https://www.tensorflow.org/js
2. 《TensorFlow.js实战》，人民邮电出版社
3. 样章文件：cp07-样章示例-tensorFlow,js应用开发.docx
4. TensorFlow.js GitHub仓库：https://github.com/tensorflow/tfjs

## 八、来源说明
本教学大纲基于文件 **"cp07-样章示例-tensorFlow,js应用开发.docx"** 编制而成，主要参考了其中的TensorFlow.js核心概念、架构分析和项目案例内容。`.split('\n')

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
    // 根据行的内容调整延迟时间
    const delay = line.trim() === '' ? 200 : // 空行
                 line.startsWith('+') ? 100 : // 表格分隔线
                 line.startsWith('|') ? 300 : // 表格内容
                 line.startsWith('•') ? 500 : // 列表项
                 400; // 普通文本
    
    await new Promise(resolve => setTimeout(resolve, delay))
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

// 在 script setup 中添加加载状态
const isGenerating = ref(false)

// 修改提交表单函数
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

    // 添加用户消息
    messages.value.push({
      id: messages.value.length + 1,
      type: 'user',
      content: `请为${planForm.value.courseName}生成${planForm.value.category}`,
      time: formatTime(new Date())
    })

    // 添加AI思考消息
    messages.value.push({
      id: messages.value.length + 1,
      type: 'ai',
      content: '正在为您生成文档，请稍候...',
      time: formatTime(new Date())
    })

    // 设置加载状态
    isGenerating.value = true

    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 直接开始模拟AI生成文档
    await simulateAIGeneration()
    
    ElMessage.success('生成完成')
  } catch (error) {
    console.error('生成失败:', error)
    ElMessage.error('生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
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

.plan-form-container {
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

.plan-form {
  width: 100%;
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

/* 响应式设计 */
@media screen and (max-width: 1440px) {
  .content-area {
    margin-left: 240px;
}

  .plan-form-container {
    width: 380px;
}
}

@media screen and (max-width: 1280px) {
  .content-area {
    margin-left: 220px;
    gap: 16px;
  }
  
  .plan-form-container {
    width: 340px;
    padding: 20px;
  }
}

@media screen and (max-width: 1024px) {
  .content-area {
    flex-direction: column;
    margin: 24px 16px 24px 220px;
  }
  
  .plan-form-container {
    width: 100%;
  }
  
  .chat-container {
    height: auto;
    min-height: 500px;
  }
}

/* 表格样式优化 */
:deep(.markdown-content table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

:deep(.markdown-content th),
:deep(.markdown-content td) {
  padding: 12px;
  border: 1px solid #e6e6e6;
  text-align: left;
}

:deep(.markdown-content th) {
  background: #f5f7fa;
  font-weight: 600;
  color: #1a1a1a;
}

:deep(.markdown-content tr:nth-child(even)) {
  background: #f8f9fa;
}

:deep(.markdown-content tr:hover) {
  background: #f0f2f5;
}

/* 列表样式优化 */
:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  padding-left: 24px;
  margin: 12px 0;
}

:deep(.markdown-content li) {
  margin: 8px 0;
  line-height: 1.6;
}

/* 标题样式优化 */
:deep(.markdown-content h1),
:deep(.markdown-content h2),
:deep(.markdown-content h3),
:deep(.markdown-content h4) {
  margin: 24px 0 16px;
  color: #1a1a1a;
  font-weight: 600;
  line-height: 1.4;
}

:deep(.markdown-content h1) { font-size: 24px; }
:deep(.markdown-content h2) { font-size: 20px; }
:deep(.markdown-content h3) { font-size: 18px; }
:deep(.markdown-content h4) { font-size: 16px; }

/* 段落样式优化 */
:deep(.markdown-content p) {
  margin: 16px 0;
  line-height: 1.8;
}

/* 代码块样式优化 */
:deep(.markdown-content pre) {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin: 16px 0;
}

:deep(.markdown-content code) {
  font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 14px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  color: #1a1a1a;
}

/* 引用样式优化 */
:deep(.markdown-content blockquote) {
  margin: 16px 0;
  padding: 12px 20px;
  background: #f8f9fa;
  border-left: 4px solid #409eff;
  border-radius: 4px;
  color: #666;
}

/* 添加加载动画样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 20px auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.loading-animation {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.loading-text {
  color: #666;
  font-size: 14px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #409eff;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  } 
  40% { 
    transform: scale(1.0);
  }
}
</style> 