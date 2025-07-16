<template>
  <aside class="side-nav">
    <div class="side-title">工作台</div>
    <nav class="side-menu">
      <a href="#" 
         :class="{active: currentTab === 'dashboard'}" 
         @click.prevent="selectSide('dashboard', '/teacher/course')">
        首页
      </a>
      <div class="side-dropdown">
        <div class="dropdown-title" @click="toggleCourseMenu">
          <span :class="{active: currentTab && currentTab.startsWith('course')}" >课程</span>
          <span class="arrow" :class="{open: isMenuOpen}"></span>
        </div>
        <div v-if="isMenuOpen" class="dropdown-list">
          <a v-for="(course, index) in courses" 
             :key="index"
             href="#" 
             :class="{active: currentTab === `course-${index}`}" 
             @click.prevent="selectCourse(course, index)"
             class="course-item">
            {{ course.name }}
          </a>
        </div>
      </div>
       <!-- 备课助手菜单 -->
      <a href="#" 
         :class="{active: currentTab === 'lesson-prep'}" 
         @click.prevent="selectSide('lesson-prep', '/teacher/ai')">
        备课助手
      </a>
      <!-- 添加练习题入口 -->
      <a href="#" 
         :class="{active: currentTab === 'exercises'}" 
         @click.prevent="selectSide('exercises', '/teacher/exercises')">
        练习题库
      </a>
      <!-- 学生答题记录 -->
      <a href="#" 
         :class="{active: currentTab === 'student-answers'}" 
         @click.prevent="selectSide('student-answers', '/teacher/student-answers')">
        学生答题记录
      </a>
    </nav>
  </aside>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  sideTab: {
    type: String,
    required: true,
    default: 'dashboard' // 添加默认值
  },
  courseMenuOpen: {
    type: Boolean,
    required: true
  },
  courses: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:sideTab', 'update:courseMenuOpen'])

const currentTab = ref(props.sideTab || 'dashboard') // 确保有默认值
const isMenuOpen = ref(props.courseMenuOpen)

// 监听props变化
watch(() => props.sideTab, (newVal) => {
  currentTab.value = newVal || 'dashboard' // 确保在props更新时也有默认值
})

// 监听路由变化，切回课程管理时自动恢复菜单状态
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/teacher/course') {
    const savedState = localStorage.getItem('teacherNavState')
    if (savedState) {
      const state = JSON.parse(savedState)
      currentTab.value = state.tab
      isMenuOpen.value = state.menuOpen
      emit('update:sideTab', state.tab)
      emit('update:courseMenuOpen', state.menuOpen)
    }
  }
}, { immediate: true })

const toggleCourseMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  emit('update:courseMenuOpen', isMenuOpen.value)
  // 保存当前菜单状态
  saveNavigationState()
}

const selectSide = (tab, route) => {
  if (tab === 'lesson-prep') {
    // 切换到备课助手时，保存当前状态并更新currentTab
    saveNavigationState();
    currentTab.value = tab;
    emit('update:sideTab', tab);
    router.push(route);
    return;
  }
  
  // 其他情况正常切换tab
  currentTab.value = tab;
  emit('update:sideTab', tab);
  router.push(route);
}

const selectCourse = (course, index) => {
  const tab = `course-${index}`;
  currentTab.value = tab;
  emit('update:sideTab', tab);
  
  // 存储课程信息
  localStorage.setItem('currentCourseName', course.name);
  localStorage.setItem('currentCourseId', course.id);
  localStorage.setItem('currentCourseLocation', course.location || '理科楼301');
  
  // 保存导航状态
  saveNavigationState();
  
  // 如果当前在备课助手页面，不改变路由
  if (router.currentRoute.value.path === '/teacher/ai') {
    return;
  }
  
  router.push(`/teacher/course?id=${course.id}`);
}

// 保存导航状态的统一方法
const saveNavigationState = () => {
  const state = {
    tab: currentTab.value,
    menuOpen: isMenuOpen.value,
    currentCourse: localStorage.getItem('currentCourseName'),
    currentCourseId: localStorage.getItem('currentCourseId'),
    currentCourseLocation: localStorage.getItem('currentCourseLocation')
  }
  localStorage.setItem('teacherNavState', JSON.stringify(state))
}

// 组件挂载时初始化状态
onMounted(() => {
  const savedState = localStorage.getItem('teacherNavState')
  if (savedState) {
    const state = JSON.parse(savedState)
    currentTab.value = state.tab || 'dashboard' // 添加默认值
    isMenuOpen.value = state.menuOpen
    emit('update:sideTab', state.tab || 'dashboard') // 添加默认值
    emit('update:courseMenuOpen', state.menuOpen)
    
    // 恢复课程信息
    if (state.currentCourse) {
      localStorage.setItem('currentCourseName', state.currentCourse)
      localStorage.setItem('currentCourseId', state.currentCourseId)
      localStorage.setItem('currentCourseLocation', state.currentCourseLocation)
    }
  }
})

// 组件卸载前保存状态
onUnmounted(() => {
  saveNavigationState()
})
</script>

<style scoped>
.side-nav {
  width: 300px;
  background: linear-gradient(180deg, #E8EBFF 0%, #F0F3FF 50%, #F8FAFF 100%);
  color: #333;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: calc(100vh - 64px);
  position: fixed;
  left: 0;
  top: 64px;
  z-index: 100;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.05);
  transition: width 0.3s ease;
  overflow-y: auto;
}

.side-title {
  font-size: 20px;
  font-weight: bold;
  padding: 24px 0 16px 32px;
  letter-spacing: 2px;
  color: #333;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.side-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.side-menu a {
  color: #666;
  text-decoration: none;
  padding: 12px 32px;
  font-size: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 100px;
  margin: 0 12px;
  position: relative;
  width: calc(100% - 24px);
  text-align: center;
}

.side-menu a.active,
.side-menu a:hover {
  background: #6366F1;
  color: #fff;
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.2);
}

.side-dropdown {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}

.dropdown-title {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 32px;
  font-size: 15px;
  cursor: pointer;
  color: #666;
  user-select: none;
  transition: all 0.3s ease;
  border-radius: 100px;
  margin: 0 12px;
  width: calc(100% - 24px);
}

.dropdown-title:hover,
.dropdown-title span.active {
  color: #6366F1;
}

.dropdown-title .arrow {
  border: solid #666;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  margin-left: 8px;
  transform: rotate(45deg);
  transition: transform 0.2s;
}

.dropdown-title:hover .arrow {
  border-color: #6366F1;
}

.dropdown-title .arrow.open {
  transform: rotate(-135deg);
}

.dropdown-title span {
  margin-right: 8px;
}

.dropdown-list {
  display: flex;
  flex-direction: column;
  background: transparent;
  gap: 4px;
  padding: 4px 0;
  width: 100%;
  align-items: center;
}

.dropdown-list a {
  text-align: center;
  padding: 10px 24px;
  font-size: 14px;
  width: calc(100% - 32px);
  margin: 0 16px;
}

.dropdown-list a.active,
.dropdown-list a:hover {
  background: #6366F1;
  color: #fff !important;
}

.course-item {
  text-align: center !important;
  padding: 10px 24px !important;
  font-size: 14px !important;
  color: #666 !important;
  width: calc(100% - 32px) !important;
  margin: 0 16px !important;
}

.course-item:hover,
.course-item.active {
  color: #fff !important;
}

/* 添加响应式设计 */
@media screen and (max-width: 1366px) {
  .side-nav {
    width: 180px;
  }
  
  .side-title {
    font-size: 18px;
    padding: 20px 0 14px 24px;
  }
  
  .side-menu a,
  .dropdown-title {
    padding: 10px 24px;
    font-size: 14px;
  }
  
  .dropdown-list a {
    padding-left: 40px;
    font-size: 13px;
  }
}

@media screen and (max-width: 1024px) {
  .side-nav {
    width: 160px;
  }
  
  .side-title {
    font-size: 16px;
    padding: 16px 0 12px 20px;
  }
  
  .side-menu a,
  .dropdown-title {
    padding: 8px 20px;
    font-size: 13px;
  }
  
  .dropdown-list a {
    padding-left: 32px;
    font-size: 12px;
  }
}
</style>