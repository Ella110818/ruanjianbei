<template>
  <div class="analysis-page">
    <TeacherHeader />
    <div class="main-content">
      <div class="analysis-container">
        <!-- 数据概览卡片 -->
        <div class="overview-cards">
          <el-card class="stat-card">
            <div class="stat-title">总答题数</div>
            <div class="stat-value">{{ totalAnswers }}</div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-title">平均分</div>
            <div class="stat-value">{{ averageScore.toFixed(1) }}</div>
          </el-card>
          <el-card class="stat-card">
            <div class="stat-title">正确率</div>
            <div class="stat-value">{{ (correctRate * 100).toFixed(1) }}%</div>
          </el-card>
        </div>

        <!-- 筛选条件 -->
        <div class="filter-section">
          <el-form :inline="true" class="filter-form">
            <el-form-item label="课程选择">
              <el-select v-model="selectedCourse" placeholder="请选择课程">
                <el-option
                  v-for="course in courses"
                  :key="course.id"
                  :label="course.name"
                  :value="course.id"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchAnalysisData">查询</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 图表区域 -->
        <div class="charts-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="chart-card">
                <template v-slot:header>得分分布</template>
                <div ref="scoreDistChart" class="chart"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="chart-card">
                <template v-slot:header>知识点掌握情况</template>
                <div ref="knowledgeChart" class="chart"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 详细数据表格 -->
        <el-card class="table-section">
          <template v-slot:header>详细数据</template>
          <el-table :data="detailData" border style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="120"></el-table-column>
            <el-table-column prop="questionTitle" label="题目" min-width="200"></el-table-column>
            <el-table-column prop="score" label="得分" width="80"></el-table-column>
            <el-table-column prop="submitTime" label="提交时间" width="180"></el-table-column>
            <el-table-column prop="knowledge" label="知识点" width="150"></el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { API_CONFIG } from '@/api'
import TeacherHeader from '@/components/TeacherHeader.vue'

export default {
  name: 'TeacherAnalysis',
  components: {
    TeacherHeader
  },
  data() {
    return {
      // 统计数据
      totalAnswers: 0,
      averageScore: 0,
      correctRate: 0,
      
      // 筛选条件
      selectedCourse: '',
      dateRange: [],
      courses: [],
      
      // 图表实例
      scoreDistChart: null,
      knowledgeChart: null,
      
      // 表格数据
      detailData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  mounted() {
    this.initCharts()
    this.fetchCourses()
    this.fetchAnalysisData()
  },
  methods: {
    async fetchCourses() {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/courses`)
        const data = await response.json()
        this.courses = data
      } catch (error) {
        console.error('获取课程列表失败:', error)
        this.$message.error('获取课程列表失败')
      }
    },
    
    async fetchAnalysisData() {
      try {
        const params = new URLSearchParams({
          courseId: this.selectedCourse,
          startDate: this.dateRange[0] || '',
          endDate: this.dateRange[1] || '',
          page: this.currentPage,
          pageSize: this.pageSize
        })
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/analysis?${params}`)
        const data = await response.json()
        
        // 更新统计数据
        this.totalAnswers = data.totalAnswers
        this.averageScore = data.averageScore
        this.correctRate = data.correctRate
        
        // 更新表格数据
        this.detailData = data.details
        this.total = data.total
        
        // 更新图表
        this.updateCharts(data.chartData)
      } catch (error) {
        console.error('获取分析数据失败:', error)
        this.$message.error('获取分析数据失败')
      }
    },
    
    initCharts() {
      // 初始化得分分布图表
      this.scoreDistChart = echarts.init(this.$refs.scoreDistChart)
      this.scoreDistChart.setOption({
        title: { text: '得分分布' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['0-60', '60-70', '70-80', '80-90', '90-100'] },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [0, 0, 0, 0, 0] }]
      })
      
      // 初始化知识点掌握情况图表
      this.knowledgeChart = echarts.init(this.$refs.knowledgeChart)
      this.knowledgeChart.setOption({
        title: { text: '知识点掌握情况' },
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '60%',
          data: []
        }]
      })
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.scoreDistChart?.resize()
        this.knowledgeChart?.resize()
      })
    },
    
    updateCharts(chartData) {
      // 更新得分分布图表
      this.scoreDistChart?.setOption({
        series: [{ data: chartData.scoreDist }]
      })
      
      // 更新知识点掌握情况图表
      this.knowledgeChart?.setOption({
        series: [{ data: chartData.knowledge }]
      })
    },
    
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchAnalysisData()
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchAnalysisData()
    }
  },
  beforeUnmount() {
    // 销毁图表实例
    this.scoreDistChart?.dispose()
    this.knowledgeChart?.dispose()
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style scoped>
.analysis-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-top: 64px;
}

.main-content {
  min-height: calc(100vh - 64px);
}

.analysis-container {
  padding: 20px;
}

.overview-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  text-align: center;
}

.stat-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.filter-section {
  margin-bottom: 20px;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart {
  height: 300px;
}

.table-section {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .overview-cards {
    flex-direction: column;
  }
  
  .el-form-item {
    display: block;
    margin-right: 0;
    margin-bottom: 20px;
  }
}
</style> 