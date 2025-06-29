<template>
  <div class="usage-status">
    <div class="status-cards">
      <div class="status-card">
         <div class="status-card">
        <div class="card-wrapper">
          <img src="@/assets/数据指标 (2)(1).png" alt="icon" class="status-icon" />
          <div class="data-content">
            <div class="number">12.18</div>
            <div class="label">教师今日使用次数</div>
          </div>
        </div>
      </div>
      </div>
       <div class="status-card">
        <div class="card-wrapper">
          <img src="@/assets/数据指标 (2)(1).png" alt="icon" class="status-icon" />
          <div class="data-content">
            <div class="number">12.18</div>
            <div class="label">教师今日使用次数</div>
          </div>
        </div>
      </div>
       <div class="status-card">
        <div class="card-wrapper">
          <img src="@/assets/数据指标 (2)(1).png" alt="icon" class="status-icon" />
          <div class="data-content">
            <div class="number">12.18</div>
            <div class="label">教师今日使用次数</div>
          </div>
        </div>
      </div>
      <div class="status-card">
        <div class="card-wrapper">
          <img src="@/assets/数据指标 (2)(1).png" alt="icon" class="status-icon" />
          <div class="data-content">
            <div class="number">12.18</div>
            <div class="label">教师今日使用次数</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UsageStatus'
}
</script>

<style scoped>
.usage-status {
  padding: 15px;
  background: linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('@/assets/image 8.png') no-repeat;
  background-size: 100% 100%;
  height: 200px;
  display: flex;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
}

.status-cards {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
}

.status-card {
  width: 180px;
  height: 150px;
  position: relative;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  justify-content: flex-start;
  gap: 0;
}

.status-icon {
  width: 120px;
  height: 120px;
  margin-right: -55px;
  object-fit: contain;
  position: relative;
  z-index: 1;
}

.data-content {
  flex: 1;
  position: relative;
  z-index: 2;
  text-align: right;
  padding-right: 15px;
  margin-left: -15px;
}

.number {
  font-size: 20px;
  font-weight: bold;
  color: #00e0ff;
  margin-bottom: 2px;
}

.unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2px;
}

.label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.detail-btn {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
}

@media (max-width: 768px) {
  .status-cards {
    flex-wrap: wrap;
    padding: 0 10px;
  }
  .status-card {
    width: calc(50% - 8px);
  }
}

@media (max-width: 480px) {
  .status-card {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style> 