<template>
  <div class="container">
    <div class="background-container"></div>
    <animated-background />
    <div class="overlay"></div>
    <div class="gray-space"></div>
    <div class="content-wrapper">
    <div class="info-header">
      <div class="info-cards">
        <div class="stat-card course-name">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ courseName }}</div>
            <div class="stat-label">课程名称</div>
          </div>
        </div>

        <div class="stat-card student-count">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">35</div>
            <div class="stat-label">班级人数</div>
          </div>
        </div>

        <div class="stat-card location">
          <div class="stat-icon">
            <el-icon><Location /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ classInfo.building }}</div>
            <div class="stat-label">教学地点</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="nav-tabs">
      <el-tabs v-model="activeName">
        <el-tab-pane label="作业/考试" name="homework">
          <div class="homework-content">
              <div class="assignment-filters" style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <el-input placeholder="搜索作业或考试" v-model="searchText" style="width: 250px;" clearable />
                <el-select v-model="selectedType" placeholder="类型" style="width: 130px;">
                  <el-option label="全部类型" value="all"></el-option>
                  <el-option label="作业" value="homework"></el-option>
                  <el-option label="考试" value="exam"></el-option>
                </el-select>
                <el-select v-model="selectedStatus" placeholder="状态" style="width: 130px;">
                  <el-option label="全部状态" value="all"></el-option>
                  <el-option label="进行中" value="进行中"></el-option>
                  <el-option label="已截止" value="已截止"></el-option>
                  <el-option label="已批改" value="已批改"></el-option>
                </el-select>
                <el-button type="primary" @click="openAddAssignmentDialog" icon="el-icon-plus" style="margin-left: auto;">添加作业/考试</el-button>
              </div>

              <div v-if="filteredAssignments.length > 0" class="assignments-list">
                <el-card v-for="item in filteredAssignments" :key="item.id" class="assignment-card" style="margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);">
                  <template #header>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="display: flex; align-items: center;">
                        <el-tag :type="item.type === 'exam' ? 'warning' : 'success'" effect="dark" style="margin-right: 10px; min-width: 40px; text-align: center;">
                          {{ item.type === 'exam' ? '考试' : '作业' }}
                        </el-tag>
                        <strong style="font-size: 16px;">{{ item.title }}</strong>
                      </span>
                      <el-tag :type="item.status === '已截止' ? 'info' : (item.status === '进行中' ? 'primary' : 'success')" size="small" effect="light">
                        {{ item.status }}
                      </el-tag>
                    </div>
                    </template>
                  <p style="color: #606266; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">{{ item.description }}</p>
                  <div class="assignment-details" style="font-size: 13px; color: #909399; display: flex; flex-wrap: wrap; gap: 15px; border-top: 1px solid #EBEEF5; padding-top: 15px;">
                    <span><i class="el-icon-time"></i> 开始时间: {{ item.startTime }}</span>
                    <span><i class="el-icon-time"></i> 截止时间: {{ item.endTime }}</span>
                    <span><i class="el-icon-notebook-2"></i> 满分: {{ item.fullScore }}</span>
                    <span><i class="el-icon-user"></i> 已提交: {{ item.submittedCount }}/{{ item.totalStudents }}</span>
                    <span v-if="item.type === 'exam' && item.location"><i class="el-icon-location-outline"></i> 地点: {{ item.location }}</span>
                    <span v-if="item.type === 'exam' && item.duration"><i class="el-icon-timer"></i> 时长: {{ item.duration }}</span>
                  </div>
                  <div class="assignment-actions" style="margin-top: 20px; text-align: right; border-top: 1px solid #EBEEF5; padding-top: 15px;">
                    <el-button type="primary" link @click="editAssignment(item)"><i class="el-icon-edit"></i> 编辑</el-button>
                    <el-button type="primary" link @click="viewSubmissions(item)"><i class="el-icon-view"></i> 查看提交</el-button>
                    <el-button type="danger" link @click="deleteAssignment(item)" class="delete-btn"><i class="el-icon-delete"></i> 删除</el-button>
                  </div>
                </el-card>
              </div>
              <el-empty v-else description="暂无相关作业或考试" style="margin-top: 50px;"></el-empty>
          </div>
        </el-tab-pane>
        <el-tab-pane label="成绩单" name="grades">
          <div class="grades-content">
            <div class="left-panel">
              <div class="score-scheme">
                <h3>课程考核方案</h3>
                <div class="scheme-item">
                  <div class="item-header">
                    <span>课堂</span>
                    <span>30分</span>
                  </div>
                  <el-progress :percentage="30" :show-text="false" color="#409EFF"></el-progress>
                </div>
                <div class="scheme-item">
                  <div class="item-header">
                    <span>作业</span>
                    <span>20分</span>
                  </div>
                  <el-progress :percentage="20" :show-text="false" color="#67C23A"></el-progress>
                </div>
                <div class="scheme-item">
                  <div class="item-header">
                    <span>考试</span>
                    <span>50分</span>
                  </div>
                  <el-progress :percentage="50" :show-text="false" color="#E6A23C"></el-progress>
                </div>
                <div class="total-score">
                  <span>满分：</span>
                  <span>100分</span>
                </div>
              </div>
            </div>
            <div class="right-panel">
              <div class="score-overview">
                <div class="circle-progress">
                  <el-progress type="circle" :percentage="85" :width="150"></el-progress>
                  <div class="circle-label">班级平均分</div>
                </div>
                <div class="score-stats">
                  <div class="stat-item">
                    <span class="label">满分：</span>
                    <span class="value">100</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">最高分：</span>
                    <span class="value">98</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">最低分：</span>
                    <span class="value">60</span>
                  </div>
                </div>
                <div class="score-distribution">
                  <h4>学生人数</h4>
                  <el-progress :percentage="20" :format="() => '0-60: 7人'" color="#F56C6C"></el-progress>
                  <el-progress :percentage="15" :format="() => '60-70: 5人'" color="#E6A23C"></el-progress>
                  <el-progress :percentage="45" :format="() => '70-85: 15人'" color="#67C23A"></el-progress>
                  <el-progress :percentage="20" :format="() => '85-100: 8人'" color="#409EFF"></el-progress>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="课程资源" name="resources">
          <div class="resources-content">
            <el-button type="primary" @click="showResourceDialog">上传资源</el-button>
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="8" v-for="(resource, index) in resources" :key="index">
                <el-card class="resource-card" shadow="hover">
                  <template #header>
                    <div class="resource-header">
                      <span>{{ resource.title }}</span>
                      <el-tag size="small" :type="resource.type === 'PDF' ? 'danger' : 'primary'">
                        {{ resource.type }}
                      </el-tag>
                    </div>
                  </template>
                  <div class="resource-content">
                    <p>{{ resource.description }}</p>
                    <div class="resource-footer">
                      <span>上传时间：{{ resource.uploadTime }}</span>
                      <el-button type="primary" link @click="downloadResource(resource)">下载</el-button>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
        </el-tabs>
          </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, User, Location } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useRoute } from 'vue-router'
import AnimatedBackground from '@/components/AnimatedBackground.vue';

// 声明 gradeChart 变量
let gradeChart = null;

const activeName = ref('homework')
const courseId = ref(0)
const courseName = ref('')

// 初始化数据
const announcements = ref([])
const assignments = ref([])
const resources = ref([])

// NEW: Filter states for assignments
const searchText = ref('')
const selectedType = ref('all') // 'all', 'homework', 'exam'
const selectedStatus = ref('all') // 'all', 'ongoing', 'ended', etc.

const loadTestData = () => {
  announcements.value = [
    {
      id: 'ann1',
      title: '关于期中考试的通知',
      content: '期中考试将于下周三进行，请同学们做好准备。',
      date: '2024-03-15'
    }
  ]

  // REVISED: Populate unified assignments list
  assignments.value = [
    {
      id: 'hw1',
      type: 'homework',
      title: '第一次作业',
      description: '完成第一章课后习题，并提交详细解答步骤。',
      startTime: '2024-03-10 08:00',
      endTime: '2024-03-20 23:59',
      fullScore: 100,
      submittedCount: 25,
      totalStudents: 35,
      status: '进行中' // Possible values: '进行中', '已截止', '已批改'
    },
    {
      id: 'hw2',
      type: 'homework',
      title: '第二次作业',
      description: '设计一个简单的CPU模型并提交设计报告。',
      startTime: '2024-03-05 08:00',
      endTime: '2024-03-15 23:59',
      fullScore: 100,
      submittedCount: 30,
      totalStudents: 35,
      status: '已截止'
    },
    {
      id: 'exam1',
      type: 'exam',
      title: '期中考试',
      description: '闭卷考试，内容覆盖前五章。请携带学生证。',
      startTime: '2024-03-20 14:00',
      endTime: '2024-03-20 16:00',
      fullScore: 100,
      submittedCount: 32, // Example
      totalStudents: 35, // Example
      status: '已截止', // Or '待批改'
      duration: '120分钟', // Retain specific fields if needed
      location: '理科楼301'  // Retain specific fields if needed
    }
  ]

  resources.value = [
    {
      id: 'res1',
      title: '课程教材',
      type: 'PDF',
      description: '主要教材电子版',
      uploadTime: '2024-03-01'
    },
    {
      id: 'res2',
      title: '课程PPT',
      type: 'PPT',
      description: '课程讲义和演示文稿',
      uploadTime: '2024-03-05'
    }
  ]
}

// NEW: Computed property for filtered assignments
const filteredAssignments = computed(() => {
  return assignments.value.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchText.value.toLowerCase()));
    const matchesType = selectedType.value === 'all' || item.type === selectedType.value;
    const matchesStatus = selectedStatus.value === 'all' || item.status.toLowerCase() === selectedStatus.value.toLowerCase(); // Make status check case-insensitive
    return matchesSearch && matchesType && matchesStatus;
  });
});

const classInfo = ref({
  studentCount: 0,
  location: '',
  building: '',
  roomNumber: ''
})

// 功能方法
/* const showAnnouncementDialog = () => {
  ElMessage.info('打开发布公告对话框')
}

const editAnnouncement = (row) => {
  if (row) {
    ElMessage.info(`编辑公告: ${row.title}`)
  }
}

const deleteAnnouncement = (row) => {
  if (row) {
    ElMessage.warning(`删除公告: ${row.title}`)
  }
} */

// REVISED: Unified assignment functions
const openAddAssignmentDialog = () => {
  ElMessage.info('打开添加作业/考试对话框')
}

const editAssignment = (item) => {
  if (item) {
    ElMessage.info(`编辑 ${item.type === 'exam' ? '考试' : '作业'}: ${item.title}`)
  }
}

const viewSubmissions = (item) => {
  if (item) {
    ElMessage.info(`查看 ${item.type === 'exam' ? '考试' : '作业'}提交: ${item.title}`)
  }
}

const deleteAssignment = (item) => {
  if (item) {
    ElMessage.warning(`删除 ${item.type === 'exam' ? '考试' : '作业'}: ${item.title}`)
    // Actual deletion logic would go here, e.g.:
    // assignments.value = assignments.value.filter(a => a.id !== item.id);
  }
}

const showResourceDialog = () => {
  ElMessage.info('打开上传资源对话框')
}

const downloadResource = (resource) => {
  if (resource) {
    ElMessage.success(`开始下载: ${resource.title}`)
  }
}

const loadClassInfo = async () => {
  try {
    classInfo.value = {
      studentCount: localStorage.getItem('currentCourseStudentCount') || 0,
      location: localStorage.getItem('currentCourseLocation') || '未知位置',
      building: localStorage.getItem('currentCourseLocation')?.split(' ')[0] || '理科楼301',
      roomNumber: localStorage.getItem('currentCourseLocation')?.split(' ')[1] || '教学地点'
    }
    // 从localStorage获取课程名称
    const storedCourseName = localStorage.getItem('currentCourseName')
    if (storedCourseName) {
      courseName.value = storedCourseName
    } else {
      console.warn('未找到课程名称')
      courseName.value = '未知课程'
    }
  } catch (error) {
    console.error('获取课程信息失败:', error)
    ElMessage.error('加载课程信息失败')
  }
}

// 监听路由参数变化
const route = useRoute()

watch(
  () => route.query.id,
  (newId) => {
    if (newId) {
      courseId.value = Number(newId)
      loadClassInfo()
      loadTestData()
    }
  },
  { immediate: true }
)

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null;
  return function() {
    const context = this;
    const args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
};

// 初始化图表
const initGradeDistChart = () => {
  const chartDom = document.querySelector('#gradeDistChart');
  if (!chartDom) return;

  // 如果已存在图表实例，先销毁
  if (gradeChart) {
    gradeChart.dispose();
  }

  // 使用 nextTick 确保 DOM 已更新
  nextTick(() => {
    gradeChart = echarts.init(chartDom);
    const option = {
      // ... 你的图表配置
    };
    gradeChart.setOption(option);
    
    // 使用防抖处理 resize
    const handleResize = debounce(() => {
      if (gradeChart && !gradeChart.isDisposed()) {
        gradeChart.resize();
      }
    }, 100);

    window.addEventListener('resize', handleResize);

    // 在组件卸载时清理
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      if (gradeChart && !gradeChart.isDisposed()) {
        gradeChart.dispose();
      }
      gradeChart = null;
    });
  });
};

onMounted(() => {
  console.log('Course ID:', courseId.value)
  loadClassInfo()
  loadTestData() // 加载测试数据
  
  // 如果初始标签页是 grade，初始化图表
  if (activeName.value === 'grade') {
    nextTick(() => {
      initGradeDistChart();
    });
  }
})

// 监听标签页变化
watch(activeName, (newVal) => {
  if (newVal === 'grade') {
    nextTick(() => {
      initGradeDistChart();
    });
  }
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
  background-color: transparent;
  position: relative;
  z-index: 1;
  width: 100%;
  margin: 0;
  margin-top: 0;
  box-sizing: border-box;
}

// 背景容器样式
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
// 遮罩层样式
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.7);
  z-index: -1;
}

.gray-space {
  height: 12px;
  background-color: transparent;
}

.content-wrapper {
  max-width: none;
  margin: 0 0 20px;
  background-color: transparent;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  z-index: 2;
}

.info-header {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
  padding: 0;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 0;
  width: 100%;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  height: 90px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transition: all 0.3s ease;
}

.stat-info {
  flex: 1;

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
    }
  }

  &:nth-child(1) {
    background: linear-gradient(135deg, rgba(106, 174, 234, 0.95), rgba(123, 218, 195, 0.95));
  }

  &:nth-child(2) {
    background: linear-gradient(135deg, rgba(253, 158, 81, 0.95), rgba(236, 136, 128, 0.95));
  }

  &:nth-child(3) {
    background: linear-gradient(135deg, rgba(160, 208, 59, 0.95), rgba(114, 201, 128, 0.95));
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
}

.nav-tabs {
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  box-shadow: 
    rgba(99, 147, 244, 0.15) 0px 0px 0px 1px,
    rgba(99, 147, 244, 0.1) 0px 8px 24px;
}

.sub-tabs {
  margin-top: 15px;
}

.announcement-content,
.homework-content,
.resources-content,
.groups-content {
  margin-top: 15px;
  font-size: 15px;
  width: 100%;
  box-sizing: border-box;
}

.el-table {
 margin-top: 15px !important;
}

.resource-card,
.group-card,
.assignment-card {
  margin-bottom: 15px;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-footer {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 13px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-count {
  font-size: 12px;
  color: #909399;
}

.member-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #ebeef5;
}

.member-role {
  color: #909399;
  font-size: 12px;
}

.group-footer {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.delete-btn {
  color: #f56c6c;
}

.grades-content {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  font-size: 15px;
  width: 100%;
  box-sizing: border-box;
}

.left-panel,
.right-panel {
  border-radius: 8px;
  padding: 15px;
}

.score-scheme {
  margin-bottom: 20px;
}

.score-scheme h3 {
  margin-bottom: 20px;
  font-size: 17px;
  color: #303133;
}

.scheme-item {
  margin-bottom: 15px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #606266;
  font-size: 15px;
}

.total-score {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  color: #303133;
  font-weight: 500;
}

.score-overview {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.circle-progress {
  text-align: center;
  margin-bottom: 30px;
}

.circle-label {
  margin-top: 10px;
  color: #606266;
  font-size: 15px;
}

.score-stats {
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.stat-item {
  text-align: center;
}

.stat-item .label {
  color: #909399;
  font-size: 15px;
}

.stat-item .value {
  display: block;
  color: #303133;
  font-size: 22px;
  font-weight: 500;
  margin-top: 5px;
}

.score-distribution {
  width: 100%;
  padding: 0 20px;
}

.score-distribution h4 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 17px;
}

:deep(.el-progress) {
  margin-bottom: 15px;
}

:deep(.el-progress__text) {
  font-size: 13px !important;
}

:deep(.el-tabs__item) {
  font-size: 14px;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
}

:deep(.el-tabs__active-bar) {
  background-color: #409EFF;
}

/* NEW: Ensure el-tabs content area takes full width */
:deep(.el-tabs__content) {
  width: 100%;
  box-sizing: border-box;
}

/* 添加空状态提示样式 */
.empty-tip {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 30px 0;
}

/* 统一调整标签页内容区域的基础字体和表格字体 */
.announcement-content,
.homework-content,
.grades-content,
.resources-content,
.groups-content {
  font-size: 15px;
}

:deep(.el-table) {
  font-size: 14px;
}

/* 调整作业/考试卡片内的字体 */
.assignment-card .el-card__header strong {
  font-size: 17px;
}

.assignment-card .el-card__body p {
  font-size: 15px;
  line-height: 1.7;
}

.assignment-card .assignment-details span {
  font-size: 14px;
}

.assignment-card .assignment-actions .el-button {
  font-size: 14px;
}

/* 调整成绩单部分特定字体 */
.score-scheme h3 {
  font-size: 17px;
}
.item-header,
.total-score {
  font-size: 15px;
}
.circle-label {
  font-size: 15px;
}
.stat-item .label {
  font-size: 15px;
}
.stat-item .value {
  font-size: 22px;
}
.score-distribution h4 {
  font-size: 17px;
}

/* 调整资源卡片字体 */
.resource-card .el-card__header span {
 font-size: 16px;
}
.resource-card .el-card__body p {
  font-size: 14px;
}
.resource-footer span,
.resource-footer .el-button {
  font-size: 14px;
}

/* 调整分组卡片字体 */
.group-card .el-card__header span {
  font-size: 16px;
}
.member-item span {
  font-size: 14px;
}
.group-footer .el-button {
  font-size: 14px;
}
</style>