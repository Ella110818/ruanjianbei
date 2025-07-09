<template>
  <div class="question-container">
    <div v-if="!isValidContent" class="error-message">
      {{ errorMessage }}
    </div>
    <div v-else class="question-list">
      <div v-for="(question, index) in questions" 
           :key="index" 
           class="question-item">
        <div class="question-header">
          <span class="question-number">第 {{ index + 1 }} 题</span>
          <span class="question-type">{{ getQuestionType(question.type) }}</span>
          <span class="question-difficulty">难度: {{ getDifficultyText(question.difficulty) }}</span>
        </div>
        <div class="question-content">
          <div class="question-title">{{ question.title }}</div>
          <div class="question-text">{{ question.content }}</div>
          <div class="question-options" v-if="question.answer_template && question.answer_template.length">
            <div v-for="(option, optIndex) in question.answer_template" 
                 :key="optIndex" 
                 class="option-item"
                 :class="{ 'selected': selectedAnswers[index] === optIndex }"
                 @click="selectAnswer(index, optIndex)">
              <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
              <span class="option-text">{{ option }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showMetadata" class="metadata">
      <div class="session-info">会话ID: {{ sessionKey }}</div>
      <div class="exercise-stats">
        <span>已保存: {{ savedExercises.length }}</span>
        <span>失败: {{ failedExercises }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  content: {
    type: [String, Object],
    required: true
  }
})

const selectedAnswers = ref({})
const errorMessage = ref('')

const parseContent = computed(() => {
  if (typeof props.content === 'string') {
    try {
      return JSON.parse(props.content)
    } catch (error) {
      console.error('解析题目内容失败:', error)
      return null
    }
  }
  return props.content
})

const contentStatus = computed(() => {
  const content = parseContent.value;
  if (!content) {
    return { valid: false, message: '题目数据格式不正确' };
  }
  if (content.error) {
    return { valid: false, message: content.error };
  }
  if (!content.questions || !Array.isArray(content.questions) || content.questions.length === 0) {
    return { valid: false, message: '未找到有效的题目数据' };
  }
  // 检查题目格式
  const invalidQuestion = content.questions.find(q => 
    !q.title || !q.content || !q.type || 
    (q.type === 'single_choice' && (!Array.isArray(q.answer_template) || q.answer_template.length === 0))
  );
  if (invalidQuestion) {
    return { valid: false, message: '题目格式不完整' };
  }
  return { valid: true, message: '' };
})

const isValidContent = computed(() => contentStatus.value.valid)

watch(contentStatus, (newStatus) => {
  errorMessage.value = newStatus.message
}, { immediate: true })

const questions = computed(() => {
  if (!isValidContent.value) return []
  return parseContent.value.questions
})

const sessionKey = computed(() => {
  if (!isValidContent.value) return ''
  return parseContent.value.session_key || ''
})

const savedExercises = computed(() => {
  if (!isValidContent.value) return []
  return parseContent.value.saved_exercises || []
})

const failedExercises = computed(() => {
  if (!isValidContent.value) return 0
  return parseContent.value.failed_exercises || 0
})

const showMetadata = computed(() => {
  return sessionKey.value || savedExercises.value.length > 0 || failedExercises.value > 0
})

const getQuestionType = (type) => {
  const typeMap = {
    'single_choice': '单选题',
    'multiple_choice': '多选题',
    'true_false': '判断题',
    'short_answer': '简答题'
  }
  return typeMap[type] || type
}

const getDifficultyText = (difficulty) => {
  const difficultyMap = {
    1: '简单',
    2: '较简单',
    3: '中等',
    4: '较难',
    5: '困难'
  }
  return difficultyMap[difficulty] || difficulty
}

const selectAnswer = (questionIndex, optionIndex) => {
  selectedAnswers.value[questionIndex] = optionIndex
}
</script>

<style scoped>
.question-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  overflow: visible;
}

.error-message {
  padding: 16px;
  background-color: #fef0f0;
  color: #f56c6c;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
  word-break: break-word;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.question-item {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: visible;
  width: 100%;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

.question-number {
  font-weight: 600;
  color: #409EFF;
  font-size: 16px;
}

.question-type {
  background: #ecf5ff;
  color: #409EFF;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.question-difficulty {
  color: #f56c6c;
  font-size: 14px;
  margin-left: auto;
}

.question-content {
  padding: 20px;
  width: 100%;
}

.question-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  word-break: break-word;
}

.question-text {
  font-size: 15px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
  white-space: pre-wrap;
  word-break: break-word;
  width: 100%;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  width: 100%;
  word-break: break-word;
}

.option-item:hover {
  background: #ecf5ff;
  border-color: #409EFF;
}

.option-item.selected {
  background: #ecf5ff;
  border-color: #409EFF;
  color: #409EFF;
}

.option-label {
  font-weight: 600;
  margin-right: 12px;
  color: inherit;
  min-width: 24px;
}

.option-text {
  color: #606266;
  line-height: 1.5;
  flex: 1;
  word-break: break-word;
}

.option-item:hover .option-text,
.option-item.selected .option-text {
  color: #409EFF;
}

.metadata {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #909399;
}

.session-info {
  margin-bottom: 8px;
}

.exercise-stats {
  display: flex;
  gap: 16px;
}
</style> 