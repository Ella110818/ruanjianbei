<template>
  <div class="teacher-header-container">
    <header class="teacher-header">
      <div class="header-left">
        <span class="project-name">智慧教育</span>
        <nav class="main-nav">
          <a href="#" :class="{active: isActivePath('/teacher/course')}" @click.prevent="navigateTo('/teacher/course')">备课助手</a>
          <a href="#" :class="{active: isActivePath('/teacher/manage')}" @click.prevent="navigateTo('/teacher/manage')">习题中心</a>
          <a href="#" :class="{active: isActivePath('/teacher/analysis')}" @click.prevent="navigateTo('/teacher/analysis')">学情分析</a>
        </nav>
      </div>
      <div class="header-right">
        <div class="user-dropdown" @click="toggleUserMenu" ref="userDropdown">
          <img class="avatar" src="@/assets/avatar.png" alt="用户头像">
          <span class="username">{{ teacherName }}</span>
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

    <!-- 添加修改密码对话框 -->
    <el-dialog
      v-model="changePasswordVisible"
      title="修改密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="old_password">
          <el-input
            v-model="passwordForm.old_password"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input
            v-model="passwordForm.new_password"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm_password">
          <el-input
            v-model="passwordForm.confirm_password"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="changePasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="submitChangePassword" :loading="submitting">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { API_CONFIG } from '@/api'  // 添加这行导入

export default {
  name: 'TeacherHeader',
  data() {
    // 验证确认密码
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.passwordForm.new_password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    
    return {
      userMenuOpen: false,
      teacherName: localStorage.getItem('teacherName') || '教师姓名',
      // 修改密码相关数据
      changePasswordVisible: false,
      submitting: false,
      passwordForm: {
        old_password: '',
        new_password: '',
        confirm_password: ''
      },
      passwordRules: {
        old_password: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ],
        new_password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ],
        confirm_password: [
          { required: true, validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    isActivePath(path) {
      // 检查当前路由是否匹配，对于备课助手页面特殊处理
      if (path === '/teacher/course') {
        return this.$route.path === path || this.$route.path === '/teacher/ai';
      }
      return this.$route.path === path;
    },
    navigateTo(path) {
      // 如果当前在备课助手页面并且要导航到课程管理
      if (this.$route.path === '/teacher/ai' && path === '/teacher/course') {
        // 恢复之前保存的状态
        const savedState = localStorage.getItem('teacherNavState');
        if (savedState) {
          const state = JSON.parse(savedState);
          localStorage.setItem('currentTab', state.tab);
          localStorage.setItem('courseMenuOpen', state.menuOpen);
        }
      }
      
      this.$router.push(path);
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
      this.userMenuOpen = false;
      this.$router.push('/teacher/profile');
    },
    handleChangePassword() {
      this.userMenuOpen = false
      this.changePasswordVisible = true
      this.passwordForm = {
        old_password: '',
        new_password: '',
        confirm_password: ''
      }
    },
    handleLogout() {
      this.userMenuOpen = false;
      localStorage.removeItem('previousRoute');
      localStorage.removeItem('previousTab');
      localStorage.removeItem('aiPageState');
      this.$router.push('/');
    },

    // 提交修改密码
    async submitChangePassword() {
      if (!this.$refs.passwordFormRef) return
      
      try {
        await this.$refs.passwordFormRef.validate()
        
        this.submitting = true
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/change_password/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('teacherToken')}`,
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            data: {
              old_password: this.passwordForm.old_password,
              new_password: this.passwordForm.new_password,
              confirm_password: this.passwordForm.confirm_password
            }
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.code === 0) {
          ElMessage.success('密码修改成功')
          this.changePasswordVisible = false
        } else {
          ElMessage.error(data.msg || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        if (error.message.includes('status: 405')) {
          ElMessage.error('请求方法不允许，请联系管理员')
        } else {
          ElMessage.error('修改密码失败，请重试')
        }
      } finally {
        this.submitting = false
      }
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
.teacher-header-container {
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
.teacher-header {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 