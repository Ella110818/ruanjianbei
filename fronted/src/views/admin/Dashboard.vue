<template>
  <div class="dashboard-container">
    <AdminHeader />
    <div class="dashboard-content">
      <div class="title-image">
        <img src="@/assets/databack.png" alt="标题" />
      </div>
      <!-- 这里可以添加新的内容 -->
    </div>
  </div>
</template>

<script>
import AdminHeader from '@/components/AdminHeader.vue'

export default {
  name: 'AdminDashboard',
  components: {
    AdminHeader
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  background-image: url('@/assets/bg002.png');
  background-size: cover;
  background-position: center;
}

.dashboard-content {
  padding: 84px 20px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.title-image {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.title-image img {
  max-width: 400px; /* 可以根据实际图片大小调整 */
  height: auto;
}
</style> 