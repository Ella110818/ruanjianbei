<template>
  <div class="dashboard-container">
    <AdminHeader />
    <div class="dashboard-content">
      <div class="time-display">
        <div class="time">{{ currentTime }}</div>
        <div class="date">{{ currentDate }}</div>
      </div>
      <div class="header-section">
        <div class="header-content">
          <div class="title-image">
            <img src="@/assets/大标题1.png" alt="标题" />
          </div>
          <div class="course-select-container">
            <el-select v-model="selectedCourse" placeholder="请选择课程" class="course-select">
              <el-option
                v-for="course in courses"
                :key="course.value"
                :label="course.label"
                :value="course.value"
              />
            </el-select>
          </div>
        </div>
      </div>
      <div class="main-content">
        <div class="left-cards">
          <TeacherUsage />
          <StudentUsage />
        </div>
        <div class="center-image">
          <img src="@/assets/图层 2.png" alt="学校" />
        </div>
        <div class="right-card">
          <FrequentErrors />
        </div>
      </div>
      <div class="bottom-stats">
        <LearningEffect />
        <CourseOptimization :selected-course="selectedCourse" />
        <TeachingEfficiency />
      </div>
    </div>
  </div>
</template>

<script>
import AdminHeader from '@/components/AdminHeader.vue'
import TeacherUsage from '@/components/TeacherUsage.vue'
import StudentUsage from '@/components/StudentUsage.vue'
import TeachingEfficiency from '@/components/TeachingEfficiency.vue'
import LearningEffect from '@/components/LearningEffect.vue'
import CourseOptimization from '@/components/CourseOptimization.vue'
import FrequentErrors from '@/components/FrequentErrors.vue'

export default {
  name: 'AdminDashboard',
  components: {
    AdminHeader,
    TeacherUsage,
    StudentUsage,
    TeachingEfficiency,
    LearningEffect,
    CourseOptimization,
    FrequentErrors
  },
  data() {
    return {
      timer: null,
      currentTime: '',
      currentDate: '',
      selectedCourse: '',
      courses: [
        { value: 'math', label: '高等数学' },
        { value: 'physics', label: '大学物理' },
        { value: 'circuit', label: '电路分析' },
        { value: 'programming', label: '程序设计' }
      ]
    }
  },
  methods: {
    updateTime() {
      const now = new Date()
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      
      // 格式化时间
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      this.currentTime = `${hours}:${minutes}:${seconds}`
      
      // 格式化日期
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const weekday = weekdays[now.getDay()]
      this.currentDate = `${year}年${month}月${day}日 ${weekday}`
    }
  },
  mounted() {
    this.updateTime() // 初始化时间
    this.timer = setInterval(this.updateTime, 1000) // 每秒更新一次
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer) // 清除定时器
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  background-image: url('@/assets/bg002.png');
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.dashboard-content {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.time-display {
  position: absolute;
  top: 80px;
  left: 30px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.time {
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.date {
  font-size: 16px;
  opacity: 0.9;
}

.header-section {
  position: relative;
  margin-top: 20px;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  padding: 0 40px;
}

.title-image {
  display: flex;
  justify-content: flex-start;
  width: auto;
  margin-right: -80px;
}

.title-image img {
  width: auto;
  height: auto;
  object-fit: contain;
}

.course-select-container {
  margin-left: 0;
  min-width: 200px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
}

.course-select {
  width: 100%;
  position: relative;
}

:deep(.el-select .el-input__wrapper) {
  background: url('@/assets/bg.png') no-repeat center !important;
  background-size: contain !important;
  border: none;
  box-shadow: none !important;
  padding: 0 30px;
  height: 44px;
  width: 200px;
}

:deep(.el-select .el-input__inner) {
  color: #fff;
  font-size: 14px;
  background: transparent !important;
}

:deep(.el-select .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-select-dropdown) {
  background: rgba(78, 160, 197, 0.9);
  border: none;
  backdrop-filter: blur(10px);
}

:deep(.el-select-dropdown__item) {
  color: #fff;
}

:deep(.el-select-dropdown__item.hover) {
  background: rgba(255, 255, 255, 0.1);
}

:deep(.el-select-dropdown__item.selected) {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: bold;
}

.main-content {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding: 0 20px;
  justify-content: center;
  align-items: flex-start;
}

.left-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 15px;
  row-gap: 8px;
  width: 32%;
  margin-left: 8%;
}

.center-image {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0 8px;
  max-width: 38%;
  margin-left: -64px;
}

.center-image img {
  width: 100%;
  max-width: 500px;
  height: auto;
  object-fit: contain;
  opacity: 0.8;
}

.right-card {
  width: 30%;
}

.bottom-stats {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 0 20px;
  margin-top: -60px;
}

.bottom-stats > * {
  flex: 1;
  min-width: 0;
}

.bottom-stats > :last-child {
  flex: 1.2;
}

@media (max-width: 1600px) {
  .main-content {
    flex-direction: column;
  }

  .left-cards {
    width: 100%;
  }

  .bottom-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .left-cards {
    grid-template-columns: 1fr;
  }

  .bottom-stats {
    grid-template-columns: 1fr;
  }
}
</style> 