<template>
  <div class="student-container">
    <div class="background-wrapper">
      <div class="background-image"></div>
      <div class="background-overlay"></div>
    </div>
    
    <!-- 使用新的顶部导航栏组件 -->
    <student-header />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 加载状态和错误提示 -->
      <div v-if="loading" class="loading-state">
        正在加载课程列表...
      </div>
      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>
      <!-- 课程卡片网格 -->
      <div v-else class="course-grid">
        <course-card2
          v-for="course in courses"
          :key="course.id"
          :course="{
            course_id: course.id,
            title: course.name,
            location: course.location
          }"
          @view-course="enterCourse"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StudentHeader from '@/components/StudentHeader.vue'
import CourseCard2 from '@/components/CourseCard2.vue'
import { getMyCourses } from '@/api'

const router = useRouter()

// 课程列表数据
const courses = ref([])
const loading = ref(false)
const error = ref('')

// 获取课程列表
const fetchCourses = async () => {
  loading.value = true
  error.value = ''
  try {
    const params = {
      page: 1,
      ordering: 1
    }
    const response = await getMyCourses(params)
    if (response.code === 0 && response.data) {
      courses.value = response.data.results || []
    } else {
      error.value = response.msg || '获取课程列表失败'
    }
  } catch (err) {
    console.error('获取课程列表出错:', err)
    error.value = '获取课程列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 页面加载时获取课程列表
onMounted(() => {
  fetchCourses()
})

// 进入课程详情
const enterCourse = (courseId) => {
  router.push(`/student/course/${courseId}`)
}
</script>

<style scoped>
.student-container {
  min-height: 100vh;
  position: relative;
}

.background-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  z-index: 0;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-image: url('@/assets/ai.png');
  background-size: cover;
  background-position: top center;
  background-repeat: no-repeat;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.main-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 120px;
  padding: 0 20px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 50px;
  padding: 20px 0;
}

@media screen and (max-width: 1200px) {
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .main-content {
    margin-top: 60px;
  }
}

@media screen and (max-width: 768px) {
  .course-grid {
    grid-template-columns: 1fr;
  }
  .main-content {
    margin-top: 60px;
  }
}

.loading-state,
.error-state {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #666;
}

.error-state {
  color: #ff4d4f;
}
</style> 