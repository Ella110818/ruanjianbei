<template>
  <div class="profile-container">
    <AdminHeader />
    
    <div class="profile-content">
      <div class="page-header">
        <h2>个人信息</h2>
      </div>

      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <el-avatar :size="100" :src="adminInfo.avatar">
              <img src="@/assets/avatar.png" alt="默认头像"/>
            </el-avatar>
            <el-button class="upload-btn" type="primary" @click="handleAvatarUpload">更换头像</el-button>
          </div>
          <div class="basic-info">
            <h3>{{ adminInfo.name }}</h3>
            <p class="role">超级管理员</p>
          </div>
        </div>

        <el-divider />

        <el-form 
          ref="infoForm"
          :model="adminInfo"
          :rules="rules"
          label-width="100px"
          class="info-form">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="adminInfo.username" disabled />
          </el-form-item>
          
          <el-form-item label="姓名" prop="name">
            <el-input v-model="adminInfo.name" :disabled="!isEditing" />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="adminInfo.email" :disabled="!isEditing" />
          </el-form-item>
          
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="adminInfo.phone" :disabled="!isEditing" />
          </el-form-item>
          
          <el-form-item label="所属部门" prop="department">
            <el-input v-model="adminInfo.department" :disabled="!isEditing" />
          </el-form-item>
          
          <el-form-item label="职位" prop="position">
            <el-input v-model="adminInfo.position" :disabled="!isEditing" />
          </el-form-item>
          
          <el-form-item label="入职时间" prop="joinDate">
            <el-date-picker
              v-model="adminInfo.joinDate"
              type="date"
              :disabled="!isEditing"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          
          <el-form-item label="个人简介" prop="bio">
            <el-input
              v-model="adminInfo.bio"
              type="textarea"
              :rows="4"
              :disabled="!isEditing"
            />
          </el-form-item>
        </el-form>

        <div class="form-actions">
          <template v-if="!isEditing">
            <el-button type="primary" @click="startEdit">编辑信息</el-button>
            <el-button @click="showPasswordDialog">修改密码</el-button>
          </template>
          <template v-else>
            <el-button type="primary" @click="saveChanges">保存更改</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      v-model="passwordDialogVisible"
      width="400px"
    >
      <el-form
        ref="passwordForm"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changePassword">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import AdminHeader from '@/components/AdminHeader.vue'
import { ElMessage } from 'element-plus'
import { getCurrentUser } from '@/api'

export default {
  name: 'AdminProfile',
  components: {
    AdminHeader
  },
  setup() {
    const isEditing = ref(false)
    const passwordDialogVisible = ref(false)
    const loading = ref(false)

    const adminInfo = reactive({
      username: '',
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      joinDate: '',
      bio: '',
      avatar: ''
    })

    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const rules = {
      name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ]
    }

    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }

    const fetchUserInfo = async () => {
      loading.value = true
      try {
        const response = await getCurrentUser()
        if (response.success && response.status_code === 200) {
          const data = response.data
          Object.assign(adminInfo, {
            username: data.username || '',
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            department: data.department || '',
            position: data.position || '',
            joinDate: data.join_date || '',
            bio: data.bio || '',
            avatar: data.avatar || ''
          })
        } else {
          ElMessage.error(response.message || '获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchUserInfo()
    })

    const startEdit = () => {
      isEditing.value = true
    }

    const cancelEdit = () => {
      isEditing.value = false
      fetchUserInfo() // 重新加载数据
    }

    const saveChanges = async () => {
      try {
        // TODO: 实现保存逻辑
        ElMessage.success('保存成功')
        isEditing.value = false
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }

    const showPasswordDialog = () => {
      passwordDialogVisible.value = true
    }

    const changePassword = () => {
      // TODO: 实现修改密码逻辑
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
    }

    const handleAvatarUpload = () => {
      // TODO: 实现头像上传逻辑
    }

    return {
      isEditing,
      adminInfo,
      rules,
      passwordDialogVisible,
      passwordForm,
      passwordRules,
      loading,
      startEdit,
      cancelEdit,
      saveChanges,
      showPasswordDialog,
      changePassword,
      handleAvatarUpload
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #E8F5E9 0%, #F1F8E9 50%, #FFFFFF 100%);
}

.profile-content {
  padding: 84px 24px 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  background: #FFFFFF;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1A1F36;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header h2::before {
  content: '';
  width: 4px;
  height: 24px;
  background: #409EFF;
  border-radius: 2px;
  display: inline-block;
}

.profile-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 32px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-btn {
  font-size: 14px;
}

.basic-info {
  flex: 1;
}

.basic-info h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #1A1F36;
}

.role {
  margin: 0;
  color: #409EFF;
  font-size: 16px;
}

.info-form {
  max-width: 600px;
  margin: 32px auto;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #F5F7FA;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-button--primary) {
  padding: 12px 24px;
  font-weight: 500;
}

:deep(.el-divider) {
  margin: 24px 0;
}
</style> 