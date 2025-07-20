<template>
  <div class="teacher-layout">
    <TeacherHeader />
    <div class="main-container">
      <TeacherSidebar 
        :sideTab="sideTab"
        :courseMenuOpen="courseMenuOpen"
        :courses="courses"
        @update:sideTab="updateSideTab"
        @update:courseMenuOpen="updateCourseMenuOpen"
      />
      <div class="content-area">
        <!-- 课程卡片视图 -->
        <div v-if="!selectedCourse" class="courses-container">
          <div class="courses-grid">
            <el-card 
              v-for="course in coursesList" 
              :key="course.id"
              class="course-card" 
              shadow="hover"
              @click="selectCourse(course)"
            >
              <div class="course-header">
                <img 
                  :src="getCourseImage()"
                  :alt="course.title"
                  class="course-image"
                  loading="lazy"
                  @error="handleImageError"
                />
              </div>
              <div class="course-info">
                <h3 class="course-title">{{ course.title }}</h3>
                <span class="teacher">{{ course.teacher_name || '未知教师' }}</span>
                <el-button type="primary" @click.stop="selectCourse(course)">备课</el-button>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 知识点列表视图 -->
        <div v-else class="knowledge-points-container">
          <div class="header-section">
            <el-button icon="ArrowLeft" @click="backToCourses">返回课程列表</el-button>
            <h2>{{ selectedCourse.title }} - 知识点</h2>
  
          </div>
          
          <!-- 搜索和筛选区域 -->
          <div class="filter-section">
            <el-input
              v-model="searchQuery"
              placeholder="搜索知识点"
              @input="handleSearch"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-button
              type="primary"
              :loading="isGeneratingPPT"
              @click="handleGeneratePPT(selectedPoints)"
              :disabled="selectedPoints.length === 0"
              style="margin-left: 24px; min-width: 110px;"
            >
              生成PPT
            </el-button>
          </div>

          <!-- 知识点列表 -->
          <div class="knowledge-points-list" v-loading="loading">
            <el-table
              :data="knowledgePoints"
              style="width: 100%"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                type="selection"
                width="55"
              />
              <el-table-column
                prop="title"
                label="知识点名称"
                min-width="180"
              >
                <template #default="{ row }">
                  <div class="knowledge-title">
                    <span>{{ row.title }}</span>
                    <el-tag v-if="row.parent_title" size="small" type="info" class="parent-tag">
                      父节点: {{ row.parent_title }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="content"
                label="描述"
                show-overflow-tooltip
                min-width="300"
              >
                <template #default="{ row }">
                  <div class="content-preview">{{ row.content }}</div>
                </template>
              </el-table-column>
              <el-table-column
                prop="importance"
                label="重要程度"
                width="120"
              >
                <template #default="{ row }">
                  <el-rate
                    v-model="row.importance"
                    :max="10"
                    disabled
                    show-score
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="子知识点"
                width="120"
              >
                <template #default="{ row }">
                  <span v-if="row.children && row.children.length">
                    {{ row.children.length }} 个
                  </span>
                  <span v-else>无</span>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页器 -->
            <div class="pagination">
              <el-pagination
                :current-page="currentPage"
                :page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                @update:current-page="currentPage = $event"
                @update:page-size="pageSize = $event"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加练习题对话框 -->
    <el-dialog
      v-model="showExerciseDialog"
      title="创建练习题"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="exerciseFormRef"
        :model="exerciseForm"
        :rules="exerciseRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="exerciseForm.title" placeholder="请输入题目标题"></el-input>
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="exerciseForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入题目内容"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="题目类型" prop="type">
          <el-select v-model="exerciseForm.type" placeholder="请选择题目类型">
            <el-option
              v-for="value in Object.values(EXERCISE_TYPES)"
              :key="value"
              :label="EXERCISE_TYPE_LABELS[value]"
              :value="value"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="难度等级" prop="difficulty">
          <el-rate
            v-model="exerciseForm.difficulty"
            :max="5"
            :texts="['简单', '较简单', '中等', '较难', '困难']"
            show-text
          ></el-rate>
        </el-form-item>
        
        <el-form-item label="关联知识点" prop="knowledge_point">
          <el-select 
            v-model="exerciseForm.knowledge_point"
            placeholder="请选择关联知识点"
            filterable
          >
            <el-option
              v-for="point in knowledgePoints"
              :key="point.id"
              :label="point.title"
              :value="point.id"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="答案模板" prop="answer_template">
          <el-input
            v-model="exerciseForm.answer_template"
            type="textarea"
            :rows="3"
            placeholder="请输入答案模板（选填）"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showExerciseDialog = false">取消</el-button>
          <el-button type="primary" @click="submitExercise" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import { generateKnowledgePointsPPT, handleRequest, API_CONFIG, getMyCourses } from '@/api'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import tensorImg from '@/assets/tensor.png'

const sideTab = ref('lesson-prep')
const courseMenuOpen = ref(false)
const courses = ref([])
const isGeneratingPPT = ref(false)
const loading = ref(false)
const selectedCourse = ref(null)

// 课程图片相关
const defaultImage = tensorImg

const getCourseImage = () => {
  return defaultImage
}

const handleImageError = (e) => {
  e.target.src = defaultImage
}

// 知识点列表相关
const knowledgePoints = ref([])
const selectedPoints = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')

// 课程列表相关
const coursesList = ref([])
const coursesLoading = ref(false)

// 返回课程列表
const backToCourses = () => {
  selectedCourse.value = null
  searchQuery.value = ''
  selectedPoints.value = []
}

// 选择课程
const selectCourse = (course) => {
  selectedCourse.value = course
  // 重置知识点相关状态
  currentPage.value = 1
  searchQuery.value = ''
  selectedPoints.value = []
  // 加载该课程的知识点
  loadKnowledgePoints()
}

// 修改加载知识点列表函数
const loadKnowledgePoints = async () => {
  if (!selectedCourse.value) return
  
  loading.value = true
  try {
    // 检查认证令牌
    const token = localStorage.getItem('token')  // 修改这里：使用正确的token key
    if (!token) {
      ElMessage.error('未登录或登录已过期，请重新登录')
      return
    }

    // 构建查询参数
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      page_size: pageSize.value.toString(),
      ordering: 'title'
    })

    // 添加搜索条件
    if (searchQuery.value.trim()) {
      params.append('search', searchQuery.value.trim())
    }

    // 添加课程筛选
    params.append('course', selectedCourse.value.id.toString())

    const response = await fetch(`${API_CONFIG.BASE_URL}/knowledge-points/?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        ElMessage.error('登录已过期，请重新登录')
        return
      }
      throw new Error(`获取知识点列表失败: ${response.status}`)
    }

    const data = await response.json()
    console.log('知识点响应:', data)
    
    if (data.success && data.status_code === 200) {  // 修改这里：检查正确的响应格式
      if (data.data && Array.isArray(data.data.results)) {
        knowledgePoints.value = data.data.results
        total.value = data.data.count || 0
        
        console.log('当前课程知识点加载完成，总数：', total.value)
        console.log('当前页数据：', knowledgePoints.value)
      } else {
        console.error('知识点数据格式不正确:', data)
        ElMessage.error('知识点数据格式不正确')
      }
    } else {
      throw new Error(data.message || '获取知识点列表失败')
    }
  } catch (error) {
    console.error('加载知识点失败:', error)
    ElMessage.error(error.message || '加载知识点失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadKnowledgePoints()
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  loadKnowledgePoints()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  loadKnowledgePoints()
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedPoints.value = selection
}

// 处理生成PPT的请求
const handleGeneratePPT = async (knowledgePoints) => {
  if (isGeneratingPPT.value) {
    ElMessage.warning('正在生成PPT，请稍候...')
    return
  }

  if (!knowledgePoints || knowledgePoints.length === 0) {
    ElMessage.warning('请先选择要生成PPT的知识点')
    return
  }

  const params = {
    knowledge_point_ids: knowledgePoints.map(point => point.id),
    include_children: true,
    max_depth: 3,
    format: "pptx",
    theme: "hierarchy-default",
    visual_style: "default",
    color_scheme: "blue",
    show_relations: true,
    title: selectedCourse.value ? selectedCourse.value.title : "知识点PPT",
    include_course_info: true,
    use_ai: false,
    return_file_content: false,
    direct_download: true,
    course_id: selectedCourse.value ? selectedCourse.value.id : null
  }

  try {
    isGeneratingPPT.value = true
    const response = await generateKnowledgePointsPPT(params)
    console.log('PPT生成响应:', response)
    
    if (response.status === 'success') {
      if (response.data?.file_content) {
        const blob = response.data.file_content
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = response.data.filename || '知识点PPT.pptx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        ElMessage.success('PPT下载成功！')
      } else if (response.data?.file_url) {
        const fileUrl = response.data.file_url.replace(/^\/api/, '')
        console.log('下载文件URL:', fileUrl)
        
        try {
          const fileResponse = await fetch(fileUrl, {
            method: 'GET',
            headers: {
              'Authorization': localStorage.getItem('token') || ''
            },
            responseType: 'blob'
          })
          
          if (fileResponse.ok) {
          const blob = await fileResponse.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = response.data.filename || '知识点PPT.pptx'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          ElMessage.success('PPT下载成功！')
          } else {
            throw new Error('文件下载响应格式不正确')
          }
        } catch (downloadError) {
          console.error('下载文件失败:', downloadError)
          ElMessage.error('下载文件失败，请稍后重试')
        }
      } else {
        ElMessage.error('生成的PPT数据格式不正确')
      }
    } else {
      ElMessage.error(response.error || '生成PPT失败')
    }
  } catch (error) {
    console.error('生成PPT失败:', error)
    ElMessage.error('生成PPT失败，请稍后重试')
  } finally {
    isGeneratingPPT.value = false
  }
}

// 修改练习题类型常量
const EXERCISE_TYPES = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  FILL_BLANK: 'fill_blank',
  SHORT_ANSWER: 'short_answer',
  CODING: 'coding',
  OTHER: 'other'
}

// 添加题型显示名称映射
const EXERCISE_TYPE_LABELS = {
  [EXERCISE_TYPES.SINGLE_CHOICE]: '单选题',
  [EXERCISE_TYPES.MULTIPLE_CHOICE]: '多选题',
  [EXERCISE_TYPES.FILL_BLANK]: '填空题',
  [EXERCISE_TYPES.SHORT_ANSWER]: '简答题',
  [EXERCISE_TYPES.CODING]: '编程题',
  [EXERCISE_TYPES.OTHER]: '其他'
}

// 添加练习题创建方法
const createExercise = async (exerciseData) => {
  try {
    // 数据验证
    if (!exerciseData.title || exerciseData.title.length > 200) {
      throw new Error('标题长度必须在1-200字符之间')
    }
    if (!exerciseData.content) {
      throw new Error('题目内容不能为空')
    }
    if (!Object.values(EXERCISE_TYPES).includes(exerciseData.type)) {
      throw new Error('无效的题目类型')
    }
    if (!exerciseData.knowledge_point) {
      throw new Error('请选择关联的知识点')
    }
    if (![1, 2, 3, 4, 5].includes(exerciseData.difficulty)) {
      throw new Error('难度等级必须在1-5之间')
    }

    // 构造请求体
    const requestBody = {
      data: {
        title: exerciseData.title.trim(),
        content: exerciseData.content.trim(),
        type: exerciseData.type,
        difficulty: exerciseData.difficulty,
        knowledge_point: exerciseData.knowledge_point,
        answer_template: exerciseData.answer_template || ''
      }
    }

    console.log('准备发送的练习题数据:', requestBody)

    const response = await handleRequest('exercises/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('teacherToken')}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(requestBody)
    })

    if (response.success && response.status_code === 200) {
      ElMessage.success('创建练习题成功')
      return response.data
    } else {
      throw new Error(response.message || '创建练习题失败')
    }
  } catch (error) {
    console.error('创建练习题失败:', error)
    ElMessage.error(error.message || '创建练习题失败，请稍后重试')
    throw error
  }
}

// 添加练习题表单数据
const exerciseForm = ref({
  title: '',
  content: '',
  type: '',
  difficulty: 1,
  knowledge_point: null,
  answer_template: ''
})

// 添加练习题表单验证规则
const exerciseRules = {
  title: [
    { required: true, message: '请输入题目标题', trigger: 'blur' },
    { max: 200, message: '标题长度不能超过200字符', trigger: 'blur' }
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
    { required: true, message: '请选择关联知识点', trigger: 'change' }
  ]
}

// 添加提交练习题方法
const submitExercise = async () => {
  if (!exerciseFormRef.value) return
  
  try {
    await exerciseFormRef.value.validate()
    submitting.value = true
    await createExercise(exerciseForm.value)
    // 重置表单
    exerciseForm.value = {
      title: '',
      content: '',
      type: '',
      difficulty: 1,
      knowledge_point: null,
      answer_template: ''
    }
    showExerciseDialog.value = false
    // 关闭对话框或进行其他操作
  } catch (error) {
    console.error('提交练习题失败:', error)
  } finally {
    submitting.value = false
  }
}

// 修改课程列表加载函数
const loadCourses = async () => {
  coursesLoading.value = true
  try {
    const response = await getMyCourses()
    
    console.log('课程列表响应:', response)
    
    if (response.success && response.status_code === 200) {
      let courseList = []
      if (response.data && response.data.results) {
        courseList = response.data.results
      }

      if (courseList.length > 0) {
        coursesList.value = courseList.map(course => ({
          id: course.id,
          title: course.title || course.name,
          description: course.description,
          subject: course.subject,
          grade_level: course.grade_level,
          teacher_name: course.teacher_name,
          knowledge_points_count: course.knowledge_points_count || 0
        }))
        console.log('课程列表加载成功:', coursesList.value)
      } else {
        console.warn('课程列表为空')
        ElMessage.warning('暂无可用课程')
      }
    } else {
      throw new Error(response.message || '获取课程列表失败')
    }
  } catch (error) {
    console.error('加载课程失败:', error)
    ElMessage.error(error.message || '加载课程列表失败，请稍后重试')
  } finally {
    coursesLoading.value = false
  }
}

// 更新侧边栏状态
const updateSideTab = (value) => {
  sideTab.value = value
}

const updateCourseMenuOpen = (value) => {
  courseMenuOpen.value = value
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadCourses()
})

const showExerciseDialog = ref(false)
const submitting = ref(false)

// 添加表单引用
const exerciseFormRef = ref(null)
</script>

<style scoped>
.teacher-layout {
  min-height: 100vh;
  background: #f5f7ff;
}

.main-container {
  display: flex;
  padding-top: 64px;
}

.content-area {
  flex: 1;
  margin-left: 300px;
  min-height: calc(100vh - 64px);
  padding: 24px;
}

.courses-container {
  padding: 20px;
}

.courses-container h2 {
  margin-bottom: 24px;
  color: #333;
  font-size: 24px;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 20px;
}

.course-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.course-header {
  height: 180px;
  overflow: hidden;
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .course-image {
  transform: scale(1.05);
}

.course-info {
  padding: 16px;
  position: relative;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.teacher {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.course-card:hover .course-image {
  transform: scale(1.05);
}

.course-info {
  padding: 16px;
  position: relative;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

:deep(.el-button--primary) {
  background: #409EFF;
  border-color: #409EFF;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-button--primary:hover) {
  background: #66B1FF;
  border-color: #66B1FF;
}

.knowledge-points-container {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(99, 147, 244, 0.08);
  padding: 20px 24px;
  margin-bottom: 20px;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.header-section h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.filter-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  border: 1px solid rgba(99, 147, 244, 0.2);
  box-shadow: 0 2px 8px rgba(99, 147, 244, 0.1);
}

.search-input {
  width: 400px !important;
}

.knowledge-points-list {
  background-color: white;
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(99, 147, 244, 0.15);
}

.pagination {
  margin-top: 20px;
  padding: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table__header-wrapper) {
  background-color: #f0f7ff;
}

:deep(.el-table__header-wrapper) th.el-table__cell {
  background-color: #f0f7ff !important;
  color: #333;
  font-weight: 600;
  border-bottom: none;
  height: 50px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.knowledge-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.parent-tag {
  font-size: 12px;
  padding: 0 6px;
  height: 20px;
  line-height: 20px;
}

.content-preview {
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}
</style> 