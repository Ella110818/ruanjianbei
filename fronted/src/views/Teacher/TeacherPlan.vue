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
        <!-- 课程选择区域 -->
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
                <el-button type="primary" @click.stop="selectCourse(course)">编写教案</el-button>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 教案编辑区域 -->
        <div v-else class="plan-container">
          <div class="header-section">
            <el-button icon="ArrowLeft" @click="backToCourses">返回课程列表</el-button>
            <h2>{{ selectedCourse.title }} - 教案管理</h2>
          </div>

          <!-- 教案列表 -->
          <div class="plan-list" v-loading="loading">
            <div class="toolbar">
              <el-button type="primary" @click="handleCreatePlan">新建教案</el-button>
              <el-input
                v-model="searchQuery"
                placeholder="搜索教案"
                class="search-input"
                clearable
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <el-table :data="planList" style="width: 100%">
              <el-table-column prop="title" label="教案标题" min-width="200">
                <template #default="{ row }">
                  <div class="plan-title">
                    <span>{{ row.title }}</span>
                    <el-tag size="small" :type="row.status === 'published' ? 'success' : 'info'">
                      {{ row.status === 'published' ? '已发布' : '草稿' }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="updated_at" label="最后更新" width="180" />
              <el-table-column label="操作" width="250" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                  <el-button type="success" link @click="handlePublish(row)" v-if="row.status !== 'published'">
                    发布
                  </el-button>
                  <el-button type="warning" link @click="handleUnpublish(row)" v-else>
                    取消发布
                  </el-button>
                  <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </div>

        <!-- 教案编辑对话框 -->
        <el-dialog
          v-model="dialogVisible"
          :title="editingPlan ? '编辑教案' : '新建教案'"
          width="80%"
          :close-on-click-modal="false"
          :before-close="handleDialogClose"
        >
          <el-form :model="planForm" :rules="planRules" ref="planFormRef" label-width="100px">
            <el-form-item label="教案标题" prop="title">
              <el-input v-model="planForm.title" placeholder="请输入教案标题" />
            </el-form-item>
            <el-form-item label="教学目标" prop="objectives">
              <el-input
                v-model="planForm.objectives"
                type="textarea"
                :rows="4"
                placeholder="请输入教学目标"
              />
            </el-form-item>
            <el-form-item label="教学重点" prop="keyPoints">
              <el-input
                v-model="planForm.keyPoints"
                type="textarea"
                :rows="4"
                placeholder="请输入教学重点"
              />
            </el-form-item>
            <el-form-item label="教学难点" prop="difficulties">
              <el-input
                v-model="planForm.difficulties"
                type="textarea"
                :rows="4"
                placeholder="请输入教学难点"
              />
            </el-form-item>
            <el-form-item label="教学内容" prop="content">
              <el-input
                v-model="planForm.content"
                type="textarea"
                :rows="8"
                placeholder="请输入教学内容"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleSavePlan" :loading="saving">
                保存
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { handleRequest, API_CONFIG } from '@/api'
import pythonImg from '@/assets/python.png'

// 状态变量
const sideTab = ref('teaching-plan')
const courseMenuOpen = ref(false)
const courses = ref([])
const loading = ref(false)
const selectedCourse = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const saving = ref(false)
const editingPlan = ref(null)

// 课程列表
const coursesList = ref([])
const coursesLoading = ref(false)

// 教案列表
const planList = ref([])

// 教案表单
const planFormRef = ref(null)
const planForm = ref({
  title: '',
  objectives: '',
  keyPoints: '',
  difficulties: '',
  content: ''
})

// 表单验证规则
const planRules = {
  title: [
    { required: true, message: '请输入教案标题', trigger: 'blur' },
    { max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
  ],
  objectives: [
    { required: true, message: '请输入教学目标', trigger: 'blur' }
  ],
  keyPoints: [
    { required: true, message: '请输入教学重点', trigger: 'blur' }
  ],
  difficulties: [
    { required: true, message: '请输入教学难点', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入教学内容', trigger: 'blur' }
  ]
}

// 课程图片相关
const defaultImage = pythonImg
const getCourseImage = () => defaultImage
const handleImageError = (e) => {
  e.target.src = defaultImage
}

// 返回课程列表
const backToCourses = () => {
  selectedCourse.value = null
  searchQuery.value = ''
}

// 选择课程
const selectCourse = (course) => {
  selectedCourse.value = course
  currentPage.value = 1
  searchQuery.value = ''
  fetchPlanList()
}

// 加载课程列表
const loadCourses = async () => {
  coursesLoading.value = true
  try {
    const response = await handleRequest('courses/', {
      method: 'GET'
    })
    
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
      } else {
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

// 获取教案列表
const fetchPlanList = async () => {
  if (!selectedCourse.value) return
  
  loading.value = true
  try {
    const params = new URLSearchParams({
      course: selectedCourse.value.id.toString(),
      page: currentPage.value.toString(),
      page_size: pageSize.value.toString()
    })

    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }

    const response = await handleRequest(`teaching-plans/?${params.toString()}`)
    
    if (response.success && response.status_code === 200) {
      planList.value = response.data.results
      total.value = response.data.count
    } else {
      throw new Error(response.message || '获取教案列表失败')
    }
  } catch (error) {
    console.error('获取教案列表失败:', error)
    ElMessage.error(error.message || '获取教案列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchPlanList()
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchPlanList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchPlanList()
}

// 新建教案
const handleCreatePlan = () => {
  editingPlan.value = null
  planForm.value = {
    title: '',
    objectives: '',
    keyPoints: '',
    difficulties: '',
    content: ''
  }
  dialogVisible.value = true
}

// 编辑教案
const handleEdit = (plan) => {
  editingPlan.value = plan
  planForm.value = { ...plan }
  dialogVisible.value = true
}

// 保存教案
const handleSavePlan = async () => {
  if (!planFormRef.value) return
  
  try {
    await planFormRef.value.validate()
    saving.value = true

    const data = {
      ...planForm.value,
      course: selectedCourse.value.id
    }

    const method = editingPlan.value ? 'PUT' : 'POST'
    const url = editingPlan.value 
      ? `teaching-plans/${editingPlan.value.id}/`
      : 'teaching-plans/'

    const response = await handleRequest(url, {
      method,
      body: JSON.stringify(data)
    })

    if (response.success) {
      ElMessage.success(editingPlan.value ? '教案更新成功' : '教案创建成功')
      dialogVisible.value = false
      fetchPlanList()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('保存教案失败:', error)
    ElMessage.error(error.message || '保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 发布教案
const handlePublish = async (plan) => {
  try {
    const response = await handleRequest(`teaching-plans/${plan.id}/publish/`, {
      method: 'POST'
    })

    if (response.success) {
      ElMessage.success('教案发布成功')
      fetchPlanList()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('发布教案失败:', error)
    ElMessage.error(error.message || '发布失败，请稍后重试')
  }
}

// 取消发布教案
const handleUnpublish = async (plan) => {
  try {
    const response = await handleRequest(`teaching-plans/${plan.id}/unpublish/`, {
      method: 'POST'
    })

    if (response.success) {
      ElMessage.success('已取消发布')
      fetchPlanList()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('取消发布失败:', error)
    ElMessage.error(error.message || '操作失败，请稍后重试')
  }
}

// 删除教案
const handleDelete = async (plan) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除教案"${plan.title}"吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await handleRequest(`teaching-plans/${plan.id}/`, {
      method: 'DELETE'
    })

    if (response.success) {
      ElMessage.success('教案删除成功')
      fetchPlanList()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除教案失败:', error)
      ElMessage.error(error.message || '删除失败，请稍后重试')
    }
  }
}

// 关闭对话框前确认
const handleDialogClose = (done) => {
  if (saving.value) return
  done()
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

.plan-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.header-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.header-section h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.plan-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-dialog__body) {
  padding: 20px 30px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 