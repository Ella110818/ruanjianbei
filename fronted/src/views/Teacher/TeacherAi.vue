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

<script>
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import TeacherAiContent from '@/components/TeacherAi.vue'

export default {
  name: 'TeacherAi',
  components: {
    TeacherHeader,
    TeacherSidebar,
    TeacherAiContent
  },
  data() {
    return {
      sideTab: 'lesson-prep',
      courseMenuOpen: false,
      courses: JSON.parse(localStorage.getItem('teacherCourses') || '[]')
    }
  },
  created() {
    // 恢复之前的课程上下文
    const previousTab = localStorage.getItem('previousTab');
    if (previousTab) {
      this.sideTab = previousTab;
      if (previousTab.startsWith('course-')) {
        this.courseMenuOpen = true;
      }
    }
  },
  methods: {
    updateSideTab(tab) {
      this.sideTab = tab;
      localStorage.setItem('sideTab', tab);
      
      if (tab.startsWith('course-')) {
        const courseIndex = parseInt(tab.split('-')[1]);
        const selectedCourse = this.courses[courseIndex];
        if (selectedCourse) {
          localStorage.setItem('currentCourseName', selectedCourse.name);
          localStorage.setItem('currentCourseId', selectedCourse.id);
        }
      }
    },
    updateCourseMenuOpen(open) {
      this.courseMenuOpen = open;
    }
  }
}
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