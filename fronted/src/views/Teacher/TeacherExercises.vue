<template>
  <div class="exercises-page">
    <TeacherHeader />
    <div class="main-content">
      <TeacherSidebar
        :sideTab="sideTab"
        :courseMenuOpen="courseMenuOpen"
        :courses="courses"
        @update:sideTab="handleSideTabChange"
        @update:courseMenuOpen="courseMenuOpen = $event"
      />
      <div class="exercises-container">
        <!-- 筛选器 -->
        <div class="filter-section">
          <el-input
            v-model="filters.search"
            placeholder="搜索练习题"
            @input="handleFilterChange"
            class="filter-item"
          />
          <el-select
            v-model="filters.type"
            placeholder="题目类型"
            @change="handleFilterChange"
            class="filter-item"
          >
            <el-option label="单选题" value="single_choice" />
            <el-option label="多选题" value="multiple_choice" />
            <el-option label="判断题" value="true_false" />
          </el-select>
          <el-select
            v-model="filters.difficulty"
            placeholder="难度等级"
            @change="handleFilterChange"
            class="filter-item"
          >
            <el-option label="简单" value="1" />
            <el-option label="中等" value="2" />
            <el-option label="困难" value="3" />
          </el-select>
          <el-select
            v-model="filters.knowledge_point"
            placeholder="知识点"
            @change="handleFilterChange"
            class="filter-item"
          >
            <el-option
              v-for="point in knowledgePoints"
              :key="point.id"
              :label="point.title"
              :value="point.id"
            />
          </el-select>
        </div>

        <!-- 练习题列表 -->
        <div class="exercises-list" v-loading="loading">
          <el-card v-for="exercise in exercises" :key="exercise.id" class="exercise-card">
            <div class="exercise-header">
              <span class="exercise-title">{{ exercise.title }}</span>
              <el-tag size="small" :type="exercise.type === 'single_choice' ? 'primary' : 'success'">
                {{ exercise.type === 'single_choice' ? '单选题' : '多选题' }}
              </el-tag>
            </div>
            <div class="exercise-content">{{ exercise.content }}</div>
            <div class="exercise-footer">
              <span class="knowledge-point">知识点：{{ exercise.knowledge_point }}</span>
              <span class="difficulty">
                难度：
                <el-rate
                  v-model="exercise.difficulty"
                  :max="3"
                  disabled
                  text-color="#ff9900"
                />
              </span>
            </div>
          </el-card>
        </div>

        <!-- 分页器 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            @current-change="handlePageChange"
            layout="prev, pager, next"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import { getExercises, getKnowledgePoints, getCourses } from '@/api'
import { ElMessage } from 'element-plus'

// 状态管理
const sideTab = ref('exercises')
const courseMenuOpen = ref(false)
const courses = ref([])
const exercises = ref([])
const knowledgePoints = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选条件
const filters = ref({
  search: '',
  type: 'single_choice',
  difficulty: '1',
  knowledge_point: '',
  ordering: '1'
})

// 加载练习题
const loadExercises = async () => {
  loading.value = true
  try {
    const response = await getExercises({
      ...filters.value,
      page: currentPage.value
    })
    
    if (response.code === 0 && response.data) {
      exercises.value = response.data.results || []
      total.value = response.data.count || 0
    } else {
      ElMessage.error(response.msg || '获取练习题失败')
    }
  } catch (error) {
    console.error('加载练习题失败:', error)
    ElMessage.error('加载练习题失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 加载知识点
const loadKnowledgePoints = async () => {
  try {
    const response = await getKnowledgePoints({
      page: 1,
      ordering: '1'
    })
    
    if (response.code === 0 && response.data) {
      knowledgePoints.value = response.data.results || []
    }
  } catch (error) {
    console.error('加载知识点失败:', error)
  }
}

// 加载课程列表
const loadCourses = async () => {
  try {
    const response = await getCourses()
    if (response.code === 0) {
      courses.value = response.data
    }
  } catch (error) {
    console.error('加载课程失败:', error)
  }
}

// 处理筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1
  loadExercises()
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  loadExercises()
}

// 处理侧边栏标签变化
const handleSideTabChange = (tab) => {
  sideTab.value = tab
}

// 组件挂载时加载数据
onMounted(() => {
  loadExercises()
  loadKnowledgePoints()
  loadCourses()
})
</script>

<style scoped>
.exercises-page {
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

.exercises-container {
  flex: 1;
  padding: 24px;
  margin-left: 300px;
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

.exercises-list {
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
}

.exercise-card {
  border-radius: 8px;
  transition: transform 0.2s;
}

.exercise-card:hover {
  transform: translateY(-2px);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.exercise-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.exercise-content {
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.exercise-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 14px;
}

.knowledge-point {
  color: #409EFF;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media screen and (max-width: 1366px) {
  .exercises-container {
    margin-left: 250px;
  }
  
  .filter-item {
    min-width: 180px;
  }
}

@media screen and (max-width: 1024px) {
  .exercises-container {
    margin-left: 200px;
  }
  
  .filter-item {
    min-width: 160px;
  }
}
</style> 