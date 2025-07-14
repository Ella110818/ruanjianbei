<template>
  <div class="profile-container">
    <StudentHeader />
    
    <div class="profile-content">
      <div class="page-header">
        <h2>个人信息</h2>
      </div>

      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <el-avatar :size="100" :src="studentInfo.avatar">
              <img src="@/assets/avatar.png" alt="默认头像"/>
            </el-avatar>
            <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <el-button class="upload-btn" type="primary">更换头像</el-button>
            </el-upload>
          </div>
          <div class="basic-info">
            <h3>{{ studentInfo.name }}</h3>
            <p class="role">{{ studentInfo.className }}</p>
          </div>
        </div>

        <el-divider />

        <el-tabs v-model="activeTab" class="info-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <el-form 
              ref="formRef"
              :model="studentInfo"
              :rules="rules"
              label-width="100px"
              class="info-form"
            >
              <el-form-item label="姓名" prop="name">
                <el-input v-model="studentInfo.name" :disabled="!isEditing" />
              </el-form-item>
              <el-form-item label="学号" prop="studentId">
                <el-input v-model="studentInfo.studentId" disabled />
              </el-form-item>
              <el-form-item label="班级" prop="className">
                <el-input v-model="studentInfo.className" :disabled="!isEditing" />
              </el-form-item>
              <el-form-item label="所属院系" prop="department">
                <el-input v-model="studentInfo.department" :disabled="!isEditing" />
              </el-form-item>
              <el-form-item label="电子邮箱" prop="email">
                <el-input v-model="studentInfo.email" :disabled="!isEditing" />
              </el-form-item>
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="studentInfo.phone" :disabled="!isEditing" />
              </el-form-item>
              <el-form-item label="宿舍" prop="dormitory">
                <el-input v-model="studentInfo.dormitory" :disabled="!isEditing" />
              </el-form-item>

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
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="学习概况" name="study">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ studentInfo.courseCount }}</div>
                <div class="stat-label">在修课程</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ studentInfo.creditCount }}</div>
                <div class="stat-label">已修学分</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ studentInfo.gpa }}</div>
                <div class="stat-label">平均绩点</div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
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

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import StudentHeader from '@/components/StudentHeader.vue'
import { getCurrentUser } from '@/api'

const activeTab = ref('basic')
const isEditing = ref(false)
const formRef = ref(null)
const loading = ref(false)
const passwordDialogVisible = ref(false)

const studentInfo = reactive({
  name: '',
  studentId: '',
  className: '',
  department: '',
  email: '',
  phone: '',
  dormitory: '',
  avatar: '',
  courseCount: 0,
  creditCount: 0,
  gpa: '0.0'
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
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  department: [{ required: true, message: '请输入所属院系', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  dormitory: [{ required: true, message: '请输入宿舍', trigger: 'blur' }]
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
    if (response.code === 0 && response.data) {
      const data = response.data
      Object.assign(studentInfo, {
        name: data.name || '',
        studentId: data.username || '',
        className: data.class_name || '',
        department: data.department || '',
        email: data.email || '',
        phone: data.phone || '',
        dormitory: data.dormitory || '',
        avatar: data.avatar || '',
        courseCount: data.course_count || 0,
        creditCount: data.credit_count || 0,
        gpa: data.gpa || '0.0'
      })
    } else {
      ElMessage.error(response.msg || '获取用户信息失败')
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
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    // TODO: 调用API保存修改
    ElMessage.success('保存成功')
    isEditing.value = false
  } catch (error) {
    if (error !== 'validation') {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    }
  }
}

const showPasswordDialog = () => {
  passwordDialogVisible.value = true
}

const changePassword = async () => {
  // TODO: 实现修改密码逻辑
  ElMessage.success('密码修改成功')
  passwordDialogVisible.value = false
}

const handleAvatarSuccess = (response) => {
  studentInfo.avatar = response.url
  ElMessage.success('头像上传成功')
}

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
  }
  return isJPG && isLt2M
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

:deep(.info-tabs .el-tabs__content) {
  padding-top: 20px;
}
</style> 