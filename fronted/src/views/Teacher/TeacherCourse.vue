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
                  <div class="course-desc2">这里是课程简介...</div>
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
import { ref, onMounted } from 'vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import CourseDetail from '@/components/CourseDetail.vue'
import { getCourses } from '@/api' // 导入 getCourses API
import { ElMessage } from 'element-plus'

const sideTab = ref('dashboard')
const courseMenuOpen = ref(false)
const teacherName = ref('') // 将从用户信息中获取
const courseCount = ref(0)
const classCount = ref(0)
const studentCount = ref(0)
const selectedCourseId = ref(null)
const courses = ref([])

// 从localStorage获取之前的状态
const previousState = localStorage.getItem('previousState')
if (previousState) {
  const state = JSON.parse(previousState)
  sideTab.value = state.tab
  courseMenuOpen.value = state.menuOpen
  if (state.tab.startsWith('course-')) {
    const courseId = state.currentCourseId
    selectedCourseId.value = courseId ? parseInt(courseId) : null
  }
}

// 加载课程数据
const loadCourses = async () => {
  try {
    const response = await getCourses()
    if (response.code === 0) {
      courses.value = response.data.map(course => ({
        id: course.id,
        name: course.title,
        img: require('@/assets/course1.jpg'), // 默认图片，后续可以从API获取
        description: course.description,
        subject: course.subject,
        grade_level: course.grade_level,
        teacher_name: course.teacher_name
      }))
      
      // 更新统计数据
      courseCount.value = courses.value.length
      // 这些数据可能需要从其他API获取
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

// 组件挂载时加载数据
onMounted(() => {
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
  max-width: 1200px;
  padding: 32px;
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
  font-size: 20px;
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

.welcome-desc1 {
  font-size: 15px;
  color: #888;
}

.welcome-desc2 {
  font-size: 15px;
  color: #888;
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
  display: flex;
  gap: 24px;
  width: 100%;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 20px 32px;
}

.course-card2 {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #eee;
  width: calc(25% - 18px);  /* 四列布局，考虑间距 */
  min-width: 240px;
  padding: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.course-card2:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.course-img2 {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
  background: #f5f7fa;
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
</style> 