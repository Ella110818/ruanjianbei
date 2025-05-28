<template>
  <div class="users-container">
    <AdminHeader />
    
    <div class="users-content">
      <div class="page-header">
        <h2>用户管理</h2>
        <el-button type="primary" @click="handleAddUser">添加用户</el-button>
      </div>

      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名/姓名/角色"
          prefix-icon="el-icon-search"
          clearable
          @clear="handleSearch"
          @input="handleSearch"
        >
        </el-input>
        <el-select v-model="roleFilter" placeholder="角色筛选" @change="handleSearch">
          <el-option label="全部" value=""></el-option>
          <el-option label="教师" value="teacher"></el-option>
          <el-option label="学生" value="student"></el-option>
          <el-option label="管理员" value="admin"></el-option>
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态筛选" @change="handleSearch">
          <el-option label="全部" value=""></el-option>
          <el-option label="正常" value="active"></el-option>
          <el-option label="禁用" value="disabled"></el-option>
        </el-select>
      </div>

      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用户名" width="150"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">{{ getRoleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="lastLogin" label="最后登录时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button 
              type="text" 
              :class="row.status === 'active' ? 'danger' : ''"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
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
            <el-option label="管理员" value="admin"></el-option>
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
import AdminHeader from '@/components/AdminHeader.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AdminUsers',
  components: {
    AdminHeader
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
      dialogType: 'add', // 'add' 或 'edit'
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

<style scoped>
.users-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.users-content {
  padding: 84px 20px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #2C3E50;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-bar .el-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.danger {
  color: #F56C6C;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-dialog__body) {
  padding-top: 10px;
}
</style> 