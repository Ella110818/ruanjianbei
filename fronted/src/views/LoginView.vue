<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-content">
        <div class="logo-section">
          <h1 class="title">智能教学</h1>
        </div>

        <div class="role-selector-block">
          <div class="role-tip">请选择登录身份后登录</div>
          <div class="role-selector-btns">
            <button
              v-for="role in roles"
              :key="role.value"
              :class="['role-btn', { active: selectedRole === role.value }]"
              @click="selectedRole = role.value"
              type="button"
            >
              {{ role.label }}
            </button>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="login-form" novalidate>
          <div class="form-group">
            <div class="input-with-icon">
              <img src="@/assets/yonghuming.png" alt="用户名" class="input-icon">
              <input 
                type="text" 
                id="loginAccount" 
                v-model="formData.loginAccount" 
                :class="{'error': errors.loginAccount}"
                @blur="validateField('loginAccount')"
                placeholder="请输入用户名"
                required
              >
            </div>
            <span class="error-message" v-if="errors.loginAccount">{{ errors.loginAccount }}</span>
          </div>
          <div class="form-group">
            <div class="input-with-icon">
              <img src="@/assets/mima.png" alt="密码" class="input-icon">
              <input 
                :type="showLoginPassword ? 'text' : 'password'" 
                id="loginPassword" 
                v-model="formData.loginPassword" 
                :class="{'error': errors.loginPassword}"
                @blur="validateField('loginPassword')"
                placeholder="请输入密码" 
                required
              >
              <img 
                :src="require(`@/assets/${showLoginPassword ? 'biyan' : 'biyan'}.png`)" 
                alt="切换密码显示" 
                class="toggle-password"
                @click="showLoginPassword = !showLoginPassword"
              >
            </div>
            <span class="error-message" v-if="errors.loginPassword">{{ errors.loginPassword }}</span>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="formData.rememberMe">
              <span class="word">记住密码</span>
            </label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>
          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>登录</span>
          </button>
        </form>
      </div>

      <div class="illustration-section">
        <img src="@/assets/chahua 3.png" alt="Illustration" class="illustration">
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/index.js';

export default {
  name: 'LoginView',
  data() {
    return {
      loading: false,
      showLoginPassword: false,
      selectedRole: 'teacher', // 默认选中教师身份
      roles: [
        { label: '教师', value: 'teacher' },
        { label: '学生', value: 'student' },
        { label: '管理员', value: 'admin' }
      ],
      formData: {
        loginAccount: '',
        loginPassword: '',
        rememberMe: false
      },
      errors: {
        loginAccount: '',
        loginPassword: ''
      }
    }
  },
  methods: {
    validateField(field) {
      this.errors[field] = '';
      
      switch(field) {
        case 'loginAccount':
          if (!this.formData.loginAccount) {
            this.errors.loginAccount = '请输入用户名';
          }
          break;
          
        case 'loginPassword':
          if (!this.formData.loginPassword) {
            this.errors.loginPassword = '请输入密码';
          }
          break;
      }
    },
    
    validateForm() {
      let isValid = true;
      ['loginAccount', 'loginPassword'].forEach(field => {
        this.validateField(field);
        if (this.errors[field]) {
          isValid = false;
        }
      });
      return isValid;
    },
    
    async handleSubmit() {
      if (!this.validateForm()) {
        return;
      }
      this.loading = true;
      try {
        const res = await login(this.formData.loginAccount, this.formData.loginPassword, this.selectedRole);
        if (res.code === 0) {
          // 根据角色保存用户信息
          const roleKey = {
            teacher: 'teacherName',
            student: 'studentName',
            admin: 'adminName'
          }[this.selectedRole];
          
          // 保存用户名
          localStorage.setItem(roleKey, this.formData.loginAccount);
          
          // 根据不同角色跳转到不同页面
          const roleRoutes = {
            teacher: '/teacher',
            student: '/student',
            admin: '/admin/dashboard'
          };
          
          // 跳转到对应页面
          await this.$router.push(roleRoutes[this.selectedRole]);
        } else {
          alert(res.msg || '登录失败');
        }
      } catch (error) {
        console.error('登录失败：', error);
        alert('登录失败，请检查用户名和密码');
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  background-color: #CCE4FF;
}

.login-container::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
  height: 100%;
  background-color: #1B1B61;
}

.login-box {
  display: flex;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  width: 1380px;
  height: 740px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  margin: 20px;
}

.login-content {
  width: 50%;
  padding: 40px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
}

.logo-section {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  color: #1a1f36;
  margin-top: 80px;
  font-weight: 600;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-group {
  width: 400px;
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  background-color: #EEF4F6;
}

input:focus {
  border-color: #1B1B61;
  outline: none;
  box-shadow: 0 0 0 2px rgba(27, 27, 97, 0.1);
  background-color: #ffffff;
}

.form-options {
  width: 400px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  font-size: 14px;
  flex-direction: row;
}

.remember-me input[type="checkbox"] {
  width: auto;
  margin: 0;
  padding: 0;
}

.word {
  color: #1B1B61;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.forgot-password {
  color: #1B1B61;
  text-decoration: none;
  font-size: 14px;
}

.login-btn {
  width: 400px;
  padding: 12px;
  background: #1B1B61;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn:hover {
  background: #15154d;
}

.illustration-section {
  width: 50%;
  background: #bdd8f6;
  padding: 40px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.illustration {
  position: absolute;
  right: -1%;
  max-width: 108%;
  max-height: 100%;
  object-fit: contain;
  z-index: 2;
}

.error {
  border-color: #dc2626 !important;
}

.error-message {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  pointer-events: none;
}

.toggle-password {
  position: absolute;
  right: 12px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

input {
  padding-left: 40px !important;
  padding-right: 40px;
}

.role-selector-block {
  width: 400px;
  margin-bottom: 20px;
}
.role-tip {
  color: #999;
  font-size: 16px;
  margin-bottom: 10px;
}
.role-selector-btns {
  display: flex;
  gap: 0;
  background: #f2f6fa;
  border-radius: 14px;
  overflow: hidden;
}
.role-btn {
  flex: 1;
  padding: 9px 0;
  font-size: 18px;
  border: none;
  background: #eaf1fa;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0;
  font-weight: 500;
  outline: none;
}
.role-btn.active {
  background: linear-gradient(90deg, #1ecbff 0%, #1877ff 100%);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(24,119,255,0.08);
}
.role-btn:first-child {
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
}
.role-btn:last-child {
  border-top-right-radius: 14px;
  border-bottom-right-radius: 14px;
}

@media (max-width: 1024px) {
  .login-box {
    width: 90%;
    max-width: 600px;
  }
  
  .form-group,
  .login-btn {
    width: 100%;
    max-width: 400px;
  }
  
  .illustration-section {
    display: none;
  }
  
  .login-content {
    width: 100%;
  }

  .role-selector-block {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 480px) {
  .login-content {
    padding: 20px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  input,
  .login-btn {
    padding: 10px 14px;
  }
}
</style>
