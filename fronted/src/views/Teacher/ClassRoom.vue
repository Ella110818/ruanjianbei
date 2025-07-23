<template>
  <div class="classroom-layout">
    <TeacherHeader />
    <div class="main-container">
      <TeacherClassSidebar v-model:sideTab="sideTab" />
      <div class="content-area">
        <div class="classroom-container" v-loading="loading">
          <div class="classroom-header">
            <h2>{{ classInfo.title || '课堂进行中' }}</h2>
            <div class="class-meta">
              <span class="time">已进行: {{ formatDuration(elapsedTime) }}</span>
              <el-tag type="success" effect="dark">进行中</el-tag>
            </div>
          </div>
          
          <!-- 课堂内容区域 -->
          <div class="classroom-content">
            <el-empty description="课堂功能开发中..." />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherClassSidebar from '@/components/TeacherClassSidebar.vue'
import { API_CONFIG } from '@/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const sideTab = ref('start-class')
const classInfo = ref({})
const elapsedTime = ref(0)
const loading = ref(false)
let timer = null

// 格式化持续时间
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}小时${mins}分钟`
}

// 开始计时
const startTimer = () => {
  timer = setInterval(() => {
    elapsedTime.value++
  }, 60000) // 每分钟更新一次
}

// 获取课堂信息
const fetchClassInfo = async (classId) => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.error('未登录或登录已过期')
      throw new Error('未登录或登录已过期')
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/classes/${classId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    })

    const data = await response.json()
    if (data.success && data.status_code === 200) {
      classInfo.value = data.data
      // 如果有开始时间，计算已经过去的时间
      if (data.data.started_at) {
        const startTime = new Date(data.data.started_at)
        const now = new Date()
        elapsedTime.value = Math.floor((now - startTime) / 60000) // 转换为分钟
      }
    } else {
      ElMessage.error(data.message || '获取课堂信息失败')
    }
  } catch (error) {
    console.error('获取课堂信息失败:', error)
    ElMessage.error(error.message || '获取课堂信息失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const classId = route.params.id
  await fetchClassInfo(classId)
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.classroom-layout {
  min-height: 100vh;
  background: #f5f7ff;
}

.main-container {
  display: flex;
  padding-top: 64px;
}

.content-area {
  flex: 1;
  margin-left: 300px;
  min-height: calc(100vh - 64px);
  padding: 24px;
}

.classroom-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.classroom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.classroom-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.class-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time {
  font-size: 14px;
  color: #666;
}

.classroom-content {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

@media screen and (max-width: 1366px) {
  .content-area {
    margin-left: 180px;
  }
}

@media screen and (max-width: 1024px) {
  .content-area {
    margin-left: 160px;
  }
}
</style> 