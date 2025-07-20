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
        <div class="lesson-form-container">
          <el-form :model="lessonForm" label-width="120px" class="lesson-form">
            <el-form-item label="课程名称" required>
              <el-input v-model="lessonForm.courseName" placeholder="请输入课程名称" />
            </el-form-item>

            <el-form-item label="课程章节" required>
              <el-input v-model="lessonForm.chapter" placeholder="请输入本节课的章节名称" />
            </el-form-item>

            <el-form-item label="教学目标" required>
              <el-input
                v-model="lessonForm.objectives"
                type="textarea"
                :rows="3"
                placeholder="请输入本节课的教学目标"
              />
            </el-form-item>

            <el-form-item label="教学重点" required>
              <el-input
                v-model="lessonForm.keyPoints"
                type="textarea"
                :rows="2"
                placeholder="请输入本节课的教学重点"
              />
            </el-form-item>

            <el-form-item label="教学难点" required>
              <el-input
                v-model="lessonForm.difficulties"
                type="textarea"
                :rows="2"
                placeholder="请输入本节课的教学难点"
              />
            </el-form-item>

            <el-form-item label="课时安排" required>
              <el-input-number 
                v-model="lessonForm.duration" 
                :min="1" 
                :max="4"
                placeholder="请输入课时数量"
              />
            </el-form-item>

            <el-form-item label="教学方法">
              <el-select v-model="lessonForm.methods" multiple placeholder="请选择教学方法" style="width: 100%">
                <el-option label="讲授法" value="lecture" />
                <el-option label="讨论法" value="discussion" />
                <el-option label="案例教学" value="case" />
                <el-option label="实践教学" value="practice" />
                <el-option label="启发式教学" value="heuristic" />
                <el-option label="小组协作" value="group" />
              </el-select>
            </el-form-item>

            <el-form-item label="教学工具">
              <el-select v-model="lessonForm.tools" multiple placeholder="请选择教学工具" style="width: 100%">
                <el-option label="PPT" value="ppt" />
                <el-option label="板书" value="blackboard" />
                <el-option label="多媒体" value="multimedia" />
                <el-option label="实验设备" value="equipment" />
                <el-option label="在线资源" value="online" />
              </el-select>
            </el-form-item>

            <el-form-item class="form-buttons">
              <el-button type="primary" @click="handleGenerate">生成教案</el-button>
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
import { ref } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'

// 创建 markdown 解析器
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  highlight: function (str, lang) {
    // 为代码块添加语法高亮的类
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
    content: '你好！我是你的AI助手，可以帮你生成详细的教案。请在左侧填写课程信息，我会为你生成一份完整的教案。',
    time: formatTime(new Date())
  }
])

// 表单数据
const lessonForm = ref({
  courseName: '',
  chapter: '',
  objectives: '',
  keyPoints: '',
  difficulties: '',
  duration: 1,
  methods: [],
  tools: []
})

// 更新侧边栏状态
const updateSideTab = (value) => {
  sideTab.value = value
}

const updateCourseMenuOpen = (value) => {
  courseMenuOpen.value = value
}

// 生成教案
const handleGenerate = async () => {
  try {
    // 表单验证
    if (!lessonForm.value.courseName || !lessonForm.value.chapter) {
      ElMessage.warning('请填写必要的课程信息')
      return
    }

    // 添加用户消息
    messages.value.push({
      id: messages.value.length + 1,
      type: 'user',
      content: `请为${lessonForm.value.courseName}的${lessonForm.value.chapter}生成教案`,
      time: formatTime(new Date())
    })

    // 添加AI思考消息
    messages.value.push({
      id: messages.value.length + 1,
      type: 'ai',
      content: '正在为您生成教案，请稍候...',
      time: formatTime(new Date())
    })

    // 模拟AI生成教案
    await simulateAIGeneration()
    
    ElMessage.success('教案生成成功')
  } catch (error) {
    console.error('生成教案失败:', error)
    ElMessage.error('生成教案失败，请稍后重试')
  }
}

// 模拟AI生成教案
const simulateAIGeneration = async () => {
  // 将文件内容按行分割
  const contentLines = `# TensorFlow Lite架构教案

## 课程基本信息
- **课程名称**：TensorFlow Lite架构与应用
- **适用对象**：具备Python基础和机器学习入门知识的学生
- **总学时**：4学时（理论2学时+实践2学时）
- **先修要求**：Python编程基础、机器学习基本概念
- **教学方式**：理论讲授+案例分析+实训练习

## 一、教学目标

### 知识目标
1. 理解TensorFlow Lite的核心概念及发展历程
2. 掌握TensorFlow Lite整体架构（转换器、解释器、FlatBuffers格式）
3. 了解TFLite在移动设备和嵌入式系统中的应用场景
4. 熟悉模型转换与部署的关键技术点

### 能力目标
1. 能够使用TFLite转换器将TensorFlow模型转换为TFLite格式
2. 掌握TFLite解释器的基本使用方法
3. 具备在Android环境部署TFLite模型的实践能力
4. 能够解决模型转换和部署过程中的常见问题

### 素质目标
1. 培养嵌入式机器学习系统的设计思维
2. 提升跨平台开发的实践能力
3. 建立模型优化与性能权衡的工程意识

## 二、教学重点与难点
- **教学重点**：
  - TensorFlow Lite架构组成（转换器、解释器、算子库）
  - 模型转换流程与优化方法
  - TFLite模型部署到移动设备的关键步骤

- **教学难点**：
  - FlatBuffers格式原理与内存高效性理解
  - 硬件加速代理（Delegate）的配置与使用
  - 模型量化对性能和精度的影响分析

## 三、教学过程设计

### 模块一：TensorFlow Lite概述（40分钟）

#### 教学内容
1. **发展历程**（15分钟）
   - TF Mobile到TFLite的演进
   - TFLite的技术优势（轻量级、低延迟、跨平台）
   - 关键版本特性对比

2. **应用场景**（15分钟）
   - 移动应用案例：Google Photos、网易OCR、爱奇艺AR
   - IoT设备应用：智能音箱、扫地机器人、工业质检
   - 微控制器（MCU）上的部署案例

3. **生态系统**（10分钟）
   - TFLite与TensorFlow生态的关系
   - 工具链组成：转换器、解释器、任务库、模型库
   - 硬件支持情况：CPU/GPU/TPU等加速方案

#### 教学方法
- 案例驱动教学：分析科沃斯扫地机器人避障系统
- 对比教学：TFLite与其他端侧框架（PyTorch Mobile、ONNX Runtime）的优缺点

#### 实训练习预备
- 安装TensorFlow 2.x环境
- 下载TFLite官方示例代码库

### 模块二：TensorFlow Lite架构详解（60分钟）

#### 教学内容
1. **整体架构**（20分钟）
   - 核心组件：转换器（Converter）、解释器（Interpreter）
   - 辅助组件：算子库、硬件加速代理
   - 工作流程图解（结合图8-1详解）

2. **模型转换器**（20分钟）
   - 功能：模型格式转换与优化
   - 工作原理：算子融合、常数折叠、量化支持
   - 使用方法：
     \`\`\`python
     # Keras模型转换示例
     converter = tf.lite.TFLiteConverter.from_keras_model(keras_model)
     converter.optimizations = [tf.lite.Optimize.DEFAULT]
     tflite_model = converter.convert()
     
     # 保存模型文件
     with open("model.tflite", "wb") as f:
         f.write(tflite_model)
     \`\`\`

3. **FlatBuffers格式**（15分钟）
   - 与Protocol Buffers的对比优势
   - 内存映射机制与零拷贝特性
   - schema.fbs文件结构解析（结合图8-2代码）

4. **解释器工作流程**（5分钟）
   - 模型加载→数据转换→推理执行→结果解释
   - 多语言API支持（Java/C++/Python）

#### 教学方法
- 代码演示：实时演示MobileNet模型转换过程
- 可视化教学：使用FlatBuffers官方工具解析.tflite文件结构

#### 课堂练习
- 快速练习：将预训练的MobileNet模型转换为TFLite格式
- 观察优化效果：比较转换前后的模型大小和推理速度

## 四、教学资源
1. **核心教材**：
   - 《TensorFlow Lite官方文档》
   - 《TensorFlow Mobile应用开发实战》

2. **工具软件**：
   - TensorFlow 2.10+
   - Android Studio 2022.1+
   - Python 3.8+

3. **参考资料**：
   - [TFLite模型动物园](https://www.tensorflow.org/lite/models)
   - [Android NN API文档](https://developer.android.com/ndk/guides/neuralnetworks)
   - FlatBuffers官方教程

## 五、考核评价方式
1. **过程性考核**（60%）
   - 实训报告（30%）：包含模型转换步骤、性能对比、问题解决记录
   - 代码提交（20%）：GitHub仓库链接，含转换脚本和Android项目
   - 课堂表现（10%）：提问回答、小组讨论参与度

2. **终结性考核**（40%）
   - 项目设计：基于TFLite的移动端AI应用原型开发
   - 要求：包含模型优化、硬件加速、功能完整的演示视频

## 六、教学反思与改进
1. **难点突破策略**：
   - 制作FlatBuffers内存布局动画演示
   - 提供预配置的Docker环境解决环境依赖问题
   - 设计阶梯式任务单，降低实践难度

2. **差异化教学**：
   - 基础组：完成既定转换和部署流程
   - 进阶组：尝试量化感知训练和自定义Delegate开发
   - 创新组：设计基于TFLite的跨平台（Android/iOS）应用

3. **教学效果评估**：
   - 通过课堂练习实时检测知识掌握程度
   - 收集学生反馈调整实践环节的时间分配
   - 建立常见问题库，优化答疑效率`.split('\n')

  // 逐行生成文档内容
  let currentContent = ''
  
  for (const line of contentLines) {
    // 根据行的内容调整延迟时间
    const delay = line.trim() === '' ? 200 : // 空行
                 line.startsWith('#') ? 600 : // 标题
                 line.startsWith('-') ? 300 : // 列表项
                 line.startsWith('```') ? 100 : // 代码块
                 line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') ? 400 : // 编号列表
                 line.startsWith('  ') ? 350 : // 缩进内容
                 line.includes('**') ? 450 : // 加粗文本
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

// 重置表单
const handleReset = () => {
  lessonForm.value = {
    courseName: '',
    chapter: '',
    objectives: '',
    keyPoints: '',
    difficulties: '',
    duration: 1,
    methods: [],
    tools: []
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

.lesson-form-container {
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

.lesson-form {
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

:deep(.markdown-content code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  font-size: 14px;
  color: #1a1a1a;
}

:deep(.markdown-content pre) {
  background: #282c34;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.markdown-content pre code) {
  background: transparent;
  padding: 0;
  color: #abb2bf;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.markdown-content code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  color: #1a1a1a;
}

/* 添加代码高亮的颜色 */
:deep(.markdown-content pre .keyword) { color: #c678dd; }
:deep(.markdown-content pre .function) { color: #61afef; }
:deep(.markdown-content pre .string) { color: #98c379; }
:deep(.markdown-content pre .comment) { color: #5c6370; font-style: italic; }
:deep(.markdown-content pre .number) { color: #d19a66; }
:deep(.markdown-content pre .operator) { color: #56b6c2; }

/* 响应式设计 */
@media screen and (max-width: 1440px) {
  .content-area {
    margin-left: 240px;
  }
  
  .lesson-form-container {
    width: 380px;
  }
}

@media screen and (max-width: 1280px) {
  .content-area {
    margin-left: 220px;
    gap: 16px;
  }
  
  .lesson-form-container {
    width: 340px;
    padding: 20px;
  }
}

@media screen and (max-width: 1024px) {
  .content-area {
    flex-direction: column;
    margin: 24px 16px 24px 220px;
  }
  
  .lesson-form-container {
    width: 100%;
  }
  
  .chat-container {
    height: auto;
    min-height: 500px;
  }
}
</style> 