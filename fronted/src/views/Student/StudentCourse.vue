<template>
  <div class="container">
    <div class="background-container"></div>
    <div class="overlay"></div>
    <StudentHeader />
    <div class="info-header">
      <div class="info-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ courseName }}</div>
            <div class="stat-label">课程名称</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">35</div>
            <div class="stat-label">班级人数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Location /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ classInfo.building }}</div>
            <div class="stat-label">{{ classInfo.roomNumber }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="custom-tabs">
      <el-tab-pane label="作业/考试" name="homework"> 
        <div class="homework-content">
          <div class="assignment-filters">
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
          </div>

          <div class="assignments-list">
            <el-card v-for="item in filteredAssignments" :key="item.id" class="assignment-card">
              <div class="assignment-header">
                <div class="header-left">
                  <el-tag :type="item.type === 'exam' ? 'warning' : 'success'" effect="dark">
                    {{ item.type === 'exam' ? '考试' : '作业' }}
                  </el-tag>
                  <h3>{{ item.title }}</h3>
                </div>
                <el-tag :type="getStatusType(item.status)" effect="light">{{ item.status }}</el-tag>
              </div>
              <div class="assignment-content">
                <p>{{ item.description }}</p>
                <div class="assignment-info">
                  <span><el-icon><Timer /></el-icon> 开始时间：{{ item.startTime }}</span>
                  <span><el-icon><Timer /></el-icon> 截止时间：{{ item.endTime }}</span>
                  <span><el-icon><Document /></el-icon> 满分：{{ item.fullScore }}分</span>
                  <span><el-icon><User /></el-icon> 已提交：{{ item.submittedCount }}/{{ item.totalStudents }}</span>
                  <span v-if="item.type === 'exam' && item.location"><el-icon><Location /></el-icon> 地点：{{ item.location }}</span>
                  <span v-if="item.type === 'exam' && item.duration"><el-icon><Timer /></el-icon> 时长：{{ item.duration }}</span>
                </div>
              </div>
              <div class="assignment-footer">
                <el-button type="primary" link @click="viewSubmissions(item)">查看提交</el-button>
                <el-button type="primary" link @click="editAssignment(item)">编辑</el-button>
                <el-button type="danger" link @click="deleteAssignment(item)">删除</el-button>
              </div>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="成绩单" name="grade">
        <div class="grade-container">
          <!-- 成绩概览卡片 -->
          <div class="grade-overview">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card class="overview-card">
                  <template #header>
                    <div class="card-header">
                      <span>总平均分</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <span class="grade-number">{{ averageScore }}</span>
                    <span class="grade-unit">分</span>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="overview-card">
                  <template #header>
                    <div class="card-header">
                      <span>最高分</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <span class="grade-number">{{ highestScore }}</span>
                    <span class="grade-unit">分</span>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="overview-card">
                  <template #header>
                    <div class="card-header">
                      <span>最低分</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <span class="grade-number">{{ lowestScore }}</span>
                    <span class="grade-unit">分</span>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="overview-card">
                  <template #header>
                    <div class="card-header">
                      <span>班级人数</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <span class="grade-number">{{ classInfo.studentCount || 35 }}</span>
                    <span class="grade-unit">人</span>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 成绩详情表格 -->
          <el-card class="grade-details">
            <template #header>
              <div class="card-header">
                <span>成绩详情</span>
                <div class="header-right">
                  <el-input
                    v-model="searchGradeText"
                    placeholder="搜索学生姓名或学号"
                    prefix-icon="Search"
                    clearable
                    style="width: 220px; margin-right: 16px;"
                  />
                  <el-button type="primary" @click="exportGrades">
                    <el-icon><Download /></el-icon>导出成绩单
                  </el-button>
                </div>
              </div>
            </template>
            
            <el-table 
              :data="filteredGradeList" 
              style="width: 100%"
              :default-sort="{ prop: 'totalScore', order: 'descending' }"
              border
              stripe
              row-key="index"
              highlight-current-row
            >
              <el-table-column prop="index" label="序号" width="70" sortable align="center" />
              <el-table-column prop="name" label="姓名" width="120" sortable align="center" />
              <el-table-column prop="studentId" label="学号" width="120" sortable align="center" />
              <el-table-column prop="classScore" label="课堂(30%)" width="140" sortable align="center">
                <template #default="scope">
                  <el-progress 
                    :percentage="Math.round(scope.row.classScore / 30 * 100)" 
                    :format="() => scope.row.classScore"
                    :status="getScoreStatus(scope.row.classScore, 30)"
                    :text-inside="true"
                    :stroke-width="14"
                  ></el-progress>
                </template>
              </el-table-column>
              <el-table-column prop="rainScore" label="作业(20%)" width="170" sortable align="center">
                <template #default="scope">
                  <el-progress 
                    :percentage="Math.round(scope.row.rainScore / 20 * 100)" 
                    :format="() => scope.row.rainScore"
                    :status="getScoreStatus(scope.row.rainScore, 20)"
                    :text-inside="true"
                    :stroke-width="14"
                  ></el-progress>
                </template>
              </el-table-column>
              <el-table-column prop="examScore" label="考试(50%)" width="140" sortable align="center">
                <template #default="scope">
                  <el-progress 
                    :percentage="Math.round(scope.row.examScore / 50 * 100)" 
                    :format="() => scope.row.examScore"
                    :status="getScoreStatus(scope.row.examScore, 50)"
                    :text-inside="true"
                    :stroke-width="14"
                  ></el-progress>
                </template>
              </el-table-column>
              <el-table-column prop="totalScore" label="总成绩" width="100" sortable align="center">
                <template #default="scope">
                  <span :class="getTotalScoreClass(scope.row.totalScore)">{{ scope.row.totalScore }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
      <el-tab-pane label="课程资源" name="resource">
        <div class="resource-container">
          <div class="resource-header">
            <div class="left-actions">
              <el-button type="primary" @click="handleUpload">
                <el-icon><Upload /></el-icon>上传文件
              </el-button>
              <el-button @click="handleCreateFolder">
                <el-icon><Folder /></el-icon>新建文件夹
              </el-button>
            </div>
            <div class="right-actions">
              <el-input
                v-model="searchResourceText"
                placeholder="搜索文件"
                prefix-icon="Search"
                style="width: 250px"
              />
            </div>
          </div>

          <div class="resource-content">
            <div class="resource-nav">
              <el-menu
                :default-active="activeCategory"
                @select="handleCategorySelect"
              >
                <el-menu-item index="all">
                  <el-icon><Document /></el-icon>
                  <span>全部文件</span>
                </el-menu-item>
                <el-menu-item index="courseware">
                  <el-icon><Collection /></el-icon>
                  <span>课件</span>
                </el-menu-item>
                <el-menu-item index="video">
                  <el-icon><VideoPlay /></el-icon>
                  <span>视频</span>
                </el-menu-item>
                <el-menu-item index="document">
                  <el-icon><Files /></el-icon>
                  <span>文档</span>
                </el-menu-item>
                <el-menu-item index="other">
                  <el-icon><More /></el-icon>
                  <span>其他</span>
                </el-menu-item>
              </el-menu>
            </div>

            <div class="resource-list">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">课程资源</el-breadcrumb-item>
                <el-breadcrumb-item v-if="currentFolder">{{ currentFolder }}</el-breadcrumb-item>
              </el-breadcrumb>

              <el-table
                :data="filteredResources"
                style="width: 100%; margin-top: 20px;"
                @row-click="handleRowClick"
              >
                <el-table-column width="50">
                  <template #default="scope">
                    <el-icon :size="20">
                      <component :is="getFileIcon(scope.row.type)" />
                    </el-icon>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="文件名" min-width="200">
                  <template #default="scope">
                    <span class="file-name">{{ scope.row.name }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="size" label="大小" width="120">
                  <template #default="scope">
                    {{ formatFileSize(scope.row.size) }}
                  </template>
                </el-table-column>
                <el-table-column prop="uploadTime" label="上传时间" width="180" />
                <el-table-column prop="uploader" label="上传者" width="120" />
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default="scope">
                    <div class="operation-buttons">
                      <el-button size="small" type="primary" @click.stop="handleDownload(scope.row)">
                        下载
                      </el-button>
                      <el-button size="small" type="info" @click.stop="handlePreview(scope.row)">
                        预览
                      </el-button>
                      <el-button size="small" type="danger"  @click.stop="handleDelete(scope.row)">
                        删除
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <el-dialog
            v-model="uploadDialogVisible"
            title="上传文件"
            width="500px"
          >
            <el-upload
              class="upload-demo"
              drag
              :action="null"
              :http-request="customUpload"
              :before-upload="beforeUpload"
              :on-remove="handleRemove"
              :before-remove="beforeRemove"
              multiple
              :show-file-list="false"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持任意格式文件，单个文件不超过100MB
                </div>
              </template>
            </el-upload>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="uploadDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmUpload">确定</el-button>
              </span>
            </template>
          </el-dialog>

          <el-dialog
            v-model="folderDialogVisible"
            title="新建文件夹"
            width="400px"
          >
            <el-form :model="folderForm">
              <el-form-item label="文件夹名称">
                <el-input v-model="folderForm.name" placeholder="请输入文件夹名称" />
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="folderDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmCreateFolder">确定</el-button>
              </span>
            </template>
          </el-dialog>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, User, Location, Download, Upload, Folder, Collection, VideoPlay, Files, More, UploadFilled } from '@element-plus/icons-vue';
import StudentHeader from '@/components/StudentHeader.vue';

const route = useRoute();
const courseId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});
const courseName = ref('');
const classInfo = ref({
  studentCount: 0,
  location: '',
  building: '',
  roomNumber: ''
});

const activeTab = ref('homework');
// 成绩相关数据
const averageScore = ref(85);
const highestScore = ref(98);
const lowestScore = ref(60);
const searchGradeText = ref('');
const gradeList = ref([
  {
    index: 1,
    name: '张某某',
    studentId: '2021001',
    classScore: 28,
    rainScore: 18,
    examScore: 45,
    totalScore: 91
  },
  {
    index: 2,
    name: '李某某',
    studentId: '2021002',
    classScore: 26,
    rainScore: 15,
    examScore: 43,
    totalScore: 84
  },
  {
    index: 3,
    name: '王某某',
    studentId: '2021003',
    classScore: 22,
    rainScore: 19,
    examScore: 38,
    totalScore: 79
  },
  {
    index: 4,
    name: '赵某某',
    studentId: '2021004',
    classScore: 29,
    rainScore: 16,
    examScore: 41,
    totalScore: 86
  },
  {
    index: 5,
    name: '钱某某',
    studentId: '2021005',
    classScore: 25,
    rainScore: 17,
    examScore: 47,
    totalScore: 89
  }
]);

// 筛选成绩列表数据
const filteredGradeList = computed(() => {
  if (!searchGradeText.value) {
    return gradeList.value;
  }
  
  const searchQuery = searchGradeText.value.toLowerCase();
  return gradeList.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery) || 
    item.studentId.toLowerCase().includes(searchQuery)
  );
});

// 获取成绩状态（优/良/及格/不及格）
const getScoreStatus = (score, fullScore) => {
  const percentage = score / fullScore * 100;
  if (percentage >= 90) return 'success';
  if (percentage >= 75) return '';
  if (percentage >= 60) return 'warning';
  return 'exception';
};

// 获取总成绩的CSS类
const getTotalScoreClass = (score) => {
  if (score >= 90) return 'score-excellent';
  if (score >= 80) return 'score-good';
  if (score >= 70) return 'score-medium';
  if (score >= 60) return 'score-pass';
  return 'score-fail';
};

// 导出成绩单
const exportGrades = () => {
  console.log('导出成绩单');
  ElMessage.success('成绩单导出成功');
  // 实际开发中这里应该调用导出API
};

// 方法


const handleTabClick = (tab) => {
  console.log(tab, activeTab.value);
  if(activeTab.value === 'grade'){
    nextTick(() => {
      initGradeDistChart();
    });
  }
};

// 优化图表初始化和重绘
let gradeChart = null;

const initGradeDistChart = () => {
  const chartDom = document.querySelector('#gradeDistChart');
  if (!chartDom) return;

  // 如果已存在图表实例，先销毁
  if (gradeChart) {
    gradeChart.dispose();
  }

  gradeChart = echarts.init(chartDom);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      data: ['0-60', '60-70', '70-85', '85-100'],
      axisTick: {
        alignWithLabel: true
      }
    }],
    yAxis: [{
      type: 'value',
      name: '学生人数',
      nameTextStyle: {
        padding: [0, 0, 0, 30]
      }
    }],
    series: [{
      name: '成绩分布',
      type: 'bar',
      barWidth: '40%',
      itemStyle: {
        color: '#409EFF'
      },
      data: [7, 5, 15, 8]
    }]
  };
  gradeChart.setOption(option);
  
  // 使用防抖处理 resize
  const handleResize = debounce(() => {
    if (gradeChart) {
      gradeChart.resize();
    }
  }, 100);

  window.addEventListener('resize', handleResize);

  // 在组件卸载时清理
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (gradeChart) {
      gradeChart.dispose();
      gradeChart = null;
    }
  });
};

// 防抖函数
function debounce(fn, delay) {
  let timer = null;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

// 加载课程信息
const loadClassInfo = async () => {
  try {
    // 从localStorage获取课程信息或从API获取
    classInfo.value = {
      studentCount: localStorage.getItem('currentCourseStudentCount') || 0,
      location: localStorage.getItem('currentCourseLocation') || '未知位置',
      building: localStorage.getItem('currentCourseLocation')?.split(' ')[0] || '未知教学楼',
      roomNumber: localStorage.getItem('currentCourseLocation')?.split(' ')[1] || '教学地点'
    };
    courseName.value = localStorage.getItem('currentCourseName') || '未知课程';
  } catch (error) {
    console.error('获取课程信息失败:', error);
    ElMessage.error('加载课程信息失败');
  }
};

onMounted(() => {
  console.log('Course ID:', courseId.value);
  loadClassInfo();
  
  // 使用 nextTick 确保 DOM 已更新
  nextTick(() => {
    if (activeTab.value === 'grade') {
      initGradeDistChart();
    }
  });
});

// 资源管理相关的状态
const searchResourceText = ref('');
const activeCategory = ref('all');
const currentFolder = ref('');
const uploadDialogVisible = ref(false);
const folderDialogVisible = ref(false);
const folderForm = ref({ name: '' });
const resources = ref([
  {
    id: 1,
    name: '课程大纲.pdf',
    type: 'document',
    size: 1024 * 1024,
    uploadTime: '2024-03-15 10:00',
    uploader: '张老师'
  },
  {
    id: 2,
    name: '第一章PPT.pptx',
    type: 'courseware',
    size: 2 * 1024 * 1024,
    uploadTime: '2024-03-16 14:30',
    uploader: '张老师'
  }
]);

// 计算属性：过滤后的资源列表
const filteredResources = computed(() => {
  let filtered = resources.value;
  
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.type === activeCategory.value);
  }
  
  if (searchResourceText.value) {
    const keyword = searchResourceText.value.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      item.uploader?.toLowerCase().includes(keyword)
    );
  }
  
  return filtered;
});

// 资源管理相关方法
const handleCategorySelect = (index) => {
  activeCategory.value = index;
};

const handleUpload = () => {
  uploadDialogVisible.value = true;
};

const handleCreateFolder = () => {
  folderDialogVisible.value = true;
};

const confirmCreateFolder = () => {
  if (!folderForm.value.name) {
    ElMessage.warning('请输入文件夹名称');
    return;
  }
  ElMessage.success('文件夹创建成功');
  folderDialogVisible.value = false;
  folderForm.value.name = '';
};

const handleRowClick = (row) => {
  if (row.type === 'folder') {
    currentFolder.value = row.name;
  }
};

const handleDownload = async (file) => {
  ElMessage.success(`开始下载: ${file.name}`);
};

const handlePreview = async (file) => {
  ElMessage.info(`预览文件: ${file.name}`);
};

const handleDelete = (file) => {
  ElMessageBox.confirm(
    `确定要删除 ${file.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功');
  });
};

const handleRemove = (file, fileList) => {
  console.log(file, fileList);
};

const beforeRemove = (uploadFile) => {
  return ElMessageBox.confirm(
    `确定移除 ${uploadFile.name} ？`
  ).then(
    () => true,
    () => false
  );
};

const beforeUpload = (file) => {
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过100MB');
    return false;
  }
  return true;
};

const customUpload = async ({ file }) => {
  try {
    // 模拟上传文件
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('上传文件:', file.name);
    ElMessage.success('文件上传成功');
    uploadDialogVisible.value = false;
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('文件上传失败');
  }
};

const confirmUpload = () => {
  uploadDialogVisible.value = false;
};

// 工具方法
const getFileIcon = (type) => {
  const iconMap = {
    folder: Folder,
    courseware: Collection,
    video: VideoPlay,
    document: Files,
    other: Document
  };
  return iconMap[type] || Document;
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: url('@/assets/ai.png') no-repeat center center fixed;
  background-size: cover;
  z-index: -2;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.4);
  z-index: -1;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px;
  background-color: transparent;
  position: relative;
  z-index: 1;
  max-width: 1300px;
  margin: 0 auto;
}

.info-header {
  margin-bottom: 24px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  position: relative;
  z-index: 2;
  margin-top:70px;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 0;
  width: 100%;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  height: 100px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.stat-card:nth-child(1) {
  background: linear-gradient(135deg, rgba(106, 174, 234, 0.95), rgba(123, 218, 195, 0.95));
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, rgba(253, 158, 81, 0.95), rgba(236, 136, 128, 0.95));
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, rgba(160, 208, 59, 0.95), rgba(114, 201, 128, 0.95));
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

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
}

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

.custom-tabs {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 1400px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: relative;
  z-index: 2;
  box-shadow: 
    rgba(99, 147, 244, 0.2) 0px 0px 0px 2px,
    rgba(99, 147, 244, 0.15) 0px 4px 16px;
}

:deep(.el-tabs__header) {
  margin: 0;
  padding: 10px 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0;
}

:deep(.el-tabs__item) {
  height: 45px;
  line-height: 45px;
  font-size: 15px;
  color: #606266;
  padding: 0 20px !important;
  transition: all 0.3s;
}

:deep(.el-tabs__item.is-active) {
  color: #2196F3;
  font-weight: 500;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 1.5px;
  background-color: #2196F3;
}

:deep(.el-tabs__content) {
  padding: 24px;
}

/* 搜索框样式 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

:deep(.el-input__inner) {
  height: 40px;
  font-size: 14px;
}

/* 按钮样式 */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  border: none;
  height: 40px;
  border-radius: 8px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

/* 搜索区域样式 */
.search-area {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  max-width: 800px;
  margin: 0 auto 20px;
  width: 100%;
  padding: 0 20px;
}

/* 公告列表样式 */
.announcement-container {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.announcement-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  width: 100%;
}

.announcement-item {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.announcement-item:hover {
  background: #f8f9fa;
}

.announcement-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
  font-weight: 500;
}

.announcement-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 分页样式 */
:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
  padding: 0;
}

:deep(.el-pagination .el-pagination__total) {
  font-size: 14px;
}

:deep(.el-pagination .el-pagination__sizes .el-input) {
  margin: 0;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: transparent;
  border: none;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 4px;
  font-weight: normal;
}

:deep(.el-pagination .el-pager li.active) {
  background-color: #2196F3;
  color: white;
}

.grade-container {
  padding: 20px;
}

.grade-overview {
  margin-bottom: 20px;
}

.overview-card {
  height: 160px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  justify-content: center;
  align-items: baseline;
  height: 80px;
  padding-top: 20px;
}

.grade-number {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  background: linear-gradient(45deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.grade-unit {
  margin-left: 4px;
  font-size: 14px;
  color: #909399;
}

.grade-details {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

:deep(.el-progress) {
  margin-bottom: 0;
  width: 100%;
}

:deep(.el-progress-bar__outer) {
  border-radius: 4px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 4px;
}

:deep(.el-progress__text) {
  font-size: 13px !important;
  font-weight: 500;
  color: #fff;
}

:deep(.el-progress-bar__innerText) {
  font-size: 12px;
  color: #fff;
}

:deep(.el-table) {
  background: transparent;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  text-align: center;
}

:deep(.el-table td) {
  text-align: center;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(250, 250, 250, 0.5);
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: rgba(236, 245, 255, 0.5);
}

.homework-content {
  padding: 20px;
}

.assignment-filters {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.assignments-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  padding: 10px;
}

.assignment-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.assignment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.assignment-content {
  flex: 1;
}

.assignment-content p {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.6;
}

.assignment-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: #909399;
  font-size: 14px;
}

.assignment-info span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.assignment-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.resource-container {
  padding: 20px;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 20px;
}

.left-actions {
  display: flex;
  gap: 10px;
}

.resource-content {
  flex: 1;
  display: flex;
  gap: 20px;
  background-color: transparent;
  padding: 20px;
  height: 100%;
}

.resource-nav {
  width: 200px;
  border-right: 1px solid rgba(228, 231, 237, 0.5);
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 10px 0;
}

.resource-list {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 20px;
}

.file-name {
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.file-name:hover {
  color: #409EFF;
}

:deep(.el-upload-dragger) {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border: 2px dashed rgba(64, 158, 255, 0.3);
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409EFF;
  background: rgba(255, 255, 255, 1);
}

:deep(.el-menu) {
  border-right: none;
  background: transparent;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
  margin: 4px 8px;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(64, 158, 255, 0.1);
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.2);
  color: #409EFF;
}

:deep(.el-table) {
  background: transparent;
}

:deep(.el-table th) {
  background-color: rgba(245, 247, 250, 0.8);
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(250, 250, 250, 0.5);
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: rgba(236, 245, 255, 0.5);
}

.el-icon {
  vertical-align: middle;
}

.operation-buttons {
  display: flex;
  gap: 4px;
}

:deep(.el-button--small) {
  padding: 4px 8px;
  font-size: 12px;
}
</style>