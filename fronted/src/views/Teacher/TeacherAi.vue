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
        <TeacherAiContent />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import TeacherAiContent from '@/components/TeacherAi.vue'
import { getCourses } from '@/api'
import { ElMessage } from 'element-plus'

const sideTab = ref('lesson-prep')
const courseMenuOpen = ref(false)
const courses = ref([])

// 加载课程数据
const loadCourses = async () => {
  try {
    const response = await getCourses()
    if (response.code === 0) {
      courses.value = response.data.map(course => ({
        id: course.id,
        name: course.title,
        description: course.description,
        subject: course.subject,
        grade_level: course.grade_level,
        teacher_name: course.teacher_name
      }))
    } else {
      ElMessage.error(response.msg || '获取课程列表失败')
    }
  } catch (error) {
    console.error('加载课程失败:', error)
    ElMessage.error('加载课程数据失败，请稍后重试')
  }
}

    // 恢复之前的课程上下文
const restorePreviousState = () => {
  const previousTab = localStorage.getItem('previousTab')
    if (previousTab) {
    sideTab.value = previousTab
      if (previousTab.startsWith('course-')) {
      courseMenuOpen.value = true
      }
    }
}

const updateSideTab = (tab) => {
  sideTab.value = tab
  localStorage.setItem('sideTab', tab)
      
      if (tab.startsWith('course-')) {
    const courseIndex = parseInt(tab.split('-')[1])
    const selectedCourse = courses.value[courseIndex]
        if (selectedCourse) {
      localStorage.setItem('currentCourseName', selectedCourse.name)
      localStorage.setItem('currentCourseId', selectedCourse.id)
        }
      }
}

const updateCourseMenuOpen = (open) => {
  courseMenuOpen.value = open
    }

// 组件挂载时初始化数据
onMounted(() => {
  loadCourses()
  restorePreviousState()
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
}
</style> 