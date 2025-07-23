<template>
  <div class="teacher-layout">
    <TeacherHeader />
    <div class="main-container">
      <TeacherClassSidebar v-model:sideTab="sideTab" />
      <div class="content-area">
        <!-- 课程卡片视图 -->
        <div class="courses-container">
          <div class="courses-grid">
            <el-card 
              v-for="course in coursesList" 
              :key="course.id"
              class="course-card" 
              shadow="hover"
              @click="startClass(course)"
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
               
                <div class="course-actions">
                  <el-button type="primary" @click.stop="startClass(course)">开始上课</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>

    <!-- 开始上课对话框 -->
    <el-dialog
      v-model="startClassDialogVisible"
      title="开始上课"
      width="500px"
      destroy-on-close
    >
      <div v-if="selectedCourse" class="start-class-form">
        <h3>{{ selectedCourse.title }}</h3>
        <el-form
          ref="classFormRef"
          :model="classForm"
          :rules="classRules"
          label-width="100px"
        >
          <el-form-item label="课堂主题" prop="title">
            <el-input v-model="classForm.title" placeholder="请输入本节课主题"></el-input>
          </el-form-item>
          
          <el-form-item label="课堂类型" prop="type">
            <el-select v-model="classForm.type" placeholder="请选择课堂类型">
              <el-option label="理论课" value="theory"></el-option>
              <el-option label="实践课" value="practice"></el-option>
              <el-option label="复习课" value="review"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="预计时长" prop="duration">
            <el-input-number 
              v-model="classForm.duration" 
              :min="1" 
              :max="240"
              placeholder="请输入预计课时（分钟）">
            </el-input-number>
          </el-form-item>
          
          <el-form-item label="课堂说明" prop="description">
            <el-input
              v-model="classForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入本节课说明（选填）">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="startClassDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmStartClass" :loading="starting">
            开始上课
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherClassSidebar from '@/components/TeacherClassSidebar.vue'
import { getMyCourses, API_CONFIG } from '@/api'
import { ElMessage } from 'element-plus'
import tensorImg from '@/assets/tensor.png'

const router = useRouter()
const sideTab = ref('start-class')
const coursesList = ref([])
const coursesLoading = ref(false)
const startClassDialogVisible = ref(false)
const selectedCourse = ref(null)
const starting = ref(false)

// 课程图片相关
const defaultImage = tensorImg

const getCourseImage = () => {
  return defaultImage
}

const handleImageError = (e) => {
  e.target.src = defaultImage
}

// 表单相关
const classFormRef = ref(null)
const classForm = ref({
  title: '',
  type: '',
  duration: 45,
  description: ''
})

const classRules = {
  title: [
    { required: true, message: '请输入课堂主题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择课堂类型', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请输入预计时长', trigger: 'blur' },
    { type: 'number', min: 1, max: 240, message: '时长在 1 到 240 分钟之间', trigger: 'change' }
  ]
}

// 开始上课
const startClass = (course) => {
  selectedCourse.value = course
  startClassDialogVisible.value = true
  // 设置默认标题
  classForm.value.title = `${course.title} - 第1课时`
}

// 确认开始上课
const confirmStartClass = async () => {
  if (!classFormRef.value) return
  
  try {
    await classFormRef.value.validate()
    starting.value = true
    
    // 使用query参数进行跳转
    router.push({
      path: '/teacher/live-class',
      query: {
        courseId: selectedCourse.value.id,
        title: selectedCourse.value.title,
        classTitle: classForm.value.title,
        classType: classForm.value.type,
        duration: classForm.value.duration,
        description: classForm.value.description
      }
    })
    
    startClassDialogVisible.value = false
    ElMessage.success('课堂已开始')
  } catch (error) {
    console.error('开始上课失败:', error)
    ElMessage.error(error.message || '开始上课失败，请稍后重试')
  } finally {
    starting.value = false
  }
}

// 加载课程列表
const loadCourses = async () => {
  coursesLoading.value = true
  try {
    // 本地环境使用模拟数据
    if (API_CONFIG.BASE_URL.includes('localhost')) {
      // 模拟课程数据
      const mockCourses = [
        {
          id: 1,
          title: 'Python编程基础',
          description: 'Python编程语言入门课程',
          subject: 'Programming',
          grade_level: '大一',
          teacher_name: '张老师',
          student_count: 35,
          cover_image: tensorImg
        },
        {
          id: 2,
          title: 'Web前端开发',
          description: 'HTML, CSS, JavaScript基础教程',
          subject: 'Web Development',
          grade_level: '大二',
          teacher_name: '李老师',
          student_count: 42,
          cover_image: tensorImg
        },
        {
          id: 3,
          title: '数据结构与算法',
          description: '计算机基础课程',
          subject: 'Computer Science',
          grade_level: '大二',
          teacher_name: '王老师',
          student_count: 38,
          cover_image: tensorImg
        },
        {
          id: 4,
          title: '人工智能导论',
          description: 'AI基础知识与应用',
          subject: 'Artificial Intelligence',
          grade_level: '大三',
          teacher_name: '刘老师',
          student_count: 45,
          cover_image: tensorImg
        }
      ]
      
      coursesList.value = mockCourses
      return
    }

    // 如果不是本地环境，使用原有的API请求逻辑
    const response = await getMyCourses()
    
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
          student_count: course.student_count || 0
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
  margin-bottom: 12px;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
}

.course-actions {
  display: flex;
  justify-content: center;  /* 修改为居中对齐 */
  gap: 12px;
  width: 100%;  /* 添加宽度100% */
  margin-top: 16px;  /* 增加上边距 */
}

:deep(.el-button--primary) {
  background: #409EFF;
  border-color: #409EFF;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
  min-width: 120px;  /* 添加最小宽度 */
}

:deep(.el-button--primary:hover) {
  background: #66B1FF;
  border-color: #66B1FF;
}

:deep(.el-button--info) {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
}

.start-class-form {
  padding: 20px;
}

.start-class-form h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media screen and (max-width: 1366px) {
  .content-area {
    margin-left: 180px;
  }
  
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media screen and (max-width: 1024px) {
  .content-area {
    margin-left: 160px;
  }
  
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}
</style> 