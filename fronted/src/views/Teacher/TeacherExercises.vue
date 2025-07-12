<template>
  <div class="exercises-page">
    <TeacherHeader />
    <div class="main-content">
      <TeacherSidebar
        :sideTab="sideTab"
        :courseMenuOpen="courseMenuOpen"
        :courses="courses"
        @update:sideTab="handleSideTabChange"
        @update:courseMenuOpen="handleCourseMenuChange"
      />
      <div class="exercises-container">
        <!-- 添加创建按钮 -->
        <div class="action-bar">
          <el-button type="primary" @click="showCreateDialog">
            创建练习题
          </el-button>
        </div>

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
            :loading="knowledgePointsLoading"
          >
            <el-option
              v-for="point in knowledgePoints"
              :key="point.id"
              :label="point.title"
              :value="point.id"
            >
              <div class="knowledge-point-option">
                <span>{{ point.title }}</span>
                <small v-if="point.description" class="knowledge-point-desc">
                  {{ point.description.length > 50 ? point.description.slice(0, 50) + '...' : point.description }}
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
              <el-tag size="small" :type="exercise.type === 'single_choice' ? 'primary' : 'success'">
                {{ exercise.type === 'single_choice' ? '单选题' : '多选题' }}
              </el-tag>
            </div>
            <div class="exercise-content">{{ exercise.content }}</div>
            <!-- 添加选项展示区域 -->
            <div v-if="exercise.id === expandedExerciseId" class="exercise-options">
              <div class="options-title">选项：</div>
              <div v-for="(option, index) in JSON.parse(exercise.answer_template)" 
                   :key="index" 
                   class="option-item">
                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                <span class="option-text">{{ option }}</span>
              </div>
            </div>
            <div class="exercise-footer">
              <span class="knowledge-point">知识点：{{ exercise.knowledge_point_title }}</span>
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
            :model-value="currentPage"
            @update:modelValue="currentPage = $event"
            :page-size="pageSize"
            :total="total"
            @current-change="handlePageChange"
            layout="prev, pager, next"
          />
        </div>

        <!-- 添加创建练习题对话框 -->
        <el-dialog
          title="创建练习题"
          v-model="createDialogVisible"
          width="600px"
        >
          <el-form
            ref="createForm"
            :model="exerciseForm"
            :rules="formRules"
            label-width="100px"
          >
            <el-form-item label="题目标题" prop="title">
              <el-input v-model="exerciseForm.title" placeholder="请输入题目标题" />
            </el-form-item>
            
            <el-form-item label="题目内容" prop="content">
              <el-input
                v-model="exerciseForm.content"
                type="textarea"
                :rows="4"
                placeholder="请输入题目内容"
              />
            </el-form-item>
            
            <el-form-item label="题目类型" prop="type">
              <el-select v-model="exerciseForm.type" placeholder="请选择题目类型">
                <el-option label="单选题" value="single_choice" />
                <el-option label="多选题" value="multiple_choice" />
                <el-option label="判断题" value="true_false" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="难度等级" prop="difficulty">
              <el-select v-model="exerciseForm.difficulty" placeholder="请选择难度等级">
                <el-option label="简单" :value="1" />
                <el-option label="中等" :value="2" />
                <el-option label="困难" :value="3" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="知识点" prop="knowledge_point">
              <el-select
                v-model="exerciseForm.knowledge_point"
                placeholder="请选择知识点"
                :loading="knowledgePointsLoading"
              >
                <el-option
                  v-for="point in knowledgePoints"
                  :key="point.id"
                  :label="point.title"
                  :value="point.id"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="答案模板" prop="answer_template">
              <el-input
                v-model="exerciseForm.answer_template"
                type="textarea"
                :rows="3"
                placeholder="请输入答案模板"
              />
            </el-form-item>
          </el-form>
          
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="createDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleCreateExercise" :loading="creating">
                创建
              </el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import { getExercises, getKnowledgePoints, getCourseList, createExercise } from '@/api'
import { ElMessage } from 'element-plus'

// 状态管理
const sideTab = ref('exercises')
const courseMenuOpen = ref(false)
const courses = ref([])
const exercises = ref([])
const knowledgePoints = ref([])
const loading = ref(false)
const knowledgePointsLoading = ref(false)  // 添加知识点加载状态
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
  knowledgePointsLoading.value = true
  try {
    const response = await getKnowledgePoints({
      page: 1,
      page_size: 100,  // 获取更多知识点
      ordering: 'title'  // 按标题排序
    })
    
    if (response.code === 0 && response.data) {
      knowledgePoints.value = response.data.results.map(point => ({
        id: point.id,
        title: point.title, // 使用 title 而不是 name
        description: point.content // 使用 content 作为描述
      })) || []
      console.log('知识点列表:', knowledgePoints.value) // 添加日志
    } else {
      ElMessage.error(response.msg || '获取知识点列表失败')
    }
  } catch (error) {
    console.error('加载知识点失败:', error)
    ElMessage.error('加载知识点失败，请稍后重试')
  } finally {
    knowledgePointsLoading.value = false
  }
}

// 加载课程列表
const loadCourses = async () => {
  try {
    const response = await getCourseList()
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
  // 如果是课程相关的标签，打开课程菜单
  if (tab.startsWith('course-')) {
    courseMenuOpen.value = true
  }
  // 保存到localStorage以便在页面刷新后恢复
  localStorage.setItem('sideTab', tab)
}

// 处理课程菜单状态变化
const handleCourseMenuChange = (open) => {
  courseMenuOpen.value = open
  // 如果关闭菜单且当前是课程相关的标签，切换到练习题标签
  if (!open && sideTab.value.startsWith('course-')) {
    handleSideTabChange('exercises')
  }
}

// 恢复之前的状态
const restorePreviousState = () => {
  const previousTab = localStorage.getItem('sideTab')
  if (previousTab) {
    sideTab.value = previousTab
    if (previousTab.startsWith('course-')) {
      courseMenuOpen.value = true
    }
  }
}

// 创建练习题相关状态
const createDialogVisible = ref(false)
const creating = ref(false)
const createForm = ref(null)

// 练习题表单数据
const exerciseForm = ref({
  title: '',
  content: '',
  type: 'single_choice',
  difficulty: 1,
  knowledge_point: '',
  answer_template: ''
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入题目标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入题目内容', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择题目类型', trigger: 'change' }
  ],
  difficulty: [
    { required: true, message: '请选择难度等级', trigger: 'change' }
  ],
  knowledge_point: [
    { required: true, message: '请选择知识点', trigger: 'change' }
  ],
  answer_template: [
    { required: true, message: '请输入答案模板', trigger: 'blur' }
  ]
}

// 显示创建对话框
const showCreateDialog = () => {
  createDialogVisible.value = true
  // 重置表单
  if (createForm.value) {
    createForm.value.resetFields()
  }
}

// 创建练习题
const handleCreateExercise = async () => {
  if (!createForm.value) return
  
  try {
    await createForm.value.validate()
    
    creating.value = true
    const response = await createExercise(exerciseForm.value)
    console.log('创建练习题响应:', response);
    
    // 检查响应格式
    if (response.success && (response.status_code === 200 || response.status_code === 201)) {
      ElMessage.success('创建练习题成功')
      createDialogVisible.value = false
      // 重新加载练习题列表
      loadExercises()
    } else {
      console.error('创建练习题失败:', response);
      ElMessage.error(response.message || '创建练习题失败')
    }
  } catch (error) {
    console.error('创建练习题失败:', error)
    ElMessage.error('创建练习题失败，请检查表单内容')
  } finally {
    creating.value = false
  }
}

// 添加展开/折叠状态管理
const expandedExerciseId = ref(null)

// 切换练习题展开/折叠状态
const toggleExercise = (exerciseId) => {
  expandedExerciseId.value = expandedExerciseId.value === exerciseId ? null : exerciseId
}

// 组件挂载时加载数据
onMounted(() => {
  restorePreviousState() // 先恢复状态
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
  cursor: pointer;
}

.exercise-card:hover {
  transform: translateY(-2px);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.exercise-header:hover {
  background-color: #f5f7fa;
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

.knowledge-point-option {
  display: flex;
  flex-direction: column;
}

.knowledge-point-desc {
  color: #999;
  font-size: 12px;
  margin-top: 2px;
}

/* 添加新样式 */
.action-bar {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.exercise-options {
  margin: 16px 0;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.options-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #606266;
}

.option-item {
  margin: 8px 0;
  padding: 8px;
  border-radius: 4px;
  background-color: white;
  display: flex;
  align-items: center;
}

.option-label {
  font-weight: 600;
  margin-right: 8px;
  color: #409EFF;
  min-width: 24px;
}

.option-text {
  color: #606266;
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