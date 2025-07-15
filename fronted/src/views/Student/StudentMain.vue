<template>
  <div class="exercises-page">
    <StudentHeader />
    <div class="main-content">
      <div class="exercises-container">
        <!-- 筛选器 -->
        <div class="filter-section">
          <el-input
            v-model="filters.search"
            placeholder="搜索练习题"
            @input="handleFilterChange"
            class="filter-item"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
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
            <el-option label="较难" value="3" />
            <el-option label="困难" value="4" />
          </el-select>
          <el-select
            v-model="filters.knowledge_point"
            placeholder="知识点"
            @change="handleFilterChange"
            class="filter-item"
            :loading="knowledgePointsLoading"
          >
            <template #prefix>
              <small>{{ knowledgePoints.length }}个知识点</small>
            </template>
            <el-option
              v-for="point in knowledgePoints"
              :key="point.id"
              :label="point.title"
              :value="point.id"
            >
              <div class="knowledge-point-option">
                <span class="knowledge-point-title">{{ point.title }}</span>
                <span class="knowledge-point-course" v-if="point.course_title">({{ point.course_title }})</span>
                <small v-if="point.content" class="knowledge-point-desc">
                  {{ point.content && point.content.length > 50 ? point.content.slice(0, 50) + '...' : point.content }}
                </small>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 练习题列表 -->
        <div class="exercises-list" v-loading="loading">
          <el-card v-for="exercise in exercises" :key="exercise.id" class="exercise-card">
            <div class="exercise-header" @click="toggleExercise(exercise.id)">
              <span class="exercise-title">{{ exercise.title }}</span>
              <el-tag size="small" :type="getExerciseTagType(exercise.type)">
                {{ getExerciseTypeName(exercise.type) }}
              </el-tag>
            </div>
            <div class="exercise-content">{{ exercise.content }}</div>
            
            <!-- 选项展示区域 -->
            <div v-if="exercise.id === expandedExerciseId" class="exercise-options">
              <div class="options-title">选项：</div>
              <div v-for="(option, index) in JSON.parse(exercise.answer_template)" 
                   :key="index" 
                   class="option-item"
                   :class="{ 'selected': exercise.studentAnswer === String.fromCharCode(65 + index) }"
                   @click="selectAnswer(exercise, String.fromCharCode(65 + index))">
                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                <span class="option-text">{{ option }}</span>
              </div>
              
              <!-- 提交按钮 -->
              <div class="answer-actions" v-if="!exercise.isSubmitted">
                <el-button 
                  type="primary" 
                  @click="submitAnswer(exercise)"
                  :disabled="!exercise.studentAnswer">
                  提交答案
                </el-button>
              </div>
              
              <!-- 提交后的反馈 -->
              <div v-if="exercise.isSubmitted" class="feedback-section">
                <div class="score">得分：{{ exercise.score || 0 }}</div>
                <div class="feedback">{{ exercise.feedback || '暂无反馈' }}</div>
              </div>
            </div>
            
            <div class="exercise-footer">
              <span class="knowledge-point">知识点：{{ exercise.knowledge_point_title }}</span>
              <span class="difficulty">
                难度：
                <el-rate
                  v-model="exercise.difficulty"
                  :max="4"
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
            v-model="currentPage"
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
import StudentHeader from '@/components/StudentHeader.vue'
import { getExercises, getKnowledgePoints, submitStudentAnswer, getCurrentUser } from '@/api'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 状态管理
const exercises = ref([])
const knowledgePoints = ref([])
const loading = ref(false)
const knowledgePointsLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentUser = ref(null)

// 筛选条件
const filters = ref({
  search: '',
  type: '',
  difficulty: '',
  knowledge_point: '',  // 确保这个字段被初始化为空字符串
  ordering: '1'
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const response = await getCurrentUser()
    console.log('获取用户信息响应:', response)
    
    if (response.code === 0) {  // 修改判断条件
      currentUser.value = response.data
      return true
    } else {
      console.warn('获取用户信息失败:', response)
      return false
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    return false
  }
}

// 加载练习题
const loadExercises = async () => {
  loading.value = true
  try {
    const response = await getExercises({
      ...filters.value,
      page: currentPage.value
    })
    
    if (response.success && response.status_code === 200) {  // 修改判断条件
      exercises.value = response.data.results.map(exercise => ({
        ...exercise,
        studentAnswer: '',
        isSubmitted: false,
        score: null,
        feedback: ''
      }))
      total.value = response.data.count || 0
    } else {
      ElMessage.error('获取练习题失败')
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
  knowledgePointsLoading.value = true
  try {
    let allKnowledgePoints = []
    let nextPage = 1
    let hasMore = true

    while (hasMore) {
      const response = await getKnowledgePoints({
        page: nextPage,
        page_size: 100,
        ordering: 'title'
      })
      
      console.log(`加载第${nextPage}页知识点:`, response)
      
      if (response.code === 0) {
        if (response.data && Array.isArray(response.data.results)) {
          allKnowledgePoints = [...allKnowledgePoints, ...response.data.results]
          
          // 检查是否还有下一页
          hasMore = !!response.data.next
          nextPage++
        } else {
          console.error('知识点数据格式不正确:', response.data)
          ElMessage.error('知识点数据格式不正确')
          break
        }
      } else {
        console.error('获取知识点列表失败:', response)
        ElMessage.error(response.msg || '获取知识点列表失败')
        break
      }
    }

    knowledgePoints.value = allKnowledgePoints
    console.log('知识点加载完成，总数：', knowledgePoints.value.length)
  } catch (error) {
    console.error('加载知识点失败:', error)
    ElMessage.error('加载知识点失败，请稍后重试')
  } finally {
    knowledgePointsLoading.value = false
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

// 展开/折叠状态管理
const expandedExerciseId = ref(null)

// 切换练习题展开/折叠状态
const toggleExercise = (exerciseId) => {
  expandedExerciseId.value = expandedExerciseId.value === exerciseId ? null : exerciseId
}

// 获取题目类型标签样式
const getExerciseTagType = (type) => {
  const types = {
    'single_choice': 'primary',
    'multiple_choice': 'success',
    'true_false': 'warning'
  }
  return types[type] || 'info'
}

// 获取题目类型名称
const getExerciseTypeName = (type) => {
  const types = {
    'single_choice': '单选题',
    'multiple_choice': '多选题',
    'true_false': '判断题'
  }
  return types[type] || '未知类型'
}

// 选择答案
const selectAnswer = (exercise, answer) => {
  if (exercise.isSubmitted) return
  exercise.studentAnswer = answer
}

// 提交答案
const submitAnswer = async (exercise) => {
  if (!exercise.studentAnswer) {
    ElMessage.warning('请先选择答案')
    return
  }

  if (!currentUser.value) {
    ElMessage.error('请先登录')
    window.location.href = '/login'
    return
  }

  try {
    console.log('提交答案参数:', {
      exercise: exercise.id,
      content: exercise.studentAnswer,
      student: currentUser.value.id
    });

    const response = await submitStudentAnswer({
      exercise: exercise.id,
      content: exercise.studentAnswer,
      student: currentUser.value.id
    })

    if (response.success && response.status_code === 200) {
      exercise.isSubmitted = true
      exercise.score = response.data.score
      exercise.feedback = response.data.feedback
      ElMessage.success('提交成功')
    } else {
      ElMessage.error(response.message || '提交失败')
    }
  } catch (error) {
    console.error('提交答案失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('提交答案失败，请稍后重试')
    }
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  const userLoaded = await loadUserInfo()
  
  if (!userLoaded) {
    console.log('用户未登录或登录已过期')
    ElMessage.warning('请重新登录')
    setTimeout(() => {
      window.location.href = '/login'
    }, 1500)
    return
  }
  
  // 用户信息加载成功，加载其他数据
  try {
    await Promise.all([
      loadExercises(),
      loadKnowledgePoints()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请刷新页面重试')
  }
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
  justify-content: center;
}

.exercises-container {
  width: 100%;
  max-width: 1000px;
  padding: 24px;
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  flex: 1;
  min-width: 200px;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.exercise-card {
  border-radius: 8px;
  transition: all 0.3s;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.exercise-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.exercise-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.exercise-content {
  padding: 16px;
  color: #666;
  line-height: 1.6;
}

.exercise-options {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
  margin: 0 16px 16px;
}

.options-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.option-item {
  padding: 12px;
  margin: 8px 0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #eee;
}

.option-item:hover {
  background: #f0f7ff;
  border-color: #409EFF;
}

.option-item.selected {
  background: #409EFF;
  color: white;
  border-color: #409EFF;
}

.option-item.selected .option-label {
  color: white;
}

.option-label {
  font-weight: 600;
  color: #409EFF;
  margin-right: 12px;
}

.exercise-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.knowledge-point {
  color: #409EFF;
}

.answer-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.feedback-section {
  margin-top: 16px;
  padding: 16px;
  background: #f0f9eb;
  border-radius: 4px;
  color: #67c23a;
}

.score {
  font-weight: 600;
  margin-bottom: 8px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.knowledge-point-option {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.knowledge-point-title {
  font-weight: 500;
  color: #333;
}

.knowledge-point-course {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

.knowledge-point-desc {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
  display: block;
  white-space: normal;
  line-height: 1.3;
}

@media screen and (max-width: 768px) {
  .exercises-container {
    padding: 16px;
  }

  .filter-item {
    min-width: 100%;
  }
}
</style> 