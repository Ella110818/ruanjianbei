<template>
  <aside class="side-nav">
    <div class="side-title">工作台</div>
    <nav class="side-menu">
      <a href="#" 
         :class="{active: currentTab === 'lesson-prep'}" 
         @click.prevent="selectSide('lesson-prep', '/teacher/ai')">
        PPT助手
      </a>
      <a href="#" 
         :class="{active: currentTab === 'teaching-plan'}" 
         @click.prevent="selectSide('teaching-plan', '/teacher/plan')">
        三纲一案
      </a>
      <a href="#" 
         :class="{active: currentTab === 'lesson-plan'}" 
         @click.prevent="selectSide('lesson-plan', '/teacher/lesson')">
        教案生成
      </a>
      <a href="#" 
         :class="{active: currentTab === 'qa-assistant'}" 
         @click.prevent="selectSide('qa-assistant', '/teacher/qa')">
        问答助手
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
    default: 'dashboard'
  }
})

const emit = defineEmits(['update:sideTab'])

const currentTab = ref(props.sideTab || 'dashboard')

// 监听props变化
watch(() => props.sideTab, (newVal) => {
  currentTab.value = newVal || 'dashboard'
})

// 监听路由变化
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/teacher/course') {
    const savedState = localStorage.getItem('teacherNavState')
    if (savedState) {
      const state = JSON.parse(savedState)
      currentTab.value = state.tab
      emit('update:sideTab', state.tab)
    }
  }
}, { immediate: true })

const selectSide = (tab, route) => {
  currentTab.value = tab
  emit('update:sideTab', tab)
  router.push(route)
  saveNavigationState()
}

// 保存导航状态的统一方法
const saveNavigationState = () => {
  const state = {
    tab: currentTab.value
  }
  localStorage.setItem('teacherNavState', JSON.stringify(state))
}

// 组件挂载时初始化状态
onMounted(() => {
  const savedState = localStorage.getItem('teacherNavState')
  if (savedState) {
    const state = JSON.parse(savedState)
    currentTab.value = state.tab || 'dashboard'
    emit('update:sideTab', state.tab || 'dashboard')
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

/* 添加响应式设计 */
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