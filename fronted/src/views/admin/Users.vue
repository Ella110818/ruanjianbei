<template>
  <div class="page-content">
    <AdminHeader />
    <animated-background />
    <div class="gray-space"></div>
    <div class="content-wrapper">
      <div class="search-section">
        <el-button type="primary" @click="handleAddUser">添加用户</el-button>
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名/姓名/角色"
          :prefix-icon="Search"
          clearable
          @clear="handleSearch"
          @input="handleSearch"
          class="search-input"
        >
        </el-input>
        <el-select v-model="roleFilter" placeholder="角色筛选" @change="handleSearch" class="filter-select">
          <el-option label="全部" value=""></el-option>
          <el-option label="教师" value="teacher"></el-option>
          <el-option label="学生" value="student"></el-option>
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态筛选" @change="handleSearch" class="filter-select">
          <el-option label="全部" value=""></el-option>
          <el-option label="正常" value="active"></el-option>
          <el-option label="禁用" value="disabled"></el-option>
        </el-select>
      </div>

      <div class="table">
        <el-table :data="userList" stripe border class="user-table" v-loading="loading">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="username" label="用户名" min-width="120" align="center" />
          <el-table-column prop="name" label="姓名" min-width="120" align="center" />
          <el-table-column prop="role" label="角色" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.role === 'teacher' ? 'success' : 'warning'" class="role-tag">
                {{ row.role === 'teacher' ? '教师' : '学生' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="200" align="center" show-overflow-tooltip />
          <el-table-column prop="lastLogin" label="最后登录时间" min-width="180" align="center" />
          <el-table-column prop="status" label="状态" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'" class="status-tag">
                {{ row.status === 'active' ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
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
                  :class="['blue-button', row.status === 'active' ? 'danger' : '']"
                  @click="handleToggleStatus(row)"
                >
                  {{ row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
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
    </div>

    <!-- 用户表单对话框 -->
    <el-dialog 
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="userForm" :rules="rules" ref="userForm" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="dialogType === 'edit'"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="教师" value="teacher"></el-option>
            <el-option label="学生" value="student"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Search } from '@element-plus/icons-vue'
import AdminHeader from '@/components/AdminHeader.vue'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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
      searchQuery: '',
      roleFilter: '',
      statusFilter: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogType: 'add',
      userList: [
        {
          username: 'teacher1',
          name: '张老师',
          role: 'teacher',
          email: 'teacher1@example.com',
          lastLogin: '2024-03-15 10:30:00',
          status: 'active'
        },
        {
          username: 'student1',
          name: '李同学',
          role: 'student',
          email: 'student1@example.com',
          lastLogin: '2024-03-14 15:20:00',
          status: 'active'
        }
      ],
      userForm: {
        username: '',
        name: '',
        role: '',
        email: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    getRoleTagType(role) {
      const types = {
        admin: 'danger',
        teacher: 'warning',
        student: 'success'
      }
      return types[role] || 'info'
    },
    getRoleLabel(role) {
      const labels = {
        admin: '管理员',
        teacher: '教师',
        student: '学生'
      }
      return labels[role] || role
    },
    handleSearch() {
      // 实现搜索逻辑
      console.log('搜索条件：', {
        query: this.searchQuery,
        role: this.roleFilter,
        status: this.statusFilter
      })
    },
    handleAddUser() {
      this.dialogType = 'add'
      this.userForm = {
        username: '',
        name: '',
        role: '',
        email: '',
        password: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogType = 'edit'
      this.userForm = { ...row }
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
        // 实现重置密码逻辑
        ElMessage.success('密码重置成功')
      } catch {
        // 用户取消操作
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
        // 实现状态切换逻辑
        row.status = row.status === 'active' ? 'disabled' : 'active'
        ElMessage.success(`${action}成功`)
      } catch {
        // 用户取消操作
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      // 重新加载数据
    },
    handleCurrentChange(val) {
      this.currentPage = val
      // 重新加载数据
    },
    async handleSubmitForm() {
      try {
        await this.$refs.userForm.validate()
        // 实现表单提交逻辑
        ElMessage.success(this.dialogType === 'add' ? '添加成功' : '修改成功')
        this.dialogVisible = false
      } catch {
        // 表单验证失败
      }
    }
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