<template>
  <div class="live-class-container">
    <TeacherHeader />
    <div class="main-container">
      <div class="class-header">
        <div class="class-info">
          <el-button 
            type="info" 
            size="small" 
            plain
            @click="router.push('/teacher/start-class')"
            style="margin-right: 16px;">
            返回课程列表
          </el-button>
          <h1>{{ courseName }}</h1>
          <div class="course-details">
            <span class="detail-item">
              <el-icon><Location /></el-icon> 理科楼301
            </span>
            <span class="detail-item">在场学生：{{ onlineCount }}人</span>
            <span class="live-badge">实时授课中</span>
          </div>
        </div>
        <div class="header-actions">
          <el-button 
            v-if="!isRecording" 
            type="danger" 
            @click="startRecording" 
            size="small" 
            :icon="VideoCamera"
            :disabled="!cameraActive">开始录制</el-button>
          <el-button 
            v-else 
            type="warning" 
            @click="stopRecording" 
            size="small" 
            :icon="VideoCamera">停止录制</el-button>
          <el-button type="danger" @click="endClass" size="small" :icon="CircleClose">结束授课</el-button>
        </div>
      </div>

      <div class="class-content">
        <div class="main-content">
          <div class="video-container">
            <!-- 固定视频播放 -->
            <video 
              ref="videoRef" 
              class="camera-video" 
              autoplay
              loop
              v-show="!processedFrame"
            >
              <source src="/videos/2025.mp4" type="video/mp4">
              您的浏览器不支持视频播放。
            </video>
            
            <!-- 处理后的视频帧展示 -->
            <div class="processed-frame-container" v-if="processedFrame">
              <img :src="'data:image/jpeg;base64,'+processedFrame" class="processed-frame" alt="处理后的视频" />
              <div class="video-overlay">
                <div class="face-stats">
                  <div class="stat-item">
                    <el-icon><User /></el-icon>
                    <span>检测到 {{ faceCount }} 张人脸</span>
                  </div>
                  <div class="stat-item" v-if="detectedStudents.length > 0">
                    <el-icon><Avatar /></el-icon>
                    <span>识别到 {{ detectedStudents.length }} 位学生</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 视频未加载时的占位符 -->
            <div v-if="!videoLoaded" class="video-placeholder">
              <div class="placeholder-content">
                <div class="title">视频画面</div>
                <div class="subtitle">正在加载视频...</div>
              </div>
            </div>
          </div>
        </div>

        <div class="interaction-panel">
          <div class="panel-header">
            <h3>学生列表 ({{ studentCount }})</h3>
            <el-input 
              v-model="searchQuery"
              placeholder="搜索学生" 
              :prefix-icon="Search"
              size="small"
              style="width: 150px;"
            ></el-input>
          </div>
          <div class="student-items">
            <div 
              class="student-item" 
              v-for="(student, index) in filteredStudentList" 
              :key="index"
              :class="{'student-detected': detectedStudents.includes(student.name)}"
            >
              <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" alt="学生头像" class="student-avatar">
              <div class="student-info">
                <span class="student-name">{{ student.name }}</span>
                <el-tag 
                  size="small" 
                  :type="detectedStudents.includes(student.name) ? 'success' : 'info'"
                >
                  {{ detectedStudents.includes(student.name) ? '已检测' : '未到' }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="chat-panel">
            <div class="panel-header">
              <h3>课堂互动</h3>
            </div>
            <div class="chat-messages">
              <div class="message-item" v-for="(message, index) in chatMessages" :key="index">
                <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" alt="头像" class="message-avatar">
                <div class="message-content">
                  <div class="message-header">
                    <span class="message-sender">{{ message.sender }}</span>
                    <span class="message-time">{{ message.time }}</span>
                  </div>
                  <p class="message-text">{{ message.text }}</p>
                </div>
              </div>
            </div>
            <div class="message-input">
              <el-input 
                type="textarea" 
                :rows="2" 
                placeholder="输入消息..." 
                v-model="chatMessage"
                @keyup.enter="sendMessage"
              ></el-input>
              <el-button type="primary" @click="sendMessage">发送</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="control-panel">
        <el-button-group>
          <el-button type="primary" size="default" :icon="Microphone">麦克风</el-button>
          <el-button 
            :type="cameraActive ? 'success' : 'primary'" 
            size="default" 
            :icon="VideoCamera"
            @click="toggleCamera">摄像头</el-button>
          <el-button type="success" size="default" :icon="Check" @click="captureImage">点名</el-button>
          <el-button type="info" size="default" :icon="DataAnalysis">课堂统计</el-button>
        </el-button-group>
      </div>

      <!-- 预览对话框 -->
      <el-dialog
        v-model="previewVisible"
        title="签到照片预览"
        width="50%"
        :before-close="handleClosePreview"
      >
        <div class="preview-container">
          <img :src="previewImage" class="preview-image" alt="签到照片" />
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleClosePreview">取消</el-button>
            <el-button type="primary" :loading="uploadLoading" @click="handleConfirmUpload">开始点名</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 点名结果对话框 -->
      <el-dialog
        v-model="attendanceResultVisible"
        title="点名结果"
        width="60%"
      >
        <div class="attendance-result">
          <el-alert
            v-if="attendanceResult.message"
            :title="attendanceResult.message"
            type="success"
            :closable="false"
            class="mb-20"
          />
          
          <el-table :data="attendanceResult.attendance_records" border>
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="present" label="出勤状态">
              <template #default="scope">
                <el-tag :type="scope.row.present ? 'success' : 'danger'">
                  {{ scope.row.present ? '已到' : '未识别' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="attendanceResultVisible = false">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoCamera, CircleClose, Microphone, DataAnalysis, User, Avatar, Search, Check, Location } from '@element-plus/icons-vue'
import TeacherHeader from '@/components/TeacherHeader.vue'

const router = useRouter()
const route = useRoute()

// 基本信息
const courseName = ref('')
const onlineCount = ref(0)
const videoLoaded = ref(false)

// 摄像头和视频相关
const videoRef = ref(null)
const cameraActive = ref(false)
const processedFrame = ref('')
const faceCount = ref(0)

// 学生列表相关
const studentList = ref([
  { name: '李乐', online: true },
  { name: '陈文伟', online: true },
  { name: '杨依林', online: true },
  { name: '宋嘉怡', online: true },
  { name: '马莉岚', online: true },
  { name: '谢宛桐', online: true },
  { name: '汤燕', online: true }
])
const studentCount = computed(() => studentList.value.length)
const searchQuery = ref('')
const detectedStudents = ref([])

// 录制相关
const isRecording = ref(false)
const mediaRecorder = ref(null)
const recordedChunks = ref([])

// 预览相关
const previewVisible = ref(false)
const previewImage = ref('')
const uploadLoading = ref(false)

// 点名结果
const attendanceResultVisible = ref(false)
const attendanceResult = ref({
  message: '',
  attendance_records: []
})

// 课堂互动
const chatMessages = ref([
  { sender: '教师', text: '大家好，欢迎来到今天的课程。', time: '10:00' },
  { sender: '棠盐', text: '老师好！', time: '10:01' },
  { sender: '教师', text: '请同学们保持安静，开始上课。', time: '10:02' },
  { sender: '李乐', text: '好的，老师。', time: '10:03' }
])
const chatMessage = ref('')

// 过滤学生列表
const filteredStudentList = computed(() => {
  if (!searchQuery.value) return studentList.value
  const query = searchQuery.value.toLowerCase()
  return studentList.value.filter(student => 
    student.name.toLowerCase().includes(query)
  )
})

// 视频加载处理
const handleVideoLoad = () => {
  videoLoaded.value = true
}

// 视频错误处理
const handleVideoError = (error) => {
  console.error('视频加载失败:', error)
  ElMessage.error('视频加载失败，请刷新页面重试')
  videoLoaded.value = false
}

// 切换摄像头
const toggleCamera = async () => {
  if (cameraActive.value) {
    stopCamera()
  } else {
    await startCamera()
  }
}

// 开启摄像头
const startCamera = async () => {
  try {
    const constraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 }
      },
      audio: false
    }
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    if (!stream) {
      ElMessage.error('无法获取摄像头流')
      return
    }
    
    videoRef.value.srcObject = stream
    cameraActive.value = true
    ElMessage.success('摄像头已开启')
  } catch (error) {
    console.error('摄像头访问错误:', error)
    ElMessage.error('无法访问摄像头：' + error.message)
  }
}

// 关闭摄像头
const stopCamera = () => {
  if (videoRef.value && videoRef.value.srcObject) {
    const stream = videoRef.value.srcObject
    stream.getTracks().forEach(track => track.stop())
    videoRef.value.srcObject = null
  }
  cameraActive.value = false
  ElMessage.info('摄像头已关闭')
}

// 开始录制
const startRecording = () => {
  if (!cameraActive.value) {
    ElMessage.warning('请先开启摄像头')
    return
  }
  
  try {
    const options = { mimeType: 'video/webm;codecs=vp9' }
    mediaRecorder.value = new MediaRecorder(videoRef.value.srcObject, options)
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }
    
    mediaRecorder.value.start(1000)
    isRecording.value = true
    ElMessage.success('录制已开始')
  } catch (error) {
    console.error('开始录制失败:', error)
    ElMessage.error('开始录制失败: ' + error.message)
  }
}

// 停止录制
const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    ElMessage.info('录制已停止')
  }
}

// 截图并点名
const captureImage = () => {
  if (!cameraActive.value) {
    ElMessage.warning('请先开启摄像头')
    return
  }

  try {
    const video = videoRef.value
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    previewImage.value = imageData
    previewVisible.value = true
  } catch (error) {
    console.error('截图失败:', error)
    ElMessage.error('截图失败：' + error.message)
  }
}

// 关闭预览
const handleClosePreview = () => {
  previewVisible.value = false
  previewImage.value = ''
}

// 确认点名
const handleConfirmUpload = async () => {
  uploadLoading.value = true
  try {
    // 点名后将所有学生标记为已到
    detectedStudents.value = studentList.value.map(student => student.name)
    
    // 模拟点名结果
    const mockResult = {
      message: '点名完成，共识别到7人',
      attendance_records: studentList.value.map(student => ({
        name: student.name,
        present: true
      }))
    }
    
    attendanceResult.value = mockResult
    handleClosePreview()
    attendanceResultVisible.value = true
    ElMessage.success('点名完成')
  } catch (error) {
    console.error('点名失败:', error)
    ElMessage.error('点名失败：' + error.message)
  } finally {
    uploadLoading.value = false
  }
}

// 发送消息
const sendMessage = () => {
  if (!chatMessage.value.trim()) return
  const newMessage = {
    sender: '教师',
    text: chatMessage.value,
    time: new Date().toLocaleTimeString()
  }
  chatMessages.value.push(newMessage)
  chatMessage.value = ''
}

// 结束上课
const endClass = () => {
  if (isRecording.value) {
    ElMessageBox.confirm(
      '您当前正在录制课程，结束授课前需要停止录制。是否继续？',
      '停止录制并结束授课',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      stopRecording()
      finishClass()
    })
  } else {
    ElMessageBox.confirm(
      '确定要结束当前课堂吗？',
      '结束上课',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      finishClass()
    })
  }
}

// 结束课程
const finishClass = () => {
  stopCamera()
  router.push('/teacher/start-class')
  ElMessage.success('课堂已结束')
}

// 设置导航状态
onMounted(() => {
  // 设置教师导航状态为"学情分析"
  localStorage.setItem('teacherNavState', JSON.stringify({ tab: 'analysis' }))
  
  const query = route.query
  if (query) {
    courseName.value = query.classTitle || query.title || '未知课程'
    onlineCount.value = studentList.value.length
  }

  // 初始化时所有学生都是未到状态
  detectedStudents.value = []

  // 添加视频事件监听
  if (videoRef.value) {
    videoRef.value.addEventListener('loadeddata', handleVideoLoad)
    videoRef.value.addEventListener('error', handleVideoError)
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  stopCamera()
  if (isRecording.value) {
    stopRecording()
  }
  // 移除视频事件监听
  if (videoRef.value) {
    videoRef.value.removeEventListener('loadeddata', handleVideoLoad)
    videoRef.value.removeEventListener('error', handleVideoError)
  }
})
</script>

<style scoped>
.live-class-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f8fc;
}

.main-container {
  flex: 1;
  padding-top: 64px;
  display: flex;
  flex-direction: column;
}

.class-header {
  height: 60px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
}

.class-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.class-info h1 {
  margin: 0;
  font-size: 18px;
  color: #1a1a1a;
  font-weight: 500;
}

.course-details {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: #f0f2f5;
}

.live-badge {
  background: linear-gradient(45deg, #ff4757, #ff6b81);
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(255, 71, 87, 0.2);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.class-content {
  flex: 1;
  display: flex;
  height: calc(100vh - 60px);
  padding: 16px;
  gap: 16px;
  background: #f6f8fc;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.video-container {
  flex: 1;
  min-height: 600px;
  background: #000;
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: 8px;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 改回 contain 以显示完整视频 */
  background: #000;
}

.processed-frame-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
}

.processed-frame {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 改为 cover 以填充整个容器 */
}

.video-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
}

.face-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
}

.placeholder-content {
  text-align: center;
}

.placeholder-content .title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.placeholder-content .subtitle {
  font-size: 14px;
  color: #666;
}

.control-panel {
  height: 64px;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #eef2f7;
  padding: 0 24px;
}

.control-panel .el-button-group {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow: hidden;
}

.control-panel .el-button {
  border: none;
  height: 40px;
  padding: 0 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.control-panel .el-button:hover {
  transform: translateY(-1px);
}

.interaction-panel {
  width: 360px;
  height: 700px;
  background: white;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.student-list {
  height: 350px; /* 减小学生列表高度 */
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #eef2f7;
}

.chat-panel {
  height: 350px; /* 增加聊天区高度 */
  display: flex;
  flex-direction: column;
}

.panel-header {
  height: 56px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-bottom: 1px solid #eef2f7;
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 500;
}

.student-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.student-items::-webkit-scrollbar {
  width: 6px;
}

.student-items::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.student-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.student-item:hover {
  background: #f8f9fa;
}

.student-detected {
  background: #f0f9eb !important;
}

.student-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.student-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.student-name {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.message-content {
  flex: 1;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-content::before {
  content: '';
  position: absolute;
  top: 10px;
  left: -10px;
  border-right: 10px solid #f0f9eb;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.message-sender {
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-text {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.message-input {
  padding: 16px;
  border-top: 1px solid #eef2f7;
  display: flex;
  gap: 12px;
  background: white;
}

.message-input .el-textarea {
  flex: 1;
}

.message-input .el-textarea__inner {
  border-radius: 8px;
  border-color: #eef2f7;
  transition: all 0.3s ease;
}

.message-input .el-textarea__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.message-input .el-button {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 500;
}

.el-tag {
  border-radius: 4px;
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
  border: none;
}

.el-tag--success {
  background: #f0f9eb;
  color: #67c23a;
}

.el-tag--info {
  background: #f4f4f5;
  color: #909399;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}
</style> 