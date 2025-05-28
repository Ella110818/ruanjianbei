<template>
  <div class="dashboard-container">
    <AdminHeader />
    
    <div class="dashboard-content">
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-header">
            <i class="el-icon-user"></i>
            <span>总用户数</span>
          </div>
          <div class="stat-value">1,234</div>
          <div class="stat-footer">
            <span class="trend up">↑ 12%</span>
            <span class="period">较上月</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <i class="el-icon-s-custom"></i>
            <span>活跃教师</span>
          </div>
          <div class="stat-value">156</div>
          <div class="stat-footer">
            <span class="trend up">↑ 8%</span>
            <span class="period">较上月</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <i class="el-icon-reading"></i>
            <span>在线课程</span>
          </div>
          <div class="stat-value">89</div>
          <div class="stat-footer">
            <span class="trend up">↑ 15%</span>
            <span class="period">较上月</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <i class="el-icon-document"></i>
            <span>教学资源</span>
          </div>
          <div class="stat-value">2,567</div>
          <div class="stat-footer">
            <span class="trend up">↑ 20%</span>
            <span class="period">较上月</span>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-card">
          <div class="chart-header">
            <h3>用户增长趋势</h3>
            <el-select v-model="timeRange" placeholder="选择时间范围" size="small">
              <el-option label="最近7天" value="7"></el-option>
              <el-option label="最近30天" value="30"></el-option>
              <el-option label="最近90天" value="90"></el-option>
            </el-select>
          </div>
          <div class="chart-content">
            <!-- 这里可以集成echarts等图表库 -->
            <div class="chart-placeholder">用户增长趋势图表</div>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3>资源使用分析</h3>
            <el-radio-group v-model="resourceType" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="document">文档</el-radio-button>
              <el-radio-button label="video">视频</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-content">
            <!-- 这里可以集成echarts等图表库 -->
            <div class="chart-placeholder">资源使用分析图表</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminHeader from '@/components/AdminHeader.vue'

export default {
  name: 'AdminDashboard',
  components: {
    AdminHeader
  },
  data() {
    return {
      timeRange: '7',
      resourceType: 'all'
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.dashboard-content {
  padding: 84px 20px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  margin-bottom: 16px;
}

.stat-header i {
  font-size: 20px;
  color: #2C3E50;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 16px;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend {
  font-weight: 500;
}

.trend.up {
  color: #67C23A;
}

.trend.down {
  color: #F56C6C;
}

.period {
  color: #909399;
  font-size: 14px;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 16px;
  color: #2C3E50;
  margin: 0;
}

.chart-content {
  height: 300px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  color: #909399;
}

@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }
}
</style> 