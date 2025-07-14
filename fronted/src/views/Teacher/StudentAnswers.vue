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
          <label>提交时间：</label>
          <span>{{ formatDate(selectedAnswer.submitted_at) }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
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

// 状态管理
const loading = ref(false)
const answers = ref([])
const exercises = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailDialogVisible = ref(false)
const selectedAnswer = ref(null)

// 筛选条件
const filters = ref({
  search: '',
  exercise: undefined
})

// 加载答题记录
const loadAnswers = async () => {
  loading.value = true
  try {
    const response = await getStudentAnswers({
      ...filters.value,
      page: currentPage.value,
      page_size: pageSize.value
    })
    
    if (response.success && response.status_code === 200) {
      answers.value = response.data.results || []
      total.value = response.data.count || 0
    } else {
      ElMessage.error(response.message || '获取答题记录失败')
    }
  } catch (error) {
    console.error('加载答题记录失败:', error)
    ElMessage.error('加载答题记录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 加载练习题列表
const loadExercises = async () => {
  try {
    const response = await getExercises({
      page: 1,
      page_size: 100
    })
    
    if (response.success && response.status_code === 200) {
      exercises.value = response.data || []
    } else {
      ElMessage.error(response.message || '获取练习题列表失败')
    }
  } catch (error) {
    console.error('加载练习题失败:', error)
    ElMessage.error('加载练习题失败，请稍后重试')
  }
}

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
      feedback: selectedAnswer.value.feedback
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

.detail-item .el-textarea {
  width: 400px;
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