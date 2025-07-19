<template>
  <div class="page-content">
    <AdminHeader />
    <animated-background />
    <div class="gray-space"></div>
    <div class="content-wrapper" v-loading="loading">
      <div class="search-section">
        <el-button type="primary" @click="handleAddUser">添加用户</el-button>
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名/姓名/角色"
          :prefix-icon="Search"
          clearable
          @clear="handleSearchInput"
          @input="handleSearchInput"
          class="search-input"
        >
        </el-input>
        <el-select v-model="roleFilter" placeholder="角色筛选" @change="handleFilterChange" class="filter-select">
          <el-option label="全部" value=""></el-option>
          <el-option label="教师" value="teacher"></el-option>
          <el-option label="学生" value="student"></el-option>
        </el-select>
       
      </div>

      <div class="table">
        <el-table :data="userList" stripe border class="user-table" v-loading="loading">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="username" label="用户名" min-width="120" align="center" />
          <el-table-column prop="role" label="角色" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.role === 'teacher' ? 'success' : 'warning'" class="role-tag">
                {{ row.role === 'teacher' ? '教师' : '学生' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="200" align="center" show-overflow-tooltip />
          <el-table-column label="操作" min-width="220" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="small"
                  class="blue-button"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  class="blue-button"
                  @click="handleResetPassword(row)"
                >
                  重置密码
                </el-button>
                <el-button 
                  type="primary" 
                  size="small"
                  class="blue-button danger"
                  @click="handleDelete(row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container" v-if="userList && userList.length > 0">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        >
        </el-pagination>
      </div>

      <el-empty v-if="!loading && (!userList || userList.length === 0)" description="暂无数据" />
    </div>

    <!-- 用户表单对话框 -->
    <el-dialog 
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form 
        ref="userForm"
        :model="userForm"
        :rules="rules"
        label-width="100px"
        class="info-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="dialogType === 'edit'"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" type="email"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="password2" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password2" type="password"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="教师" value="teacher"></el-option>
            <el-option label="学生" value="student"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="姓" prop="first_name">
          <el-input v-model="userForm.first_name"></el-input>
        </el-form-item>
        <el-form-item label="名" prop="last_name">
          <el-input v-model="userForm.last_name"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import AdminHeader from '@/components/AdminHeader.vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { API_CONFIG } from '@/api'
import { Search } from '@element-plus/icons-vue'

export default {
  name: 'AdminUsers',
  components: {
    AdminHeader,
    AnimatedBackground
  },
  setup() {
    return {
      Search
    }
  },
  data() {
    return {
      loading: false,
      submitting: false,
      searchQuery: '',
      roleFilter: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogType: 'add',
      userList: [],
      userForm: {
        username: '',
        email: '',
        password: '',
        password2: '',
        role: '',
        first_name: '',
        last_name: '',
        id: null // 新增用于存储用户ID
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
          { pattern: /^[\w@+-]+$/, message: '只能包含字母、数字和@/./+/-/_', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
          { max: 254, message: '邮箱长度不能超过254个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ],
        password2: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (value !== this.userForm.password) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchUserList()
  },
  methods: {
    // 修改加载用户列表函数
    async fetchUserList() {
      this.loading = true
      try {
        // 检查认证令牌
        const token = localStorage.getItem('token')
        if (!token) {
          ElMessage.error('未登录或登录已过期，请重新登录')
          return
        }

        // 构建查询参数
        const params = {
          page: this.currentPage,
          page_size: this.pageSize,
          ordering: '-created_at'  // 按创建时间倒序
        }
        
        // 添加搜索条件
        if (this.searchQuery.trim()) {
          params.search = this.searchQuery.trim()
        }

        // 添加角色筛选
        if (this.roleFilter) {
          params.role = this.roleFilter
        }

        // 添加状态筛选
        if (this.statusFilter) {
          params.status = this.statusFilter
        }

        const queryString = new URLSearchParams(params).toString()
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/?${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            return
          }
          throw new Error(`获取用户列表失败: ${response.status}`)
        }

        const data = await response.json()
        if (data.success && data.status_code === 200) {  // 修改这里，使用正确的响应格式
          this.userList = data.data.results
          this.total = data.data.count
        } else {
          throw new Error(data.message || '获取用户列表失败')
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
        ElMessage.error(error.message || '获取用户列表失败')
      } finally {
        this.loading = false
      }
    },
    
    // 搜索输入处理函数 - 使用防抖
    handleSearchInput: debounce(function() {
      this.currentPage = 1  // 重置到第一页
      this.fetchUserList()
    }, 300),
    
    // 筛选器改变处理函数
    handleFilterChange() {
      this.currentPage = 1  // 重置到第一页
      this.fetchUserList()
    },
    
    handleAddUser() {
      this.dialogType = 'add'
      this.userForm = {
        username: '',
        email: '',
        password: '',
        password2: '',
        role: '',
        first_name: '',
        last_name: '',
        id: null
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogType = 'edit'
      this.userForm = {
        username: row.username,
        role: row.role,
        email: row.email,
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        id: row.id  // 保存用户ID用于编辑
      }
      this.dialogVisible = true
    },
    async handleResetPassword(row) {
      try {
        await ElMessageBox.confirm(
          `确定要重置 ${row.name} 的密码吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 使用正确的参数格式
        const defaultPassword = '123456'
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/change_password/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            data: {
              old_password: defaultPassword,  // 旧密码
              new_password: defaultPassword,  // 新密码
              confirm_password: defaultPassword  // 确认密码
            }
          })
        })

        const data = await response.json()
        
        if (response.ok && data.code === 0) {
          ElMessage.success(`密码重置成功，新密码为：${defaultPassword}`)
        } else {
          throw new Error(data.msg || '密码重置失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('重置密码失败:', error)
          ElMessage.error(error.message || '重置密码失败，请稍后重试')
        }
      }
    },
    async handleToggleStatus(row) {
      const action = row.status === 'active' ? '禁用' : '启用'
      try {
        await ElMessageBox.confirm(
          `确定要${action}用户 ${row.name} 吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const token = localStorage.getItem('token')
        if (!token) {
          ElMessage.error('未登录或登录已过期，请重新登录')
          return
        }
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/${row.id}/toggle_status/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            return
          }
          throw new Error(`${action}用户失败: ${response.status}`)
        }

        const data = await response.json()
        if (data.code === 0) {
          row.status = row.status === 'active' ? 'disabled' : 'active'
          ElMessage.success(`${action}成功`)
        } else {
          throw new Error(data.msg || `${action}失败`)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error(`${action}用户失败:`, error)
          ElMessage.error(error.message || `${action}失败`)
        }
      }
    },
    async handleDelete(row) {
      try {
        await ElMessageBox.confirm(
          `确定要删除用户 ${row.username} 吗？此操作不可恢复！`,
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const token = localStorage.getItem('token')
        if (!token) {
          ElMessage.error('未登录或登录已过期，请重新登录')
          return
        }
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/users/${row.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            return
          }
          throw new Error(`删除用户失败: ${response.status}`)
        }

        if (response.status === 204) {
          ElMessage.success('删除成功');
          this.fetchUserList(); // 刷新用户列表
        } else {
          const data = await response.json();
          throw new Error(data.msg || '删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除用户失败:', error);
          ElMessage.error(error.message || '删除失败');
        }
      }
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchUserList()
    },
    // 修改添加用户部分的代码
    async handleSubmitForm() {
      if (!this.$refs.userForm) return
      
      try {
        await this.$refs.userForm.validate()
        this.submitting = true
        
        // 检查认证令牌
        const token = localStorage.getItem('token')
        if (!token) {
          ElMessage.error('未登录或登录已过期，请重新登录')
          return
        }
        
        if (this.dialogType === 'add') {
          // 添加用户
          const userData = {
            username: this.userForm.username,
            email: this.userForm.email,
            password: this.userForm.password,
            password2: this.userForm.password2,
            first_name: this.userForm.first_name || '',
            last_name: this.userForm.last_name || '',
            role: this.userForm.role
          }

          console.log('准备发送的用户数据:', userData)

          const response = await fetch(`${API_CONFIG.BASE_URL}/users/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(userData)  // 直接发送用户数据对象
          });

          if (!response.ok) {
            if (response.status === 401) {
              ElMessage.error('登录已过期，请重新登录')
              return
            }
            const errorData = await response.json()
            throw new Error(errorData.message || `添加用户失败: ${response.status}`)
          }

          const data = await response.json();
          console.log('创建用户响应:', data);
          
          if (data.success && data.status_code === 201) {
            ElMessage.success('添加用户成功')
            this.dialogVisible = false
            this.fetchUserList()
          } else {
            throw new Error(data.message || '添加用户失败')
          }
        } else {
          // 编辑用户
          const userData = {
            email: this.userForm.email,
            role: this.userForm.role,
            first_name: this.userForm.first_name || '',
            last_name: this.userForm.last_name || ''
          }

          console.log('准备发送的编辑数据:', userData)

          const response = await fetch(`${API_CONFIG.BASE_URL}/users/${this.userForm.id}/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(userData)  // 直接发送用户数据对象
          });

          if (!response.ok) {
            if (response.status === 401) {
              ElMessage.error('登录已过期，请重新登录')
              return
            }
            throw new Error(`编辑用户失败: ${response.status}`)
          }

          const data = await response.json();
          console.log('编辑用户响应:', data);
          
          if (data.success && data.status_code === 200) {  // 修改这里
            ElMessage.success('编辑用户成功')
            this.dialogVisible = false
            this.fetchUserList()
          } else {
            throw new Error(data.message || '编辑用户失败')
          }
        }
      } catch (error) {
        console.error(this.dialogType === 'add' ? '添加用户失败:' : '编辑用户失败:', error)
        ElMessage.error(error.message || (this.dialogType === 'add' ? '添加用户失败' : '编辑用户失败'))
      } finally {
        this.submitting = false
      }
    }
  }
}

// 防抖函数
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  max-width: 1480px;
  min-height: calc(100vh - 24px);
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  background-color: transparent;
  z-index: 1;
  isolation: isolate;
  margin-top: 34px;
}

.gray-space {
  height: 12px;
  background-color: transparent;
}

.content-wrapper {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 
    rgba(99, 147, 244, 0.2) 0px 0px 0px 2px,
    rgba(99, 147, 244, 0.15) 0px 4px 16px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
  margin-top: 40px;
}

.search-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  border: 1px solid rgba(99, 147, 244, 0.2);
  box-shadow: 0 2px 8px rgba(99, 147, 244, 0.1);
  gap: 16px;
}

.search-input {
  width: 400px !important;
  margin: 0 20px 0 30px !important;
  :deep(.el-input__wrapper) {
    border: 1px solid rgba(99, 147, 244, 0.2);
    box-shadow: 0 2px 6px rgba(99, 147, 244, 0.08);
    &:hover {
      border-color: rgba(99, 147, 244, 0.4);
    }
    &.is-focus {
      border-color: rgba(99, 147, 244, 0.6);
      box-shadow: 0 0 0 2px rgba(99, 147, 244, 0.1);
    }
  }
}

.filter-select {
  width: 240px;
  :deep(.el-input__wrapper) {
    border: 1px solid rgba(99, 147, 244, 0.2);
    box-shadow: 0 2px 6px rgba(99, 147, 244, 0.08);
    &:hover {
      border-color: rgba(99, 147, 244, 0.4);
    }
    &.is-focus {
      border-color: rgba(99, 147, 244, 0.6);
      box-shadow: 0 0 0 2px rgba(99, 147, 244, 0.1);
    }
  }
}

.table {
  background-color: white;
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(99, 147, 244, 0.15);
  box-shadow: 0 2px 12px rgba(99, 147, 244, 0.08);
}

:deep(.el-table) {
  border: none;
  
  &::before {
    display: none;
  }
  
  .el-table__header-wrapper {
    background-color: #f0f7ff;
    
    th.el-table__cell {
      background-color: #f0f7ff !important;
      color: #333;
      font-weight: 600;
      border-bottom: none;
      height: 50px;
    }
  }

  .el-table__body-wrapper {
    .el-table__row {
      td {
        border-bottom: 1px solid rgba(99, 147, 244, 0.1);
        height: 60px;
      }
      
      &:hover {
        td {
          background-color: rgba(99, 147, 244, 0.05);
        }
      }
    }
  }
}

.user {
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  border: 2px solid #ebeef5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.blue-button {
  padding: 6px 12px;
  font-size: 13px;
  height: 32px;
  min-width: 68px;
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s;
  border: none;
  
  &:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &.danger {
    background-color: #F56C6C;
    border-color: #F56C6C;
    
    &:hover {
      background-color: #f78989;
      border-color: #f78989;
    }
  }
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  
  .el-dialog__header {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #e0e6f0;
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .el-dialog__footer {
    border-top: 1px solid #e0e6f0;
    padding: 16px 24px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-tag) {
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: 500;
}

:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
  padding: 16px;
  background: transparent;
  
  .btn-prev,
  .btn-next {
    background: transparent;
    border: 1px solid rgba(99, 147, 244, 0.2);
    &:hover {
      color: #409eff;
    }
  }
  
  .el-pager li {
    background: transparent;
    border: 1px solid rgba(99, 147, 244, 0.2);
    &.active {
      background-color: #409eff;
      color: white;
      border-color: #409eff;
    }
    &:hover {
      color: #409eff;
    }
  }
}

.user-table {
  :deep(.el-table__header) {
    th {
      background-color: #f5f7fa !important;
      color: #606266;
      font-weight: 600;
      height: 50px;
      padding: 8px 0;
    }
  }

  :deep(.el-table__body) {
    td {
      padding: 8px 0;
      height: 50px;
    }
  }

  .role-tag, .status-tag {
    padding: 4px 12px;
    border-radius: 4px;
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  
  .el-button {
    padding: 6px 12px;
    min-width: 68px;
    height: 32px;
    margin: 0;
  }
}
</style> 