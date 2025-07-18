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
          <h2>我的课程</h2>
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
                min-width="50"
              >
                <template #header>
                  <div class="header-content">
                    <span>知识点名称</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="importance"
                label="重要程度"
                width="100"
                :formatter="formatImportance"
              >
                <template #header>
                  <div class="header-content">
                    <span>重要程度</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="content"
                label="描述"
                show-overflow-tooltip
              >
                <template #header>
                  <div class="header-content">
                    <span>描述</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页器 -->
            <div class="pagination">
              <el-pagination
                v-model="currentPage"
                :page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import { generateKnowledgePointsPPT, getKnowledgePoints, handleRequest } from '@/api'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import pythonImg from '@/assets/python.png'

const sideTab = ref('lesson-prep')
const courseMenuOpen = ref(false)
const courses = ref([])
const isGeneratingPPT = ref(false)
const loading = ref(false)
const selectedCourse = ref(null)

// 课程图片相关
const defaultImage = pythonImg

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
    const response = await getKnowledgePoints({
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value,
      course: selectedCourse.value.id,
      ordering: 'title'
    })
    
    console.log('知识点响应:', response)
    
    if (response.success && response.status_code === 200) {
      const responseData = response.data
      
      if (responseData && Array.isArray(responseData.results)) {
        knowledgePoints.value = responseData.results
        total.value = responseData.count
        
        console.log('知识点加载完成，总数：', total.value)
        console.log('当前页数据：', knowledgePoints.value)
      } else {
        console.error('知识点数据格式不正确:', responseData)
        ElMessage.error('知识点数据格式不正确')
      }
    } else {
      const errorMsg = response.message || '获取知识点列表失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('加载知识点失败:', error)
    ElMessage.error('加载知识点失败，请稍后重试')
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

// 格式化重要程度
const formatImportance = (row) => {
  const levels = {
    1: '非常低',
    2: '低',
    3: '中等',
    4: '高',
    5: '非常高'
  }
  return levels[row.importance] || row.importance
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

// 修改加载课程数据的函数
const loadCourses = async () => {
  coursesLoading.value = true
  try {
    const response = await handleRequest('courses/', {
      method: 'GET'
    })
    
    console.log('课程列表响应:', response)
    
    if (response.success && response.status_code === 200) {
      let courseList = []
      if (response.data) {
        if (Array.isArray(response.data.results)) {
          courseList = response.data.results
        } else if (Array.isArray(response.data)) {
          courseList = response.data
        }
      }

      if (courseList.length > 0) {
        coursesList.value = courseList.map(course => ({
          id: course.id,
          title: course.name || course.title,
          description: course.description,
          subject: course.subject,
          grade_level: course.grade_level,
          teacher_name: course.teacher_name
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
</style> 