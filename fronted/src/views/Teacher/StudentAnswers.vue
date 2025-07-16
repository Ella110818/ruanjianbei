<template>
  <div class="student-answers-page">
    <TeacherHeader />
    <div class="main-content">
      <TeacherSidebar />
      <div class="answers-container">
        <!-- 筛选器 -->
        <div class="filter-section">
          <el-input
            v-model="filters.search"
            placeholder="搜索学生姓名"
            @input="handleFilterChange"
            class="filter-item"
          />
          <el-select
            v-model="filters.exercise"
            placeholder="选择练习题"
            @change="handleFilterChange"
            class="filter-item"
          >
            <el-option
              v-for="exercise in exercises"
              :key="exercise.id"
              :label="exercise.title"
              :value="exercise.id"
            />
          </el-select>
        </div>

        <!-- 答题记录表格 -->
        <el-table
          :data="answers"
          style="width: 100%"
          v-loading="loading"
          border
        >
          <el-table-column prop="student_name" label="学生姓名" width="120" />
          <el-table-column prop="exercise_title" label="练习题" min-width="200" />
          <el-table-column prop="content" label="学生答案" width="120" align="center" />
          <el-table-column prop="score" label="得分" width="100" align="center">
            <template #default="{ row }">
              {{ row.score || '未评分' }}
            </template>
          </el-table-column>
          <el-table-column prop="submitted_at" label="提交时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.submitted_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="text" @click="handleViewDetail(row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页器 -->
        <div class="pagination-container">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            @current-change="handlePageChange"
            layout="total, prev, pager, next"
          />
        </div>
      </div>
    </div>

    <!-- 答题详情对话框 -->
    <el-dialog
      title="答题详情"
      v-model="detailDialogVisible"
      width="600px"
    >
      <div v-if="selectedAnswer" class="answer-detail">
        <div class="detail-item">
          <label>学生姓名：</label>
          <span>{{ selectedAnswer.student_name }}</span>
        </div>
        <div class="detail-item">
          <label>练习题：</label>
          <span>{{ selectedAnswer.exercise_title }}</span>
        </div>
        <div class="detail-item">
          <label>学生答案：</label>
          <span>{{ selectedAnswer.content }}</span>
        </div>
        <div class="detail-item">
          <label>得分：</label>
          <el-input-number 
            v-model="selectedAnswer.score" 
            :min="0" 
            :max="100"
            size="small"
            :disabled="!isEditing"
          />
        </div>
        <div class="detail-item">
          <label>教师反馈：</label>
          <el-input
            v-model="selectedAnswer.feedback"
            type="textarea"
            :rows="3"
            placeholder="请输入反馈意见"
            :disabled="!isEditing"
          />
        </div>
        <div class="detail-item">
          <label>详细解释：</label>
          <el-input
            v-model="selectedAnswer.explanation"
            type="textarea"
            :rows="3"
            placeholder="答案的详细解释"
            :disabled="!isEditing"
          />
        </div>
        <div class="detail-item">
          <label>参考来源：</label>
          <el-input
            v-model="selectedAnswer.sources"
            placeholder="参考资料来源"
            :disabled="!isEditing"
          />
        </div>
        <div class="detail-item">
          <label>提交时间：</label>
          <span>{{ formatDate(selectedAnswer.submitted_at) }}</span>
        </div>
        
        <!-- AI评分结果展示 -->
        <div v-if="aiGradeResult" class="ai-grade-result">
          <h3>AI评分建议</h3>
          <div class="ai-grade-item">
            <label>正确性：</label>
            <span :class="{ 'correct': aiGradeResult.is_correct, 'incorrect': !aiGradeResult.is_correct }">
              {{ aiGradeResult.is_correct ? '正确' : '错误' }}
            </span>
          </div>
          <div class="ai-grade-item">
            <label>建议得分：</label>
            <span :class="{ 'score-high': aiGradeResult.score >= 80, 'score-medium': aiGradeResult.score >= 60 && aiGradeResult.score < 80, 'score-low': aiGradeResult.score < 60 }">
              {{ aiGradeResult.score }}分
            </span>
          </div>
          <div class="ai-grade-item">
            <label>评价反馈：</label>
            <div class="ai-feedback">{{ aiGradeResult.feedback }}</div>
          </div>
          <div v-if="aiGradeResult.improvement_suggestions" class="ai-grade-item">
            <label>改进建议：</label>
            <div class="ai-suggestions">{{ aiGradeResult.improvement_suggestions }}</div>
          </div>
          <div v-if="aiGradeResult.explanation" class="ai-grade-item">
            <label>详细解释：</label>
            <div class="ai-explanation">{{ aiGradeResult.explanation }}</div>
          </div>
          <div class="ai-grade-item">
            <label>参考来源：</label>
            <div class="ai-sources">{{ aiGradeResult.sources }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="info" @click="requestAIGrade" :loading="aiGrading">AI批改</el-button>
          <template v-if="!isEditing">
            <el-button type="primary" @click="startEdit">编辑评分</el-button>
          </template>
          <template v-else>
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" @click="saveGrade" :loading="saving">保存</el-button>
          </template>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import { getStudentAnswers, getExercises, updateStudentAnswer } from '@/api'
import { ElMessage } from 'element-plus'
import { API_CONFIG } from '@/api'  // 添加导入

// 状态管理
const loading = ref(false)
const answers = ref([])
const exercises = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailDialogVisible = ref(false)
const selectedAnswer = ref(null)

// 加载练习题列表
const loadExercises = async () => {
  try {
    const response = await getExercises({
      page: 1,
      page_size: 100
    })
    
    if (response.success && response.status_code === 200) {  // 修改判断条件
      exercises.value = response.data || []
      console.log('练习题列表:', exercises.value)
    }
  } catch (error) {
    console.error('加载练习题失败:', error)
  }
}

// 筛选条件
const filters = ref({
  search: '',
  exercise: undefined
})

// 处理筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1
  loadAnswers()
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  loadAnswers()
}

// 查看详情
const handleViewDetail = (row) => {
  selectedAnswer.value = { ...row }
  // 重置AI评分结果
  aiGradeResult.value = null
  detailDialogVisible.value = true
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 评分相关状态
const isEditing = ref(false)
const saving = ref(false)
const originalAnswer = ref(null)

// 开始编辑
const startEdit = () => {
  originalAnswer.value = { ...selectedAnswer.value }
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  Object.assign(selectedAnswer.value, originalAnswer.value)
  isEditing.value = false
}

// 保存评分
const saveGrade = async () => {
  if (!selectedAnswer.value) return
  
  saving.value = true
  try {
    const response = await updateStudentAnswer(selectedAnswer.value.id, {
      score: selectedAnswer.value.score,
      feedback: selectedAnswer.value.feedback,
      explanation: selectedAnswer.value.explanation,
      sources: selectedAnswer.value.sources
    })
    
    if (response.success && response.status_code === 200) {
      ElMessage.success('保存成功')
      isEditing.value = false
      loadAnswers() // 重新加载列表
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存评分失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 加载答题记录
const loadAnswers = async () => {
  loading.value = true
  try {
    const response = await getStudentAnswers({
      ...filters.value,
      page: currentPage.value,
      page_size: pageSize.value
    })
    
    console.log('API响应数据:', response)
    
    if (response.success && response.status_code === 200) {  // 修改判断条件
      console.log('答题记录数据:', response.data.results)
      console.log('总记录数:', response.data.count)
      
      answers.value = response.data.results || []
      total.value = response.data.count || 0
      
      console.log('更新后的answers:', answers.value)
    } else {
      ElMessage.error('获取答题记录失败')
    }
  } catch (error) {
    console.error('加载答题记录失败:', error)
    ElMessage.error('加载答题记录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 添加AI批改相关状态
const aiGrading = ref(false)
const aiGradeResult = ref(null)

// 请求AI批改
const requestAIGrade = async () => {
  if (!selectedAnswer.value) return
  
  aiGrading.value = true
  try {
    // 生成唯一的会话ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 构造请求数据
    const requestData = {
      exercise_id: selectedAnswer.value.exercise,
      student_answer: selectedAnswer.value.content,
      session_id: sessionId
    }
    
    console.log('AI批改请求数据:', requestData)
    
    // 发送请求到AI批改接口
    const response = await fetch(`${API_CONFIG.BASE_URL}/ai/correct-answer/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': localStorage.getItem('token') || ''
      },
      body: JSON.stringify(requestData)
    })

    const data = await response.json()
    console.log('AI批改响应数据:', data)
    
    if (data.success && data.status_code === 200) {
      try {
        // 1. 从feedback字符串中提取JSON部分
        const feedback = data.data.feedback;
        const jsonMatch = feedback.match(/```json\n([\s\S]*?)\n```/);
        
        if (jsonMatch && jsonMatch[1]) {
          // 2. 解析JSON部分
          const answerJson = JSON.parse(jsonMatch[1]);
          
          // 3. 提取sources
          const sourcesMatch = feedback.match(/sources': '([^']*?)'/);
          const sources = sourcesMatch ? sourcesMatch[1] : '无';
          
          // 4. 更新AI评分结果
          aiGradeResult.value = {
            is_correct: answerJson.is_correct,
            score: answerJson.score,
            feedback: answerJson.feedback,
            improvement_suggestions: answerJson.improvement_suggestions,
            explanation: answerJson.explanation,
            sources: sources
          }
          
          // 如果AI评分成功，自动填入分数和反馈
          if (!isEditing.value) {
            startEdit()
          }
          
          // 更新当前选中的答案
          if (selectedAnswer.value) {
            selectedAnswer.value.score = answerJson.score
            selectedAnswer.value.feedback = answerJson.improvement_suggestions || answerJson.feedback
            selectedAnswer.value.explanation = answerJson.explanation || ''
            selectedAnswer.value.sources = sources
          }
          
          ElMessage.success('AI批改完成')
        } else {
          throw new Error('无法解析AI评分数据')
        }
      } catch (error) {
        console.error('解析AI评分数据失败:', error)
        ElMessage.error('解析AI评分数据失败：' + error.message)
      }
    } else {
      throw new Error(data.message || 'AI批改失败')
    }
  } catch (error) {
    console.error('AI批改失败:', error)
    ElMessage.error(error.message || 'AI批改失败，请稍后重试')
  } finally {
    aiGrading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadAnswers()
  loadExercises()
})
</script>

<style scoped>
.student-answers-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  padding-top: 64px;
}

.main-content {
  display: flex;
  min-height: calc(100vh - 64px);
  position: relative;
}

.answers-container {
  flex: 1;
  padding: 24px;
  margin-left: 200px;
  width: calc(100% - 200px);
  box-sizing: border-box;
  overflow-x: auto;
}

.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 200px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.answer-detail {
  padding: 20px;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
}

.detail-item label {
  width: 100px;
  color: #606266;
  font-weight: 500;
  padding-top: 5px;
}

.detail-item .el-input,
.detail-item .el-input-number {
  width: 200px;
}

.detail-item .el-input {
  width: 400px;
}

.detail-item .el-textarea {
  width: 400px;
}

/* 添加AI评分结果样式 */
.ai-grade-result {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.ai-grade-result h3 {
  margin: 0 0 20px 0;
  color: #409EFF;
  font-size: 18px;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 10px;
}

.ai-grade-item {
  margin-bottom: 16px;
  padding: 8px 0;
}

.ai-grade-item label {
  display: inline-block;
  min-width: 80px;
  color: #606266;
  font-weight: 600;
  margin-right: 12px;
}

.ai-grade-item .correct {
  color: #67C23A;
  font-weight: 600;
  background: rgba(103, 194, 58, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.ai-grade-item .incorrect {
  color: #F56C6C;
  font-weight: 600;
  background: rgba(245, 108, 108, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.ai-grade-item .score-high {
  color: #67C23A;
  font-weight: 600;
  background: rgba(103, 194, 58, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.ai-grade-item .score-medium {
  color: #E6A23C;
  font-weight: 600;
  background: rgba(230, 162, 60, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.ai-grade-item .score-low {
  color: #F56C6C;
  font-weight: 600;
  background: rgba(245, 108, 108, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.ai-feedback,
.ai-suggestions,
.ai-explanation,
.ai-sources {
  margin-top: 8px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  color: #606266;
  line-height: 1.6;
  border: 1px solid #EBEEF5;
}

.ai-sources {
  color: #909399;
  font-style: italic;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media screen and (max-width: 1366px) {
  .answers-container {
    margin-left: 180px;
    width: calc(100% - 180px);
    padding: 20px;
  }
  
  .filter-item {
    min-width: 160px;
  }
}

@media screen and (max-width: 1024px) {
  .answers-container {
    margin-left: 160px;
    width: calc(100% - 160px);
    padding: 16px;
  }
  
  .filter-item {
    min-width: 140px;
  }
}
</style> 