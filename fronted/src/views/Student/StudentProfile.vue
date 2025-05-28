<template>
  <div class="profile-container">
    <div class="background-container"></div>
    <div class="overlay"></div>
    <StudentHeader />
    <div class="profile-content">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <el-avatar :size="100" :src="studentInfo.avatar" />
            <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <el-button type="primary" size="small">更换头像</el-button>
            </el-upload>
          </div>
          <div class="basic-info">
            <h2>{{ studentInfo.name }}</h2>
            <p class="title">{{ studentInfo.className }}</p>
          </div>
        </div>

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
              
              <el-form-item>
                <template v-if="!isEditing">
                  <el-button type="primary" @click="startEdit">编辑信息</el-button>
                </template>
                <template v-else>
                  <el-button type="primary" @click="saveChanges">保存</el-button>
                  <el-button @click="cancelEdit">取消</el-button>
                </template>
              </el-form-item>
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import StudentHeader from '@/components/StudentHeader.vue'

const activeTab = ref('basic')
const isEditing = ref(false)
const formRef = ref(null)

const studentInfo = reactive({
  name: '李小明',
  studentId: 'S2024001',
  className: '计算机2024级1班',
  department: '计算机科学与技术学院',
  email: 'lixm@example.com',
  phone: '13900139001',
  dormitory: '6号楼305',
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  courseCount: 6,
  creditCount: 85,
  gpa: '3.8'
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  department: [{ required: true, message: '请输入所属院系', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
  dormitory: [{ required: true, message: '请输入宿舍', trigger: 'blur' }]
}

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  formRef.value?.resetFields()
}

const saveChanges = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    // TODO: 调用API保存修改
    ElMessage.success('保存成功')
    isEditing.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleAvatarSuccess = (response) => {
  // TODO: 处理头像上传成功
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

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  width: 100%;
  position: relative;
  padding-top: 64px;
}

.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: url('@/assets/back3.png') no-repeat center center fixed;
  background-size: cover;
  z-index: -2;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.7);
  z-index: -1;
}

.profile-content {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.profile-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 
    rgba(99, 147, 244, 0.15) 0px 0px 0px 1px,
    rgba(99, 147, 244, 0.1) 0px 8px 24px;
  backdrop-filter: blur(10px);
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 30px;
  
  .el-button {
    margin-top: 10px;
  }
}

.basic-info {
  h2 {
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #303133;
  }
  
  .title {
    margin: 0;
    color: #606266;
    font-size: 16px;
  }
}

.info-tabs {
  :deep(.el-tabs__content) {
    padding-top: 20px;
  }
}

.info-form {
  max-width: 600px;
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

  &:hover {
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
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f8f9fa;
}
</style> 