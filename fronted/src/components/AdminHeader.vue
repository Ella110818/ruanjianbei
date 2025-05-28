<template>
  <header class="admin-header">
    <div class="header-left">
      <span class="project-name">智慧教育</span>
      <nav class="main-nav">
        <a href="#" :class="{active: $route.path === '/admin/dashboard'}" @click.prevent="$router.push('/admin/dashboard')">数据显示屏</a>
        <a href="#" :class="{active: $route.path === '/admin/users'}" @click.prevent="$router.push('/admin/users')">用户管理</a>
        <a href="#" :class="{active: $route.path === '/admin/resources'}" @click.prevent="$router.push('/admin/resources')">资源管理</a>
      </nav>
    </div>
    <div class="header-right">
      <div class="user-dropdown" @click="toggleUserMenu" ref="userDropdown">
        <img class="avatar" src="@/assets/avatar.png" alt="管理员头像">
        <span class="username">{{ adminName }}</span>
        <span class="arrow" :class="{open: userMenuOpen}"></span>
        <!-- 下拉菜单 -->
        <div class="dropdown-menu" v-show="userMenuOpen">
          <a href="#" @click.prevent="handleUserInfo">
            <i class="menu-icon user-icon"></i>
            个人信息
          </a>
          <a href="#" @click.prevent="handleSystemSettings">
            <i class="menu-icon settings-icon"></i>
            系统设置
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
</template>

<script>
export default {
  name: 'AdminHeader',
  data() {
    return {
      userMenuOpen: false,
      adminName: localStorage.getItem('adminName') || '系统管理员'
    }
  },
  methods: {
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen;
    },
    handleClickOutside(event) {
      if (this.$refs.userDropdown && !this.$refs.userDropdown.contains(event.target)) {
        this.userMenuOpen = false;
      }
    },
    handleUserInfo() {
      this.userMenuOpen = false;
      // 跳转到个人信息页面
      this.$router.push('/admin/profile');
    },
    handleSystemSettings() {
      this.userMenuOpen = false;
      // 跳转到系统设置页面
      this.$router.push('/admin/settings');
    },
    handleLogout() {
      this.userMenuOpen = false;
      // 清除管理员登录信息
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminName');
      // 跳转到登录页
      this.$router.push('/');
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
.admin-header {
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
  color: #2C3E50;
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
  transition: all 0.3s ease;
}

.main-nav a.active,
.main-nav a:hover {
  background: #ECF0F1;
  color: #2C3E50;
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
  color: #2C3E50;
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
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #ECF0F1;
}

.user-dropdown .arrow {
  border: solid #2C3E50;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  margin-left: 4px;
  transform: rotate(45deg);
  transition: transform 0.3s;
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
  transition: background-color 0.3s;
  font-size: 14px;
}

.dropdown-menu a:hover {
  background-color: #ECF0F1;
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232C3E50'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
}

.settings-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232C3E50'%3E%3Cpath d='M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'/%3E%3C/svg%3E");
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