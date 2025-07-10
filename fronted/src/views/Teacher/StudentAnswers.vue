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
            v-model="filters.exercise_id"
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
          <el-select
            v-model="filters.is_correct"
            placeholder="答题结果"
            @change="handleFilterChange"
            class="filter-item"
          >
            <el-option label="全部" :value="undefined" />
            <el-option label="正确" :value="true" />
            <el-option label="错误" :value="false" />
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
          <el-table-column prop="answer" label="学生答案" width="120" align="center" />
          <el-table-column label="是否正确" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_correct ? 'success' : 'danger'">
                {{ row.is_correct ? '正确' : '错误' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="得分" width="100" align="center" />
          <el-table-column prop="submit_time" label="提交时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.submit_time) }}
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
          <span>{{ selectedAnswer.answer }}</span>
        </div>
        <div class="detail-item">
          <label>是否正确：</label>
          <el-tag :type="selectedAnswer.is_correct ? 'success' : 'danger'">
            {{ selectedAnswer.is_correct ? '正确' : '错误' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <label>得分：</label>
          <span>{{ selectedAnswer.score }}</span>
        </div>
        <div class="detail-item">
          <label>提交时间：</label>
          <span>{{ formatDate(selectedAnswer.submit_time) }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import { getStudentAnswers, getExercises } from '@/api'
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
  exercise_id: undefined,
  is_correct: undefined
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
    
    if (response.code === 0 && response.data) {
      answers.value = response.data.results || []
      total.value = response.data.total || 0
    } else {
      ElMessage.error(response.msg || '获取答题记录失败')
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
    
    if (response.code === 0 && response.data) {
      exercises.value = response.data.results || []
    } else {
      ElMessage.error(response.msg || '获取练习题列表失败')
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
  selectedAnswer.value = row
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
}

.answers-container {
  flex: 1;
  padding: 24px;
  margin-left: 200px;
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
  align-items: center;
}

.detail-item label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.detail-item span {
  color: #333;
}

@media screen and (max-width: 1366px) {
  .answers-container {
    margin-left: 180px;
  }
  
  .filter-item {
    min-width: 180px;
  }
}

@media screen and (max-width: 1024px) {
  .answers-container {
    margin-left: 160px;
  }
  
  .filter-item {
    min-width: 160px;
  }
}
</style> 