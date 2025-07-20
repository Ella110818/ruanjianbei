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
            clearable
          >
            <el-option label="单选题" value="single_choice" />
            <el-option label="多选题" value="multiple_choice" />
            <el-option label="简答题" value="short_answer" />
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
    
    if (response.success && response.status_code === 200 && response.data) {
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
    // 构建请求参数，过滤掉空值
    const params = {
      page: currentPage.value,
      search: filters.value.search || undefined,
      type: filters.value.type || undefined,
      difficulty: filters.value.difficulty || undefined,
      knowledge_point: filters.value.knowledge_point || undefined,
      ordering: filters.value.ordering
    }
    
    // 移除所有undefined的属性
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key])
    
    const response = await getExercises(params)
    
    if (response.success && response.status_code === 200) {
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

// 获取题目类型名称
const getExerciseTypeName = (type) => {
  const types = {
    'single_choice': '单选题',
    'multiple_choice': '多选题',
    'short_answer': '简答题'
  }
  return types[type] || '未知类型'
}

// 获取题目类型标签样式
const getExerciseTagType = (type) => {
  const types = {
    'single_choice': 'primary',
    'multiple_choice': 'success',
    'short_answer': 'info'
  }
  return types[type] || 'info'
}

// 选择答案
const selectAnswer = (exercise, answer) => {
  if (exercise.isSubmitted) return
  exercise.studentAnswer = answer
}

// 提交答案
const submitAnswer = async (exercise) => {
  if (!exercise.studentAnswer || exercise.studentAnswer.length < 1) {
    ElMessage.warning('请先选择答案')
    return
  }

  if (!currentUser.value) {
    ElMessage.error('请先登录')
    window.location.href = '/login'
    return
  }

  try {
    // 构造提交数据
    const submitData = {
      exercise: exercise.id,
      content: exercise.studentAnswer,
      student: currentUser.value.id
    }

    // 打印提交的数据，用于调试
    console.log('提交答案数据:', submitData)

    const response = await submitStudentAnswer(submitData)
    
    console.log('服务器响应:', response)  // 添加响应日志

    if (response.success && response.status_code === 201) {
      exercise.isSubmitted = true
      exercise.score = response.data.score || 0
      exercise.feedback = response.data.feedback || '答案提交成功'
      ElMessage.success('提交成功')
    } else {
      throw new Error(response.message || '提交失败')
    }
  } catch (error) {
    console.error('提交答案失败:', error)
    ElMessage.error(error.message || '提交答案失败，请稍后重试')
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
  padding-top: 64px;
  position: relative;
  background-image: url('@/assets/back.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.exercises-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.01);  /* 从0.8改为0.5，降低不透明度 */
  pointer-events: none;
  z-index: 1;
}

.main-content {
  display: flex;
  min-height: calc(100vh - 64px);
  justify-content: center;
  position: relative;
  z-index: 2;
}

.exercises-container {
  width: 100%;
  max-width: 1200px;  /* 增加最大宽度 */
  padding: 30px;
  margin: 0 auto;  /* 居中容器 */
}

.filter-section {
  background: rgba(255, 255, 255, 0.85);
  padding: 24px 30px;  /* 增加内边距 */
  border-radius: 16px;  /* 增加圆角 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);  /* 优化阴影 */
  margin-bottom: 30px;
  display: flex;
  gap: 20px;  /* 增加间距 */
  flex-wrap: wrap;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);  /* 添加边框 */
}

.filter-item {
  flex: 1;
  min-width: 220px;  /* 稍微增加最小宽度 */
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 24px;  /* 增加卡片间距 */
}

.exercise-card {
  border-radius: 16px;  /* 增加圆角 */
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;  /* 确保内容不超出圆角 */
}

.exercise-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;  /* 增加内边距 */
  border-bottom: 1px solid rgba(238, 238, 238, 0.5);
  background: rgba(255, 255, 255, 0.5);  /* 添加微妙背景 */
}

.exercise-title {
  font-size: 18px;  /* 增加字号 */
  font-weight: 600;
  color: #2c3e50;  /* 更改字体颜色 */
  letter-spacing: 0.3px;  /* 添加字间距 */
}

.exercise-content {
  padding: 24px;
  color: #3a4a5c;  /* 更改字体颜色 */
  line-height: 1.8;  /* 增加行高 */
  font-size: 15px;  /* 调整字号 */
}

.exercise-options {
  padding: 16px;
  background: rgba(248, 249, 250, 0.9);
  border-radius: 4px;
  margin: 0 16px 16px;
}

.options-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.option-item {
  padding: 16px 20px;
  margin: 10px 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #eef2f7;  /* 更改边框颜色 */
  display: flex;
  align-items: center;
}

.option-item:hover {
  background: #f0f7ff;
  border-color: #409EFF;
  transform: translateX(4px);  /* 添加悬停效果 */
}

.option-item.selected {
  background: linear-gradient(135deg, #409EFF, #3a8ee6);  /* 添加渐变背景 */
  color: white;
  border-color: #409EFF;
  transform: translateX(4px);
}

.option-item.selected .option-label {
  color: white;
}

.option-label {
  font-weight: 600;
  color: #409EFF;
  margin-right: 16px;
  min-width: 24px;  /* 固定宽度 */
  text-align: center;  /* 居中对齐 */
}

.exercise-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(238, 238, 238, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);  /* 添加微妙背景 */
}

.knowledge-point {
  color: #409EFF;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.answer-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;  /* 添加按钮间距 */
}

.feedback-section {
  margin-top: 20px;
  padding: 20px;
  background: rgba(240, 249, 235, 0.95);
  border-radius: 12px;
  color: #67c23a;
  border: 1px solid rgba(103, 194, 58, 0.2);  /* 添加边框 */
}

.score {
  font-weight: 600;
  margin-bottom: 8px;
}

.pagination-container {
  margin-top: 30px;
  margin-bottom: 20px;  /* 添加底部间距 */
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

/* 添加响应式优化 */
@media screen and (max-width: 768px) {
  .exercises-container {
    padding: 16px;
  }

  .filter-section {
    padding: 20px;
  }
  
  .exercise-card {
    border-radius: 12px;
  }
  
  .exercise-title {
    font-size: 16px;
  }
}
</style> 