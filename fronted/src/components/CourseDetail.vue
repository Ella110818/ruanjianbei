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
            <div class="stat-value">{{ courseInfo.grade_level || '未设置' }}</div>
            <div class="stat-label">年级水平</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="nav-tabs">
      <el-tabs v-model="activeName">
        <el-tab-pane label="作业/考试" name="homework">
          <div class="homework-content">
            <div class="assignment-header">
              <div class="search-filter">
                <el-input
                  v-model="searchText"
                  placeholder="搜索作业或考试"
                  prefix-icon="Search"
                  clearable
                  style="width: 250px; margin-right: 16px;"
                />
                <el-select v-model="selectedType" placeholder="类型" clearable style="width: 120px; margin-right: 16px;">
                  <el-option label="全部" value="all" />
                  <el-option label="作业" value="homework" />
                  <el-option label="考试" value="exam" />
                </el-select>
                <el-select v-model="selectedStatus" placeholder="状态" clearable style="width: 120px;">
                  <el-option label="全部" value="all" />
                  <el-option label="未开始" value="未开始" />
                  <el-option label="进行中" value="进行中" />
                  <el-option label="已截止" value="已截止" />
                </el-select>
              </div>
              <el-button type="primary" @click="openAddAssignmentDialog">
                <el-icon><Plus /></el-icon>添加作业/考试
              </el-button>
              </div>

            <div class="assignment-list">
              <el-empty v-if="filteredAssignments.length === 0" description="暂无作业或考试" />
              <el-card 
                v-for="item in filteredAssignments" 
                :key="item.id" 
                class="assignment-item"
                :class="item.type"
              >
                <div class="assignment-header">
                  <div class="assignment-title-group">
                    <span class="assignment-type-tag" :class="item.type">
                          {{ item.type === 'exam' ? '考试' : '作业' }}
                      </span>
                    <h3>{{ item.title }}</h3>
                    </div>
                  <el-tag :type="getStatusTagType(item.status)">{{ item.status }}</el-tag>
                  </div>
                <div class="assignment-info">
                  <p>{{ item.description }}</p>
                  <div class="assignment-meta">
                    <span><el-icon><Calendar /></el-icon> 开始时间：{{ item.startTime }}</span>
                    <span><el-icon><Timer /></el-icon> 截止时间：{{ item.endTime }}</span>
                    <span><el-icon><ScaleToOriginal /></el-icon> 满分：{{ item.fullScore }}分</span>
                    <span><el-icon><User /></el-icon> 已提交：{{ item.submittedCount }}/{{ item.totalStudents }}</span>
                  </div>
                </div>
                <div class="assignment-actions">
                  <div class="action-buttons">
                    <el-button class="btn-custom" type="info" @click="editAssignment(item)">
                      <el-icon><EditPen /></el-icon>编辑
                    </el-button>
                    <el-button class="btn-custom" type="primary" @click="viewSubmissions(item)">
                      <el-icon><View /></el-icon>查看提交
                    </el-button>
                    <el-button class="btn-custom" type="danger" @click="deleteAssignment(item)">
                      <el-icon><Delete /></el-icon>删除
                    </el-button>
                  </div>
                  </div>
                </el-card>
              </div>

            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                layout="total, sizes, prev, pager, next, jumper"
              />
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="成绩单" name="grades">
          <div class="grade-container">
            <!-- 考核方案 -->
            <el-card class="grade-card left-card">
              <template #header>
                <div class="card-header">
                  <span>课程考核方案</span>
                  <span class="total-score">满分：100分</span>
                </div>
              </template>
              <div class="scheme-content">
                <div class="scheme-item">
                  <div class="scheme-info">
                    <span class="scheme-name">课堂</span>
                    <span class="scheme-score">30分</span>
                  </div>
                  <el-progress :percentage="30" :show-text="false" />
                </div>
                <div class="scheme-item">
                  <div class="scheme-info">
                    <span class="scheme-name">作业</span>
                    <span class="scheme-score">20分</span>
                  </div>
                  <el-progress :percentage="20" :show-text="false" />
                </div>
                <div class="scheme-item">
                  <div class="scheme-info">
                    <span class="scheme-name">考试</span>
                    <span class="scheme-score">50分</span>
                  </div>
                  <el-progress :percentage="50" :show-text="false" />
                </div>
                </div>
            </el-card>

            <!-- 班级平均分 -->
            <el-card class="grade-card right-card">
              <template #header>
                <div class="card-header">
                  <span>成绩概览</span>
              </div>
              </template>
              <div class="statistics">
                <div class="statistics-left">
                  <div class="chart-container">
                    <div class="dashboard-wrapper">
                      <el-progress 
                        type="dashboard" 
                        :percentage="85" 
                        :width="150" 
                        :stroke-width="10"
                        :show-text="false"
                      />
                      <div class="central-score">85</div>
            </div>
                    <div class="chart-label">班级平均分</div>
                </div>
                  <div class="score-details">
                    <div class="score-item">
                      <span class="score-label">满分：</span>
                      <span class="score-value">100</span>
                  </div>
                    <div class="score-item">
                      <span class="score-label">最高分：</span>
                      <span class="score-value">98</span>
                  </div>
                    <div class="score-item">
                      <span class="score-label">最低分：</span>
                      <span class="score-value">60</span>
                  </div>
                </div>
                </div>
                <div class="statistics-right">
                  <div id="gradeDistChart" style="width: 100%; height: 300px;"></div>
              </div>
            </div>
            </el-card>

            <!-- 成绩列表 -->
            <el-card class="grade-card full-width">
              <template #header>
                <div class="card-header">
                  <span>成绩列表</span>
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
                :header-cell-style="{
                  backgroundColor: '#f5f7fa',
                  color: '#606266',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '12px 0'
                }"
                :cell-style="{
                  textAlign: 'center',
                  padding: '8px 0'
                }"
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
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="homeworkScore" label="作业(20%)" width="140" sortable align="center">
                  <template #default="scope">
                    <el-progress 
                      :percentage="Math.round(scope.row.homeworkScore / 20 * 100)" 
                      :format="() => scope.row.homeworkScore"
                      :status="getScoreStatus(scope.row.homeworkScore, 20)"
                      :text-inside="true"
                      :stroke-width="14"
                    />
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
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="totalScore" label="总成绩" width="100" sortable align="center">
                  <template #default="scope">
                    <span :class="getTotalScoreClass(scope.row.totalScore)">{{ scope.row.totalScore }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="130" fixed="right" align="center">
                  <template #default="scope">
                    <el-button link type="primary" @click="editGrade(scope.row)">编辑</el-button>
                    <el-button link type="primary" @click="viewGradeDetail(scope.row)">查看详情</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="table-pagination">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="total"
                />
              </div>
            </el-card>
          </div>
        </el-tab-pane>
        <el-tab-pane label="课程资源" name="resources">
          <div class="resource-container">
            <!-- 顶部操作栏 -->
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
                  v-model="resourceSearchText"
                  placeholder="搜索文件"
                  prefix-icon="Search"
                  style="width: 250px"
                />
              </div>
            </div>

            <!-- 主要内容区 -->
                  <div class="resource-content">
              <!-- 左侧分类导航 -->
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

              <!-- 右侧文件列表 -->
              <div class="resource-list">
                <!-- 面包屑导航 -->
                <el-breadcrumb separator="/">
                  <el-breadcrumb-item :to="{ path: '/' }">课程资源</el-breadcrumb-item>
                  <el-breadcrumb-item v-if="currentFolder">{{ currentFolder }}</el-breadcrumb-item>
                </el-breadcrumb>

                <!-- 文件列表 -->
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
                  <el-table-column label="操作" width="150" fixed="right">
                    <template #default="scope">
                      <el-button link type="primary" @click.stop="handleDownload(scope.row)">
                        下载
                      </el-button>
                      <el-button link type="primary" @click.stop="handlePreview(scope.row)">
                        预览
                      </el-button>
                      <el-button link type="danger" @click.stop="handleDelete(scope.row)">
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                  </div>
            </div>

            <!-- 上传文件对话框 -->
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

            <!-- 新建文件夹对话框 -->
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, User, Location, Calendar, Timer, ScaleToOriginal, EditPen, View, Delete, Plus, Download, Upload, Folder, Collection, VideoPlay, Files, More, UploadFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useRoute } from 'vue-router'
import AnimatedBackground from '@/components/AnimatedBackground.vue'
import { mockCourseDetail } from '@/mock/courseData'
import { checkAndSetMockEnvironment, getCourseDetail } from '@/api'

// 声明 gradeChart 变量
let gradeChart = null;

const activeName = ref('homework')
const courseId = ref(0)
const courseName = ref('')
const courseInfo = ref({
  grade_level: '',
  subject: '',
  description: ''
})

// 初始化数据
const announcements = ref([])
const assignments = ref([])
const resources = ref([])

// NEW: Filter states for assignments
const searchText = ref('')
const selectedType = ref('all') // 'all', 'homework', 'exam'
const selectedStatus = ref('all') // 'all', 'ongoing', 'ended', etc.

// 成绩相关数据
const searchGradeText = ref('')
const gradeList = ref([
    {
    index: 1,
    name: '张三',
    studentId: '2021001',
    classScore: 25,
    homeworkScore: 18,
    examScore: 45,
    totalScore: 88
  },
  // ... 更多测试数据
])

const loadTestData = () => {
  // 使用集中管理的mock数据
  announcements.value = mockCourseDetail.announcements;
  assignments.value = mockCourseDetail.assignments;
  resources.value = mockCourseDetail.resources;
  gradeList.value = mockCourseDetail.grades;
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

// 计算属性：过滤后的成绩列表
const filteredGradeList = computed(() => {
  if (!searchGradeText.value) return gradeList.value
  const search = searchGradeText.value.toLowerCase()
  return gradeList.value.filter(item => 
    item.name.toLowerCase().includes(search) || 
    item.studentId.toLowerCase().includes(search)
  )
})

// 获取成绩状态
const getScoreStatus = (score, total) => {
  const percentage = (score / total) * 100
  if (percentage >= 85) return 'success'
  if (percentage >= 60) return 'warning'
  return 'exception'
}

// 获取总分样式类
const getTotalScoreClass = (score) => {
  if (score >= 85) return 'score-excellent'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// 导出成绩单
const exportGrades = () => {
  ElMessage.success('开始导出成绩单')
  // 实现导出逻辑
}

// 编辑成绩
const editGrade = (row) => {
  ElMessage.info(`编辑学生 ${row.name} 的成绩`)
  // 实现编辑逻辑
}

// 查看成绩详情
const viewGradeDetail = (row) => {
  ElMessage.info(`查看学生 ${row.name} 的成绩详情`)
  // 实现查看详情逻辑
}

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

const loadClassInfo = async () => {
  try {
    // 检查并设置Mock环境
    const isMock = checkAndSetMockEnvironment();
    console.log('当前Mock状态:', isMock);

    // 先从接口获取课程详情
    if (courseId.value) {
      const res = await getCourseDetail(courseId.value)
      if (res.code === 0 && res.data) {
        courseInfo.value = res.data
        courseName.value = res.data.name || '未知课程'
        // 如果是mock环境，加载测试数据
        if (isMock) {
          loadTestData();
        }
        return
      }
    }

    // 兜底：从localStorage获取
    courseInfo.value = {
      grade_level: localStorage.getItem('currentCourseGradeLevel') || '未设置',
      subject: localStorage.getItem('currentCourseSubject') || '',
      description: localStorage.getItem('currentCourseDescription') || ''
    }
    courseName.value = localStorage.getItem('currentCourseName') || '未知课程'

    // 如果是mock环境，加载测试数据
    if (isMock) {
      loadTestData();
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

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取状态标签类型
const getStatusTagType = (status) => {
  const types = {
    '未开始': 'info',
    '进行中': 'warning',
    '已截止': 'danger'
  }
  return types[status] || 'info'
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  // 重新加载数据
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  // 重新加载数据
}

// Resource management state
const resourceSearchText = ref('')
const activeCategory = ref('all')
const currentFolder = ref('')
const uploadDialogVisible = ref(false)
const folderDialogVisible = ref(false)
const folderForm = ref({ name: '' })

// Computed: filtered resources
const filteredResources = computed(() => {
  let filtered = resources.value
  
  // Filter by category
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.type === activeCategory.value)
  }
  
  // Filter by search text
  if (resourceSearchText.value) {
    const keyword = resourceSearchText.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      item.uploader?.toLowerCase().includes(keyword)
    )
  }
  
  return filtered
})

// Resource management methods
const handleCategorySelect = (index) => {
  activeCategory.value = index
  fetchResources()
}

const handleUpload = () => {
  uploadDialogVisible.value = true
}

const handleCreateFolder = () => {
  folderDialogVisible.value = true
}

const confirmCreateFolder = () => {
  if (!folderForm.value.name) {
    ElMessage.warning('请输入文件夹名称')
    return
  }
  // TODO: Add folder creation logic
  ElMessage.success('文件夹创建成功')
  folderDialogVisible.value = false
  folderForm.value.name = ''
}

const handleRowClick = (row) => {
  if (row.type === 'folder') {
    currentFolder.value = row.name
    // TODO: Add folder navigation logic
  }
}

const handleDownload = async (file) => {
  try {
    ElMessage.info(`正在准备下载文件：${file.name}...`)
    // TODO: Add download logic
    console.log('Downloading file:', {
      id: file.id,
      name: file.name,
      type: file.type
    })
    ElMessage.success('下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error(`下载失败: ${error.message || '未知错误'}`)
  }
}

const handlePreview = async (file) => {
  try {
    console.log('Previewing file:', {
      id: file.id,
      name: file.name,
      type: file.type
    })
    // TODO: Add preview logic based on file type
    switch (file.type) {
      case 'document':
        ElMessage.info('文档预览功能开发中')
        break
      case 'video':
        ElMessage.info('视频预览功能开发中')
        break
      case 'courseware':
        ElMessage.info('课件预览功能开发中')
        break
      default:
        ElMessage.warning('该文件类型暂不支持预览')
    }
  } catch (error) {
    console.error('预览失败:', error)
    ElMessage.error('预览失败')
  }
}

const handleDelete = (file) => {
  ElMessageBox.confirm(
    `确定要删除 ${file.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // TODO: Add delete logic
      ElMessage.success('删除成功')
      fetchResources()
    } catch (error) {
      console.error('删除资源失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }).catch(() => {
    // User cancelled deletion
  })
}

const handleRemove = (file) => {
  if (file) {
    console.log('Removing file:', file.name)
    // Add actual file removal logic here
  }
}

const beforeRemove = (uploadFile) => {
  if (uploadFile) {
    return ElMessageBox.confirm(
      `确定移除 ${uploadFile.name} ？`
    ).then(
      () => true,
      () => false
    )
  }
  return Promise.resolve(false)
}

const customUpload = async ({ file }) => {
  if (!file) {
    ElMessage.error('无效的文件')
    return
  }

  try {
    console.log('Uploading file:', file.name)
    // TODO: Add upload logic
    ElMessage.success('上传成功')
    fetchResources()
    uploadDialogVisible.value = false
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
  }
}

const confirmUpload = () => {
  uploadDialogVisible.value = false
  fetchResources()
}

// Utility methods
const getFileIcon = (type) => {
  const iconMap = {
    folder: Folder,
    courseware: Collection,
    video: VideoPlay,
    document: Files,
    other: Document
  }
  return iconMap[type] || Document
}

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const fetchResources = async () => {
  try {
    // TODO: Add API call to fetch resources
    resources.value = [
      {
        id: 1,
        name: '示例文档.pdf',
        type: 'document',
        size: 1024 * 1024, // 1MB
        uploadTime: '2024-03-15 14:30',
        uploader: '张老师'
      },
      // Add more mock data as needed
    ]
  } catch (error) {
    console.error('获取资源列表失败:', error)
    ElMessage.error('获取资源列表失败')
  }
}
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

.homework-content {
  padding: 20px 0;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-filter {
  display: flex;
  align-items: center;
}

.assignment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.assignment-item {
  transition: transform 0.3s, box-shadow 0.3s;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
  margin-bottom: 16px;

  &.exam {
    border-left-color: #F56C6C;
  }

  &.homework {
    border-left-color: #67C23A;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.assignment-title-group {
  display: flex;
  align-items: center;
  gap: 10px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.assignment-type-tag {
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  color: white;

  &.exam {
    background-color: #F56C6C;
  }

  &.homework {
    background-color: #67C23A;
  }
}

.assignment-info {
  margin-bottom: 16px;

  p {
    margin-top: 0;
    margin-bottom: 12px;
    color: #606266;
    line-height: 1.6;
  }
}

.assignment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
  color: #909399;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.assignment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-custom {
  height: 32px;
  padding: 0 16px;
  font-size: 14px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  width: 100px;

  :deep(.el-icon) {
    margin-right: 4px;
    font-size: 16px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.grade-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 20px;
}

.grade-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  &.left-card {
    height: fit-content;
  }

  &.right-card {
    height: fit-content;
  }

  &.full-width {
    grid-column: 1 / -1;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;

  .header-right {
    display: flex;
    align-items: center;
  }
}

.scheme-content {
  padding: 20px;
}

.scheme-item {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.scheme-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #606266;
}

.statistics {
  display: flex;
  padding: 20px;
  gap: 40px;
}

.statistics-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.statistics-right {
  flex: 2;
}

.chart-container {
  text-align: center;
  margin-bottom: 20px;
}

.dashboard-wrapper {
  position: relative;
  display: inline-block;
}

.central-score {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-label {
  margin-top: 10px;
  color: #606266;
}

.score-details {
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.score-item {
  text-align: center;

  .score-label {
    color: #909399;
    font-size: 14px;
  }

  .score-value {
    display: block;
    color: #303133;
    font-size: 20px;
    font-weight: 500;
    margin-top: 5px;
  }
}

.table-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

// 成绩颜色样式
.score-excellent {
  color: #67c23a;
  font-weight: bold;
}

.score-pass {
  color: #e6a23c;
  font-weight: bold;
}

.score-fail {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.el-progress-bar__inner) {
  transition: width 0.6s ease;
}

:deep(.el-progress--line) {
  margin-bottom: 0;
}

:deep(.el-table) {
  margin-top: 10px;
}

:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
}

.resource-container {
  padding: 20px;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left-actions {
  display: flex;
  gap: 10px;
}

.resource-content {
  flex: 1;
  display: flex;
  gap: 20px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
}

.resource-nav {
  width: 200px;
  border-right: 1px solid #e4e7ed;
}

.resource-list {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.file-name {
  cursor: pointer;
  color: #606266;

  &:hover {
    color: #409EFF;
  }
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-icon {
  vertical-align: middle;
}
</style>