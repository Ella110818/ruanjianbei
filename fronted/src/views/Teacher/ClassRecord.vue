<template>
  <div class="class-record-container">
    <TeacherHeader />
    <div class="main-container">
      <TeacherClassSidebar v-model:sideTab="currentSideTab" />
      <div class="content-area">
        <div class="record-header">
          <h2>课堂记录</h2>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索课程"
              :prefix-icon="Search"
              clearable
              class="search-input"
            />
            <el-select v-model="timeRange" placeholder="最近一周" class="time-select">
              <el-option label="最近一周" value="week" />
              <el-option label="最近一月" value="month" />
              <el-option label="最近三月" value="quarter" />
              <el-option label="全部" value="all" />
            </el-select>
          </div>
        </div>

        <div class="record-list">
          <el-table 
            :data="records" 
            style="width: 100%"
          >
            <el-table-column prop="date" label="上课时间" min-width="180">
              <template #default="scope">
                {{ formatDate(scope.row.date) }}
              </template>
            </el-table-column>
            <el-table-column prop="courseName" label="课程名称" min-width="200" />
            <el-table-column prop="type" label="课程类型" min-width="120">
              <template #default="scope">
                <el-tag :type="scope.row.type === '理论课' ? 'info' : 'success'" size="small">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="上课地点" min-width="120" />
            <el-table-column label="出勤情况" min-width="120">
              <template #default="scope">
                <span>{{ scope.row.attendance }}/{{ scope.row.studentCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="课程时长" min-width="100">
              <template #default="scope">
                {{ scope.row.duration }}分钟
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" min-width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '已结束' ? 'info' : 'success'" size="small">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  link
                  size="small"
                  @click="viewDetail(scope.row)"
                >查看详情</el-button>
                <el-button 
                  type="primary" 
                  link
                  size="small"
                  @click="downloadRecord(scope.row)"
                >下载记录</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TeacherHeader from '@/components/TeacherHeader.vue'
import TeacherClassSidebar from '@/components/TeacherClassSidebar.vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const currentSideTab = ref('class-record')
const searchQuery = ref('')
const timeRange = ref('week')

// 模拟数据
const records = ref([
  {
    id: 1,
    date: '2025-07-2 10:00:00',
    courseName: 'Tensor - 第1课时',
    duration: 20,
    studentCount: 7,
    status: '已结束',
    recordUrl: 'http://example.com/record1.mp4',
    location: '理科楼301',
    attendance: 7,
    type: '理论课'
  },
  {
    id: 2,
    date: '2025-07-19 14:30:00',
    courseName: 'Python - 第2课时',
    duration: 15,
    studentCount: 20,
    status: '已结束',
    recordUrl: 'http://example.com/record2.mp4',
    location: '理科楼302',
    attendance: 20,
    type: '理论课'
  }
])

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 查看详情
const viewDetail = (record) => {
  ElMessage.info('查看课程详情：' + record.courseName)
}

// 下载记录
const downloadRecord = (record) => {
  ElMessage.success('开始下载课程记录：' + record.courseName)
}

// 组件挂载时初始化
onMounted(() => {
  localStorage.setItem('teacherClassNavState', JSON.stringify({ tab: 'class-record' }))
  localStorage.setItem('teacherNavState', JSON.stringify({ tab: 'analysis' }))
})
</script>

<style scoped>
.class-record-container {
  min-height: 100vh;
  background: #f6f8fc;
}

.main-container {
  display: flex;
  padding-top: 64px;
}

.content-area {
  flex: 1;
  margin-left: 300px;
  padding: 24px;
  min-height: calc(100vh - 64px);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.record-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.search-input {
  width: 240px;
}

.time-select {
  width: 120px;
}

.record-list {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: #f8f9fa;
  color: #333;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 8px 0;
}

:deep(.el-button--link) {
  font-weight: 500;
  padding: 4px 8px;
}

:deep(.el-tag) {
  border-radius: 4px;
  padding: 0 8px;
}

/* 响应式布局 */
@media screen and (max-width: 1366px) {
  .content-area {
    margin-left: 180px;
  }
  
  .record-header {
    padding: 16px;
  }
  
  .record-header h2 {
    font-size: 18px;
  }
  
  .search-input {
    width: 200px;
  }
}

@media screen and (max-width: 1024px) {
  .content-area {
    margin-left: 160px;
    padding: 16px;
  }
  
  .record-list {
    padding: 16px;
  }
  
  .search-input {
    width: 180px;
  }
}
</style> 