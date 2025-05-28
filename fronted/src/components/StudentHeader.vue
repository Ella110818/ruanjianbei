<template>
  <header class="student-header">
    <!-- 左侧标题 -->
    <div class="header-left">
      <span class="project-name">智慧教育</span>
      <nav class="main-nav">
        <router-link 
          to="/student/ai-assistant" 
          class="nav-link"
          :class="{ active: activeMenu === 'ai-assistant' }"
        >
          AI助手
        </router-link>
        <router-link 
          to="/student/classroom" 
          class="nav-link"
          :class="{ active: activeMenu === 'my-learning' }"
        >
          我的学堂
        </router-link>
      </nav>
    </div>

    <!-- 右侧用户信息 -->
    <div class="header-right">
      <div class="user-dropdown" @click="toggleUserMenu" ref="userDropdown">
        <img class="avatar" src="@/assets/avatar.png" alt="用户头像">
        <span class="username">{{ userInfo.name }}</span>
        <span class="arrow" :class="{open: userMenuOpen}"></span>
        <!-- 下拉菜单 -->
        <div class="dropdown-menu" v-show="userMenuOpen">
          <a href="#" @click.prevent="handleCommand('profile')">
            <i class="menu-icon user-icon"></i>
            个人信息
          </a>
          <a href="#" @click.prevent="handleCommand('settings')">
            <i class="menu-icon password-icon"></i>
            设置
          </a>
          <div class="menu-divider"></div>
          <a href="#" @click.prevent="handleCommand('logout')" class="logout-option">
            <i class="menu-icon logout-icon"></i>
            退出登录
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userMenuOpen = ref(false)

// 用户信息
const userInfo = ref({
  name: localStorage.getItem('studentName') || '未知用户',
  avatar: ''
})

// 当前激活的菜单项
const activeMenu = computed(() => {
  const path = route.path
  if (path.includes('/ai-assistant')) return 'ai-assistant'
  if (path.includes('/student')) return 'my-learning'
  return ''
})

// 切换用户菜单
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

// 处理点击外部关闭菜单
const handleClickOutside = (event) => {
  const userDropdown = document.querySelector('.user-dropdown')
  if (userDropdown && !userDropdown.contains(event.target)) {
    userMenuOpen.value = false
  }
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  userMenuOpen.value = false
  if (command === 'profile') {
      router.push('/student/profile')
  } else if (command === 'logout') {
      localStorage.removeItem('studentName')
      router.push('/login')
      ElMessage.success('已退出登录')
  } else if (command === 'settings') {
    ElMessage.info('设置功能开发中')
  }
}

// 添加和移除点击外部事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.student-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 200;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 0 40px;
}

.header-left {
  display: flex;
  align-items: center;
}

.project-name {
  font-size: 22px;
  font-weight: bold;
  color: #1B1B61;
  margin-right: 40px;
  letter-spacing: 2px;
}

.main-nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  color: #333;
  font-size: 16px;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.nav-link.active,
.nav-link:hover {
  background: #EEF4F6;
  color: #1B1B61;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: #eee;
}

.username {
  font-size: 16px;
  color: #1B1B61;
  font-weight: 500;
}

.user-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-dropdown:hover {
  background-color: #EEF4F6;
}

.user-dropdown .arrow {
  border: solid #1B1B61;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  margin-left: 4px;
  transform: rotate(45deg);
  transition: transform 0.2s;
}

.user-dropdown .arrow.open {
  transform: rotate(-135deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 160px;
  padding: 8px 0;
  z-index: 1000;
}

.dropdown-menu a {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 14px;
}

.dropdown-menu a:hover {
  background-color: #EEF4F6;
}

.menu-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.user-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231B1B61'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
}

.password-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231B1B61'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E");
}

.logout-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff4d4f'%3E%3Cpath d='M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z'/%3E%3C/svg%3E");
}

.menu-divider {
  height: 1px;
  background-color: #eee;
  margin: 8px 0;
}

.logout-option {
  color: #ff4d4f !important;
}

.logout-option:hover {
  background-color: #fff1f0 !important;
}
</style> 