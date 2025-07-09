<template>
  <div class="question-list" v-if="questions.length">
    <div v-for="(question, index) in questions" 
         :key="index" 
         class="question-item">
      <div class="question-header">
        <span class="question-number">第 {{ index + 1 }} 题</span>
        <span class="question-type">{{ getQuestionType(question.type) }}</span>
        <span class="question-difficulty">难度: {{ question.difficulty }}</span>
      </div>
      <div class="question-title">{{ question.title }}</div>
      <div class="question-content">{{ question.content }}</div>
      <div class="question-options" v-if="question.answer_template && question.answer_template.length">
        <div v-for="(option, optIndex) in question.answer_template" 
             :key="optIndex" 
             class="option-item">
          {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

const questions = computed(() => {
  try {
    const data = JSON.parse(props.content)
    return data.questions || []
  } catch {
    return []
  }
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
</script>

<style scoped>
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
</style> 