<template>
  <aside class="side-nav">
    <div class="side-title">课堂管理</div>
    <nav class="side-menu">
      <a href="#" 
         :class="{active: currentTab === 'start-class'}" 
         @click.prevent="selectSide('start-class', '/teacher/start-class')">
        开始上课
      </a>
      <a href="#" 
         :class="{active: currentTab === 'class-record'}" 
         @click.prevent="selectSide('class-record', '/teacher/record')">
        课堂记录
      </a>
      <a href="#" 
         :class="{active: currentTab === 'student-answers'}" 
         @click.prevent="selectSide('student-answers', '/teacher/analysis')">
        答题情况
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
    default: 'student-answers'
  }
})

const emit = defineEmits(['update:sideTab'])
const currentTab = ref(props.sideTab || 'student-answers')

// 保存导航状态
const saveNavigationState = () => {
  const state = {
    tab: currentTab.value
  }
  localStorage.setItem('teacherClassNavState', JSON.stringify(state))
}

// 更新当前标签
const updateCurrentTab = (path) => {
  if (path === '/teacher/start-class') {
    currentTab.value = 'start-class'
  } else if (path === '/teacher/record') {
    currentTab.value = 'class-record'
  } else if (path === '/teacher/analysis') {
    currentTab.value = 'student-answers'
  }
  emit('update:sideTab', currentTab.value)
  saveNavigationState()
}

// 选择侧边栏项
const selectSide = (tab, route) => {
  currentTab.value = tab
  emit('update:sideTab', tab)
  router.push(route)
  saveNavigationState()
}

// 监听props变化
watch(() => props.sideTab, (newVal) => {
  currentTab.value = newVal || 'student-answers'
})

// 组件挂载时初始化状态
onMounted(() => {
  // 首先尝试从本地存储恢复状态
  const savedState = localStorage.getItem('teacherClassNavState')
  if (savedState) {
    const state = JSON.parse(savedState)
    currentTab.value = state.tab || 'student-answers'
    emit('update:sideTab', currentTab.value)
  }

  // 根据当前路由设置初始状态
  updateCurrentTab(router.currentRoute.value.path)

  // 设置路由监听
  router.afterEach((to) => {
    updateCurrentTab(to.path)
  })
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
  font-weight: 600;
}

.side-menu a.active,
.side-menu a:hover {
  background: #6366F1;
  color: #fff;
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.2);
  font-weight: 600;
}

/* 响应式设计 */
@media screen and (max-width: 1366px) {
  .side-nav {
    width: 180px;
  }
  
  .side-title {
    font-size: 18px;
    padding: 20px 0 14px 24px;
  }
  
  .side-menu a {
    padding: 10px 24px;
    font-size: 14px;
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
  
  .side-menu a {
    padding: 8px 20px;
    font-size: 13px;
  }
}
</style> 