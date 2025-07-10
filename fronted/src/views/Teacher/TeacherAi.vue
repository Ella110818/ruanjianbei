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
        <TeacherAiContent 
          @generate-ppt="handleGeneratePPT"
          :isGeneratingPPT="isGeneratingPPT"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherSidebar from '@/components/TeacherSidebar.vue'
import TeacherAiContent from '@/components/TeacherAi.vue'
import { getCourses, generateKnowledgePointsPPT } from '@/api'
import { ElMessage } from 'element-plus'

const sideTab = ref('lesson-prep')
const courseMenuOpen = ref(false)
const courses = ref([])
const isGeneratingPPT = ref(false)

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
    course_id: localStorage.getItem('currentCourseId') || null
  }

  try {
    isGeneratingPPT.value = true
    const response = await generateKnowledgePointsPPT(params)
    
    if (response.success && response.status_code === 201) {  // 修改为 201
      const fileUrl = response.data.file_url
      // 创建一个下载链接
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = response.data.filename || '知识点PPT.pptx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      ElMessage.success('PPT生成成功！')
    } else {
      ElMessage.error(response.message || '生成PPT失败')
    }
  } catch (error) {
    console.error('生成PPT失败:', error)
    ElMessage.error('生成PPT失败，请稍后重试')
  } finally {
    isGeneratingPPT.value = false
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