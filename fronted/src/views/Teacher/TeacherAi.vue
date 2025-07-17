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
        <div class="knowledge-points-container">
          <h2>选择知识点</h2>
          
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
            
            <el-select
              v-model="selectedCourse"
              placeholder="选择课程"
              @change="handleCourseChange"
              class="course-select"
              :loading="coursesLoading"
            >
              <el-option
                v-for="course in coursesList"
                :key="course.id"
                :label="course.title"
                :value="course.id"
              />
            </el-select>
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
                prop="course_name"
                label="所属课程"
                width="150"
              >
                <template #header>
                  <div class="header-content">
                    <span>所属课程</span>
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
import { ref, onMounted, computed } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import { generateKnowledgePointsPPT, getKnowledgePoints } from '@/api'  // 移除handleRequest导入
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const sideTab = ref('lesson-prep')
const courseMenuOpen = ref(false)
const courses = ref([])
const isGeneratingPPT = ref(false)
const loading = ref(false)

// 知识点列表相关
const knowledgePoints = ref([])
const selectedPoints = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const selectedCourse = ref('')

// 加载课程列表
const coursesList = ref([])
const coursesLoading = ref(false)

// 添加课程ID到课程名称的映射
const courseNameMap = computed(() => {
  const map = {}
  coursesList.value.forEach(course => {
    map[course.id] = course.title
  })
  return map
})

// 修改加载知识点列表函数
const loadKnowledgePoints = async () => {
  loading.value = true
  try {
    const response = await getKnowledgePoints({
      page: currentPage.value,
        page_size: pageSize.value,
        search: searchQuery.value,
      course: selectedCourse.value,
      ordering: 'title'
    })
    
    console.log('知识点响应:', response)
    
    // 检查两种可能的成功响应格式
    const isSuccess = (response.success && response.status_code === 200) || 
                     (response.code === 0 && response.msg);
                     
    if (isSuccess) {
      const responseData = response.data;
      
      if (responseData && Array.isArray(responseData.results)) {
        // 更新数据，添加课程名称
        knowledgePoints.value = responseData.results.map(point => ({
            ...point,
          course_name: courseNameMap.value[point.course] || '未知课程'
        }));
          // 更新总数
        total.value = responseData.count;
        
        console.log('知识点加载完成，总数：', total.value);
        console.log('当前页数据：', knowledgePoints.value);
      } else {
        console.error('知识点数据格式不正确:', responseData);
        ElMessage.error('知识点数据格式不正确');
      }
    } else {
      const errorMsg = response.message || response.msg || '获取知识点列表失败';
      ElMessage.error(errorMsg);
    }
  } catch (error) {
    console.error('加载知识点失败:', error);
    ElMessage.error('加载知识点失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadKnowledgePoints()
}

// 处理课程选择
const handleCourseChange = () => {
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
    title: "知识点PPT",
    include_course_info: true,
    use_ai: false,
    return_file_content: false,
    direct_download: true,
    course_id: localStorage.getItem('currentCourseId') || null
  }

  try {
    isGeneratingPPT.value = true
    const response = await generateKnowledgePointsPPT(params)
    console.log('PPT生成响应:', response)
    
    if (response.status === 'success') {
      if (response.data?.file_content) {
        // 如果是直接下载模式，直接使用返回的blob
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
        // 如果返回的是URL，使用handleRequest下载文件
        const fileUrl = response.data.file_url.replace(/^\/api/, '')  // 移除开头的/api（如果存在）
        console.log('下载文件URL:', fileUrl)
        
        try {
          // 使用handleRequest获取文件内容
          const fileResponse = await fetch(fileUrl, {
            method: 'GET',
            headers: {
              'Authorization': localStorage.getItem('token') || ''
            },
            responseType: 'blob'  // 指定响应类型为blob
          })
          
          if (fileResponse.ok) {
          const blob = await fileResponse.blob()
          // 创建下载链接
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = response.data.filename || '知识点PPT.pptx'
          document.body.appendChild(link)
          link.click()
          
          // 清理
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
    const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://990dad7dbad9.ngrok-free.app'
    const response = await fetch(`${API_BASE_URL}/api/courses/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    })
    
    const data = await response.json()
    console.log('课程列表响应:', data)
    
    if (response.ok) {
      let courseList = []
      if (data.success && data.status_code === 200 && data.data) {
        // 处理分页格式
        if (Array.isArray(data.data.results)) {
          courseList = data.data.results
        } 
        // 处理直接数组格式
        else if (Array.isArray(data.data)) {
          courseList = data.data
        }
      } else if (data.code === 0 && data.data) {
        // 处理新的API格式
        if (Array.isArray(data.data.results)) {
          courseList = data.data.results
        } else if (Array.isArray(data.data)) {
          courseList = data.data
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
        // 重新加载知识点列表以更新课程名称
        loadKnowledgePoints()
      } else {
        console.warn('课程列表为空')
        ElMessage.warning('暂无可用课程')
      }
    } else {
      throw new Error(data.message || data.msg || '获取课程列表失败')
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
  await Promise.all([
    loadKnowledgePoints(),
  loadCourses()
  ]).catch(error => {
    console.error('初始化数据加载失败:', error)
    ElMessage.error('加载数据失败，请刷新页面重试')
  })
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

.knowledge-points-container {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(99, 147, 244, 0.08), 0 0 0 2px rgba(99, 147, 244, 0.12);
  padding: 20px 24px 24px 24px;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
  margin-top: 40px;
}

.knowledge-points-container h2 {
  margin: 0 0 24px;
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
  gap: 16px;
}

.search-input {
  width: 400px !important;
  margin: 0 20px 0 30px !important;
}

.course-select {
  width: 240px;
}

.knowledge-points-list {
  background-color: white;
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(99, 147, 244, 0.15);
  box-shadow: 0 2px 12px rgba(99, 147, 244, 0.08);
}

.knowledge-points-list .el-table {
  border-radius: 8px;
  overflow: hidden;
}

.knowledge-points-list .el-table th {
  background-color: #f5f7ff;
  color: #333;
  font-weight: bold;
}

.knowledge-points-list .el-table td {
  color: #555;
}

.knowledge-points-list .el-table .el-button {
  border-radius: 6px;
  padding: 8px 12px;
}
.knowledge-points-list .el-table .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}
.knowledge-points-list .el-table .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
.knowledge-points-list .el-table .el-button--danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
}
.knowledge-points-list .el-table .el-button--danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}
.knowledge-points-list .el-table .el-button--info {
  background-color: #909399;
  border-color: #909399;
}
.knowledge-points-list .el-table .el-button--info:hover {
  background-color: #a6a9ad;
  border-color: #a6a9ad;
}
.knowledge-points-list .el-table .el-button--success {
  background-color: #67c23a;
  border-color: #67c23a;
}
.knowledge-points-list .el-table .el-button--success:hover {
  background-color: #85ce61;
  border-color: #85ce61;
}
.knowledge-points-list .el-table .el-button--warning {
  background-color: #e6a23c;
  border-color: #e6a23c;
}
.knowledge-points-list .el-table .el-button--warning:hover {
  background-color: #eebe77;
  border-color: #eebe77;
}
.knowledge-points-list .el-table .el-button--text {
  color: #606266;
}
.knowledge-points-list .el-table .el-button--text:hover {
  color: #409eff;
}

/* 只保留一次表头蓝色样式 */
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