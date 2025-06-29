<template>
  <div class="teacher-main">
    <TeacherHeader />
    <div class="main-area">
      <TeacherSidebar
        :sideTab="sideTab"
        :courseMenuOpen="courseMenuOpen"
        :courses="courses"
        @update:sideTab="handleSideTabChange"
        @update:courseMenuOpen="courseMenuOpen = $event"
      />
      <main class="teacher-content">
        <template v-if="sideTab === 'dashboard'">
          <!-- 欢迎语卡片 -->
          <div class="dashboard-card">
            <div class="welcome-block">
              <div class="welcome-title">
                尊敬的{{ teacherName }}老师 
              </div>
              <div class="welcome-desc1">
                这一学期您的教学概况 📊：
              </div>
              <div class="welcome-desc2">
                开设了{{ courseCount }}门课程 📚，
                教授了{{ classCount }}个班级 🏫，
                指导了{{ studentCount }}名学生 👨‍🎓。
              </div>
              <div class="welcome-desc1">
                感谢您的辛勤付出 。
              </div>
            </div>
            <div class="divider-with-text">
              <span class="divider-text">"三尺讲台燃星火，一方净土塑灵魂。"</span>
            </div>
          </div>

          <!-- Banner -->
          <div class="banner-card">
            <img src="@/assets/banner.png" alt="重磅讲座" class="banner-image" />
          </div>

          <!-- 课程列表卡片 -->
          <div class="dashboard-card">
            <div class="divider-with-text1">
              <span class="divider-text1">您所教授的课程：</span>
            </div>
            <div class="course-cards-row">
              <div class="course-card2" v-for="(course, idx) in courses" :key="idx">
                <img :src="course.img" class="course-img2" :alt="course.name" />
                <div class="course-info">
                  <div class="course-name2">{{ course.name }}</div>
                  <div class="course-desc2">{{ course.description || '暂无课程简介' }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-else-if="selectedCourseId" class="course-detail-container">
          <CourseDetail :course-id="selectedCourseId" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import CourseDetail from '@/components/CourseDetail.vue'
import { getCourses, checkAndSetMockEnvironment } from '@/api'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const sideTab = ref('dashboard')
const courseMenuOpen = ref(false)
const teacherName = ref('') // 将从用户信息中获取
const courseCount = ref(0)
const classCount = ref(0)
const studentCount = ref(0)
const selectedCourseId = ref(null)
const courses = ref([])
const router = useRouter()

// 初始化状态
const initializeState = () => {
  const savedState = localStorage.getItem('teacherNavState')
  if (savedState) {
    const state = JSON.parse(savedState)
    sideTab.value = state.tab
    courseMenuOpen.value = state.menuOpen
    if (state.tab.startsWith('course-')) {
      const courseId = state.currentCourseId
      selectedCourseId.value = courseId ? parseInt(courseId) : null
    }
  }
}

// 监听路由变化
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/teacher/course') {
    initializeState()
  }
})

// 加载课程数据
const loadCourses = async () => {
  try {
    // 检查并设置Mock环境
    checkAndSetMockEnvironment();
    
    const response = await getCourses()
    if (response.code === 0) {
      courses.value = response.data.map(course => ({
        id: course.id,
        name: course.title || course.name,
        img: require('@/assets/course1.jpg'),
        description: course.description,
        subject: course.subject,
        grade_level: course.grade_level,
        teacher_name: course.teacher_name || course.teacher
      }))
      
      // 更新统计数据
      courseCount.value = courses.value.length
      classCount.value = courses.value.reduce((acc, curr) => acc + (curr.class_count || 1), 0)
      studentCount.value = courses.value.reduce((acc, curr) => acc + (curr.student_count || 30), 0)
      
      // 获取教师名称
      if (courses.value.length > 0) {
        teacherName.value = courses.value[0].teacher_name || localStorage.getItem('teacherName') || '老师'
      }
    } else {
      ElMessage.error(response.msg || '获取课程列表失败')
    }
  } catch (error) {
    console.error('加载课程失败:', error)
    ElMessage.error('加载课程数据失败，请稍后重试')
  }
}

const handleSideTabChange = (tab) => {
  sideTab.value = tab
  if (tab.startsWith('course-')) {
    const courseIndex = parseInt(tab.split('-')[1])
    selectedCourseId.value = courses.value[courseIndex]?.id
  } else {
    selectedCourseId.value = null
  }
}

// 组件挂载时初始化状态
onMounted(() => {
  initializeState()
  loadCourses()
})
</script>

<style scoped>
.teacher-main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  padding-top: 64px;
}

.main-area {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: calc(100vh - 64px);
  margin-left: 300px;
  width: calc(100% - 300px);
}

.teacher-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f7f8fa;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  height: calc(100vh - 64px);
}

.dashboard-card {
  width: 100%;
  max-width: min(1200px, 90%);
  padding: clamp(16px, 3vw, 32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 16px rgba(24,119,255,0.10);
  border: 1.5px solid #cde1f1;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin-bottom: 24px;
  width: 100%;
}

.welcome-block {
  width: 100%;
  margin-bottom: 0;
  text-align: left;
  padding-left: 32px;
}

.welcome-title {
  font-size: clamp(18px, 2vw, 20px);
  font-weight: 700;
  color: #222;
  margin-bottom: 2px;
  position: relative;
  display: inline-block;
}

.welcome-title::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 2px;
  background-color: #878889;
}

.welcome-title::after {
  content: '';
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 2px;
  background-color: #878889;
}

.welcome-desc1, .welcome-desc2 {
  font-size: clamp(14px, 1.5vw, 16px);
  color: #888;
}

.welcome-desc2 {
  margin-left: 20px;
}

.divider-with-text {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 16px 0;
  color: #666;
  font-size: 14px;
}
.divider-with-text1 {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 16px 0;
  color: #666;
  font-size: 14px;
  padding-left: 32px;
}
.divider-with-text1::before {
  content: '';
  width: 40px;
  height: 1px;
  background: #e6e8f0;
  margin-right: 8px;
  flex: none;
}
.divider-with-text1::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e6e8f0;
  margin-left: 16px;
}
.divider-with-text::before,
.divider-with-text::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e6e8f0;
  margin: 0 16px;
}

.divider-text {
  flex-shrink: 0;
  color: #888;
}
.divider-text1 {
  flex-shrink: 0;
  color: #040404;
  font-size: 17px;
  font-weight: 600;
}

.course-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  padding: 16px;
}

.course-card2 {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.course-img2 {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.course-info {
  padding: 16px;
}

.course-name2 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  text-align: left;
}

.course-desc2 {
  color: #666;
  font-size: 14px;
  text-align: left;
  line-height: 1.5;
}

.banner-card {
  width: 100%;
  max-width: 1200px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(24,119,255,0.10);
  transition: transform 0.3s ease;
  cursor: pointer;
  margin: 24px 0;
}

.banner-card:hover {
  transform: translateY(-2px);
}

.banner-image {
  width: 100%;
  height: 200px;
  display: block;
  object-fit: cover;
}

/* 添加 CourseDetail 容器样式 */
:deep(.course-detail-container) {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background: transparent;
}

/* 添加响应式媒体查询 */
@media screen and (max-width: 1366px) {
  .main-area {
    margin-left: 250px;
    width: calc(100% - 250px);
  }
  
  .dashboard-card {
    padding: 16px;
  }
  
  .welcome-block {
    padding-left: 16px;
  }
  
  .course-cards-row {
    gap: 16px;
  }
}

@media screen and (max-width: 1024px) {
  .main-area {
    margin-left: 200px;
    width: calc(100% - 200px);
  }
  
  .course-cards-row {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style> 