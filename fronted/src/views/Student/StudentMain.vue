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
      <!-- 课程卡片网格 -->
      <div class="course-grid">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import StudentHeader from '@/components/StudentHeader.vue'
import CourseCard2 from '@/components/CourseCard2.vue'

const router = useRouter()

// 模拟课程数据
const courses = ref([
  {
    id: 1,
    name: '高等数学',
    location: '教学楼A 101'
  },
  {
    id: 2,
    name: '大学物理',
    location: '教学楼B 202'
  },
  {
    id: 3,
    name: '程序设计',
    location: '实验楼 304'
  }
])

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
</style> 