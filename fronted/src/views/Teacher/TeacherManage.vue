<template>
  <div class="exercises-page">
    <TeacherHeader />
    <div class="main-content">
      <div class="exercises-container">
        <!-- 添加创建按钮 -->
        <div class="action-bar">
          <el-button type="success" @click="showAutoCreateDialog" style="margin-right: 12px;">
            自动出题
          </el-button>
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
              <el-tag size="small" :type="getExerciseTagType(exercise.type)">
                {{ getExerciseTypeName(exercise.type) }}
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
                  :max="5"
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
                <el-option label="简答题" value="short_answer" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="难度等级" prop="difficulty">
              <el-select v-model="exerciseForm.difficulty" placeholder="请选择难度等级">
                <el-option label="非常简单" :value="1" />
                <el-option label="简单" :value="2" />
                <el-option label="中等" :value="3" />
                <el-option label="困难" :value="4" />
                <el-option label="非常困难" :value="5" />
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

        <!-- 添加自动出题对话框 -->
        <el-dialog
          title="自动出题"
          v-model="autoGenerateDialogVisible"
          width="600px"
        >
          <el-form
            ref="autoGenerateFormRef"
            :model="autoGenerateFormData"
            :rules="autoGenerateRules"
            label-width="100px"
          >
            <el-form-item label="知识点" prop="knowledge_point_ids">
              <el-select
                v-model="autoGenerateFormData.knowledge_point_ids"
                multiple
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
            
            <el-form-item label="题目类型" prop="question_types">
              <el-select
                v-model="autoGenerateFormData.question_types"
                multiple
                placeholder="请选择题目类型"
              >
                <el-option label="单选题" value="single_choice" />
                <el-option label="简答题" value="short_answer" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="生成数量" prop="quantity">
              <el-input-number
                v-model="autoGenerateFormData.quantity"
                :min="1"
                :max="50"
                placeholder="请输入生成数量"
              />
            </el-form-item>
            
            <el-form-item label="难度等级" prop="difficulty">
              <el-rate
                v-model="autoGenerateFormData.difficulty"
                :max="5"
                show-score
                text-color="#ff9900"
              />
            </el-form-item>
          </el-form>
          
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="autoGenerateDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleAutoGenerate" :loading="generating">
                开始生成
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
import { getExercises, getKnowledgePoints, getCourseList, generateQuestions } from '@/api'
import { ElMessage } from 'element-plus'
import { API_CONFIG } from '@/api'

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
  type: 'single_choice',  // 默认选择单选题
  difficulty: '',
  knowledge_point: '',
  ordering: '1'
})

// 加载练习题
const loadExercises = async () => {
  loading.value = true
  try {
    let allExercises = []
    let nextPage = 1
    let hasMore = true

    while (hasMore) {
      const response = await getExercises({
        ...filters.value,
        page: nextPage,
        page_size: 100  // 每页获取100条数据
      })
      
      console.log(`加载第${nextPage}页练习题:`, response)
      
      if (response.success && response.status_code === 200) {
        if (response.data && Array.isArray(response.data.results)) {
          allExercises = [...allExercises, ...response.data.results]
          
          // 检查是否还有下一页
          hasMore = !!response.data.next
          nextPage++
        } else {
          console.error('练习题数据格式不正确:', response.data)
          ElMessage.error('练习题数据格式不正确')
          break
        }
      } else {
        console.error('获取练习题列表失败:', response)
        ElMessage.error(response.message || '获取练习题失败')
        break
      }
    }

    exercises.value = allExercises
    total.value = allExercises.length
    console.log('练习题加载完成，总数：', total.value)
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
    // 直接获取第一页数据
    const response = await getKnowledgePoints({
      page: 1,
      page_size: 100,
      ordering: 'title'
    })
    
    console.log('知识点响应:', response)
    
    if (response.success && response.status_code === 200) {
      if (response.data && Array.isArray(response.data.results)) {
        knowledgePoints.value = response.data.results
        console.log('知识点加载完成，总数：', knowledgePoints.value.length)
      } else {
        console.error('知识点数据格式不正确:', response.data)
        ElMessage.error('知识点数据格式不正确')
      }
    } else {
      console.error('获取知识点列表失败:', response)
      ElMessage.error(response.message || '获取知识点列表失败')
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
    console.log('课程列表响应:', response)
    
    if (response.success && response.status_code === 200) {
      courses.value = response.data.results.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        subject: course.subject,
        grade_level: course.grade_level,
        teacher_name: course.teacher_name
      }))
      console.log('处理后的课程列表:', courses.value)
    } else {
      console.warn('获取课程列表失败:', response)
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
// 标识当前对话框是否为自动出题模式
const isAutoGenerate = ref(false)

// 练习题表单数据
const exerciseForm = ref({
  title: '',
  content: '',
  type: 'single_choice',  // 默认选择单选题
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
    { required: true, message: '请选择难度等级', trigger: 'change' },
    { type: 'number', min: 1, max: 5, message: '难度等级必须在1-5之间', trigger: 'change' }
  ],
  knowledge_point: [
    { required: true, message: '请选择知识点', trigger: 'change' }
  ],
  answer_template: [
    { required: true, message: '请输入答案模板', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (exerciseForm.value.type === 'single_choice') {
          try {
            const options = JSON.parse(value);
            if (!Array.isArray(options)) {
              callback(new Error('单选题答案模板必须是数组格式'));
            } else {
              callback();
            }
          } catch (e) {
            callback(new Error('答案模板格式不正确'));
          }
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
}

// 显示手动创建对话框
const showCreateDialog = () => {
  isAutoGenerate.value = false
  createDialogVisible.value = true
  // 重置表单
  if (createForm.value) {
    createForm.value.resetFields()
  }
}

// 自动出题相关状态
const autoGenerateDialogVisible = ref(false)
const autoGenerateFormRef = ref(null)  // 改名为 autoGenerateFormRef
const generating = ref(false)

// 自动出题表单数据
const autoGenerateFormData = ref({  // 改名为 autoGenerateFormData
  knowledge_point_ids: [],
  question_types: [],
  quantity: 1,
  difficulty: 3
})

// 自动出题表单验证规则
const autoGenerateRules = {
  knowledge_point_ids: [
    { required: true, message: '请选择至少一个知识点', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少选择一个知识点', trigger: 'change' }
  ],
  question_types: [
    { required: true, message: '请选择至少一种题目类型', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少选择一种题目类型', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入生成数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 50, message: '数量必须在1-50之间', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度等级', trigger: 'change' },
    { type: 'number', min: 1, max: 5, message: '难度等级必须在1-5之间', trigger: 'change' }
  ]
}

// 显示自动出题对话框
const showAutoCreateDialog = () => {
  autoGenerateDialogVisible.value = true
  // 重置表单
  if (autoGenerateFormRef.value) {
    autoGenerateFormRef.value.resetFields()
  }
}

// 创建练习题
const handleCreateExercise = async () => {
  if (!createForm.value) return
  
  try {
    await createForm.value.validate()
    
    creating.value = true

    // 如果是自动出题模式，则先调用AI生成题目接口
    if (isAutoGenerate.value) {
      const generateResponse = await generateQuestions({
        query: exerciseForm.value.content || exerciseForm.value.title,
        knowledge_point_ids: [exerciseForm.value.knowledge_point],
        question_types: [exerciseForm.value.type],
        quantity: 1,
        difficulty: exerciseForm.value.difficulty
      })

      if (!generateResponse.success) {
        ElMessage.error(generateResponse.message || 'AI生成题目失败')
        return
      }

      // 使用AI生成的题目内容更新表单
      const generatedQuestion = generateResponse.data.questions[0]
      if (generatedQuestion) {
        exerciseForm.value.title = generatedQuestion.title || exerciseForm.value.title
        exerciseForm.value.content = generatedQuestion.content || exerciseForm.value.content
        if (Array.isArray(generatedQuestion.answer_template)) {
          exerciseForm.value.answer_template = JSON.stringify(generatedQuestion.answer_template)
        } else {
          exerciseForm.value.answer_template = generatedQuestion.answer_template || exerciseForm.value.answer_template
        }
      }
    }
    
    // 创建练习题前确保所有数据格式正确
    const exerciseData = {
      title: exerciseForm.value.title,
      content: exerciseForm.value.content,
      type: exerciseForm.value.type,
      difficulty: Number(exerciseForm.value.difficulty),
      knowledge_point: Number(exerciseForm.value.knowledge_point),
      answer_template: exerciseForm.value.type === 'single_choice'
        ? Array.isArray(exerciseForm.value.answer_template) 
          ? JSON.stringify(exerciseForm.value.answer_template)
          : exerciseForm.value.answer_template // 如果已经是字符串则保持原样
        : exerciseForm.value.answer_template // 简答题直接使用字符串
    }
    
    console.log('准备发送的练习题数据:', exerciseData)
    
    // 创建练习题
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/exercises/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(exerciseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('服务器错误详情:', errorData);
        throw new Error(errorData.message || '创建练习题失败');
      }

      const data = await response.json();
      console.log('创建练习题响应:', data)
      
      if (data.success && data.status_code === 201) { // 修改这里，检查正确的状态码
        ElMessage.success('创建练习题成功')
        createDialogVisible.value = false
        // 重新加载练习题列表
        loadExercises()
      } else {
        throw new Error(data.message || '创建练习题失败')
      }
    } catch (error) {
      console.error('创建练习题失败:', error)
      ElMessage.error(error.message || '创建练习题失败，请检查表单内容')
    } finally {
      creating.value = false
    }
  } catch (error) {
    console.error('创建练习题失败:', error)
    ElMessage.error('创建练习题失败，请检查表单内容')
  } finally {
    creating.value = false
  }
}

// 处理自动生成题目
const handleAutoGenerate = async () => {
  if (!autoGenerateFormRef.value) return
  
  try {
    await autoGenerateFormRef.value.validate()
    generating.value = true

    const response = await generateQuestions({
      knowledge_point_ids: autoGenerateFormData.value.knowledge_point_ids,
      question_types: autoGenerateFormData.value.question_types,
      quantity: autoGenerateFormData.value.quantity,
      difficulty: autoGenerateFormData.value.difficulty
    })

    if (response.success && response.status_code === 200) {
      const { questions, session_id, sources } = response.data
      
      // 保存session_id以供后续使用
      localStorage.setItem('last_question_session_id', session_id)
      
      // 显示成功信息
      let successMessage = `成功生成 ${questions.length} 道题目`
      if (sources && sources.length > 0 && sources[0].title !== '无') {
        successMessage += `\n参考资料：${sources.map(s => s.title).join(', ')}`
      }
      ElMessage({
        type: 'success',
        message: successMessage,
        duration: 5000
      })

      // 关闭对话框
      autoGenerateDialogVisible.value = false
      
      // 重新加载练习题列表
      loadExercises()
    } else {
      ElMessage.error(response.message || 'AI生成题目失败')
    }
  } catch (error) {
    console.error('生成题目失败:', error)
    ElMessage.error('生成题目失败，请检查表单内容')
  } finally {
    generating.value = false
  }
}

// 添加展开/折叠状态管理
const expandedExerciseId = ref(null)

// 切换练习题展开/折叠状态
const toggleExercise = (exerciseId) => {
  expandedExerciseId.value = expandedExerciseId.value === exerciseId ? null : exerciseId
}

// 获取题目类型标签样式
const getExerciseTagType = (type) => {
  const types = {
    'single_choice': 'primary',
    'short_answer': 'success'
  }
  return types[type] || 'info'
}

// 获取题目类型名称
const getExerciseTypeName = (type) => {
  const types = {
    'single_choice': '单选题',
    'short_answer': '简答题'
  }
  return types[type] || '未知类型'
}

// 组件挂载时加载数据
onMounted(() => {
  restorePreviousState() // 先恢复状态
  Promise.all([
    loadExercises(),
    loadKnowledgePoints(),
    loadCourses()
  ]).catch(error => {
    console.error('初始化数据加载失败:', error)
  })
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
  background: rgba(255, 255, 255, 0.01);
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
  max-width: 1200px;
  padding: 30px;
  margin: 0 auto;
}

.action-bar {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.filter-section {
  background: rgba(255, 255, 255, 0.85);
  padding: 24px 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.filter-item {
  flex: 1;
  min-width: 220px;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.exercise-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
}

.exercise-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(238, 238, 238, 0.5);
  background: rgba(255, 255, 255, 0.5);
}

.exercise-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.3px;
}

.exercise-content {
  padding: 24px;
  color: #3a4a5c;
  line-height: 1.8;
  font-size: 15px;
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
  border: 1px solid #eef2f7;
  display: flex;
  align-items: center;
}

.option-item:hover {
  background: #f0f7ff;
  border-color: #409EFF;
  transform: translateX(4px);
}

.option-label {
  font-weight: 600;
  color: #409EFF;
  margin-right: 16px;
  min-width: 24px;
  text-align: center;
}

.exercise-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(238, 238, 238, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
}

.knowledge-point {
  color: #409EFF;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-container {
  margin-top: 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-pagination) {
  --el-pagination-button-bg-color: rgba(255, 255, 255, 0.9);
  --el-pagination-hover-color: #409EFF;
}

.knowledge-point-option {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.knowledge-point-desc {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e6f0;
  background: rgba(255, 255, 255, 0.95);
}

:deep(.el-dialog__body) {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e0e6f0;
  background: rgba(255, 255, 255, 0.95);
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e0e6f0;
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  border-color: #409EFF;
}

:deep(.el-select) {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式优化 */
@media screen and (max-width: 1366px) {
  .exercises-container {
    max-width: 1000px;
    padding: 20px;
  }
  
  .filter-item {
    min-width: 180px;
  }
}

@media screen and (max-width: 1024px) {
  .exercises-container {
    max-width: 800px;
    padding: 16px;
  }
  
  .filter-item {
    min-width: 160px;
  }
}

/* 添加自动出题对话框的样式 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-rate) {
  margin-top: 8px;
}
</style> 