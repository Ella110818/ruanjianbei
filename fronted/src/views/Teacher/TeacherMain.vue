<template>
  <div class="teacher-main">
    <header class="teacher-header">
      <div class="header-left">
        <span class="project-name">智慧教育</span>
        <nav class="main-nav">
          <a href="#" :class="{active: activeTab === 'course'}" @click.prevent="activeTab = 'course'">课程管理</a>
          <a href="#" :class="{active: activeTab === 'student'}" @click.prevent="activeTab = 'student'">学生管理</a>
        </nav>
      </div>
      <div class="header-right">
        <div class="user-dropdown" @click="toggleUserMenu" ref="userDropdown">
          <img class="avatar" src="@/assets/avatar.png" alt="用户头像">
          <span class="username">教师姓名</span>
          <span class="arrow" :class="{open: userMenuOpen}"></span>
          <!-- 下拉菜单 -->
          <div class="dropdown-menu" v-show="userMenuOpen">
            <a href="#" @click.prevent="handleUserInfo">
              <i class="menu-icon user-icon"></i>
              用户信息
            </a>
            <a href="#" @click.prevent="handleChangePassword">
              <i class="menu-icon password-icon"></i>
              修改密码
            </a>
            <div class="menu-divider"></div>
            <a href="#" @click.prevent="handleLogout" class="logout-option">
              <i class="menu-icon logout-icon"></i>
              退出登录
            </a>
          </div>
        </div>
      </div>
    </header>
    <div class="main-area">
      <template v-if="activeTab === 'course'">
        <aside class="side-nav">
          <div class="side-title">工作台</div>
          <nav class="side-menu">
            <a href="#" :class="{active: sideTab === 'dashboard'}" @click.prevent="selectSide('dashboard')">首页</a>
            <div class="side-dropdown">
              <div class="dropdown-title" @click="toggleCourseMenu">
                <span :class="{active: sideTab.startsWith('course')}" >课程</span>
                <span class="arrow" :class="{open: courseMenuOpen}"></span>
              </div>
              <div v-show="courseMenuOpen" class="dropdown-list">
                <a href="#" :class="{active: sideTab === 'course-list'}" @click.prevent="selectSide('course-list')">课程列表</a>
                <a href="#" :class="{active: sideTab === 'course-create'}" @click.prevent="selectSide('course-create')">新建课程</a>
              </div>
            </div>
            <!-- 可继续添加其他导航项 -->
          </nav>
        </aside>
      </template>
      <main class="teacher-content">
        <div v-if="activeTab === 'course'">
          <!-- 课程管理内容区域 -->
          <h2>课程管理</h2>
          <p>这里是课程管理的内容...</p>
        </div>
        <div v-else>
          <!-- 学生管理内容区域 -->
          <h2>学生管理</h2>
          <p>这里是学生管理的内容...</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeacherMain',
  data() {
    return {
      activeTab: 'course',
      sideTab: 'dashboard',
      courseMenuOpen: false,
      userMenuOpen: false
    }
  },
  methods: {
    selectSide(tab) {
      this.sideTab = tab;
      // 可根据tab切换主内容区
    },
    toggleCourseMenu() {
      this.courseMenuOpen = !this.courseMenuOpen;
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen;
    },
    handleClickOutside(event) {
      if (this.$refs.userDropdown && !this.$refs.userDropdown.contains(event.target)) {
        this.userMenuOpen = false;
      }
    },
    handleUserInfo() {
      // 处理用户信息
      this.userMenuOpen = false;
    },
    handleChangePassword() {
      // 处理修改密码
      this.userMenuOpen = false;
    },
    handleLogout() {
      // 这里可以添加清除用户状态的逻辑，比如：
      // this.$store.dispatch('user/logout');
      // localStorage.removeItem('token');
      
      // 关闭下拉菜单
      this.userMenuOpen = false;
      
      // 跳转到登录页面
      this.$router.push('/login');
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
}
</script>

<style scoped>
.teacher-main {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.teacher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 0 40px;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: row;
}

.side-nav {
  width: 300px;
  background: #1B1B61;
  color: #fff;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.side-title {
  font-size: 20px;
  font-weight: bold;
  padding: 24px 0 16px 32px;
  letter-spacing: 2px;
  border-bottom: 1px solid #2c2c7a;
}
.side-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  gap: 4px;
}
.side-menu a {
  color: #fff;
  text-decoration: none;
  padding: 10px 32px;
  font-size: 16px;
  border-left: 4px solid transparent;
  transition: background 0.2s, border-color 0.2s;
  cursor: pointer;
}
.side-menu a.active,
.side-menu a:hover {
  background: #23237b;
  border-left: 4px solid #EEF4F6;
  color: #EEF4F6;
}
.side-dropdown {
  display: flex;
  flex-direction: column;
}
.dropdown-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 32px;
  font-size: 16px;
  cursor: pointer;
  color: #fff;
  user-select: none;
}
.dropdown-title .arrow {
  border: solid #fff;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  margin-left: 8px;
  transform: rotate(45deg);
  transition: transform 0.2s;
}
.dropdown-title .arrow.open {
  transform: rotate(135deg);
}
.dropdown-list {
  display: flex;
  flex-direction: column;
  background: #23237b;
}
.dropdown-list a {
  padding-left: 48px;
  font-size: 15px;
}
.dropdown-list a.active,
.dropdown-list a:hover {
  background: #2c2c7a;
  color: #EEF4F6;
}

.teacher-content {
  flex: 1;
  padding: 40px 60px;
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

.main-nav a {
  color: #333;
  font-size: 16px;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}

.main-nav a.active,
.main-nav a:hover {
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