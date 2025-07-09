<template>
  <div class="question-list">
    <div v-for="(question, index) in parsedQuestions" 
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
               :class="{ 'selected': selectedAnswers[index] === optIndex }">
            <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
            <span class="option-text">{{ option }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

const selectedAnswers = ref({})

const parsedQuestions = computed(() => {
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
</script>

<style scoped>
.question-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 16px;
}

.question-item {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
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
}

.question-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.question-text {
  font-size: 15px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
}

.option-item:hover .option-text,
.option-item.selected .option-text {
  color: #409EFF;
}
</style> 