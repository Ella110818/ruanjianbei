<template>
  <div class="stat-card">
    <div class="card-header">
      <div class="header-left">
        <h3>高频错误知识点</h3>
      </div>
    </div>
    <div class="error-list">
      <div v-for="(item, index) in errorPoints" 
           :key="index" 
           class="error-item"
           @click="showDetail(item)">
        <div class="rank-number" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
        <div class="error-info">
          <div class="error-content">{{ item.name }}</div>
          <div class="error-stats">
            <span class="stat-item">
              <i class="el-icon-warning-outline"></i>
              错误率: {{ item.errorRate }}%
            </span>
            <span class="stat-item">
              <i class="el-icon-time"></i>
              出现: {{ item.frequency }}次
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FrequentErrors',
  data() {
    return {
      errorPoints: [
        {
          name: '北京',
          errorRate: 85,
          frequency: 120,
          details: '这里是详细说明...'
        },
        {
          name: '黑龙江',
          errorRate: 75,
          frequency: 98,
          details: '这里是详细说明...'
        },
        {
          name: '上海',
          errorRate: 65,
          frequency: 86,
          details: '这里是详细说明...'
        }
      ]
    }
  },
  methods: {
    showDetail(item) {
      console.log('查看详情:', item.details)
    }
  }
}
</script>

<style scoped>
.stat-card {
  background: linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('@/assets/image 8.png') no-repeat;
  background-size: 100% 100%;
  padding: 10px 25px 25px 25px;
  border-radius: 10px;
  height: 320px;
  color: #fff;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #3f6487 !important;
  margin-left: 20px;
}

.error-list {
  padding: 0 20px;
  height: calc(100% - 60px);
  overflow-y: auto;
}

.error-list::-webkit-scrollbar {
  width: 6px;
}

.error-list::-webkit-scrollbar-thumb {
  background: rgba(63, 100, 135, 0.2);
  border-radius: 3px;
}

.error-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 12px 16px;
  background: linear-gradient(90deg, rgba(47, 137, 227, 0.2) 0%, rgba(214, 232, 238, 0.1) 100%);
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.error-item:hover {
  transform: translateX(5px);
  background: linear-gradient(90deg, rgba(47, 137, 227, 0.3) 0%, rgba(214, 232, 238, 0.2) 100%);
}

.rank-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-right: 16px;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.rank-1 {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
}

.rank-2 {
  background: linear-gradient(135deg, #4ECDC4 0%, #6EE7E0 100%);
}

.rank-3 {
  background: linear-gradient(135deg, #45B7D1 0%, #65D7F1 100%);
}

.error-info {
  flex: 1;
  margin-right: 16px;
}

.error-content {
  font-size: 15px;
  color: #3f6487;
  margin-bottom: 4px;
  font-weight: 500;
}

.error-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 12px;
  color: #8aa6c1;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style> 