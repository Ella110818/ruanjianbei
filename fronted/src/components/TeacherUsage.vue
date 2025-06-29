<template>
  <div class="stat-card">
    <div class="content">
      <div class="card card-1">
        <img src="@/assets/Frame 1321315165.png" alt="frame" class="metric-image" />
      </div>
      <div class="card card-2">
        <img src="@/assets/Frame 1321315170.png" alt="frame" class="metric-image" />
      </div>
      <div class="card card-3">
        <img src="@/assets/Frame 1321315165.png" alt="frame" class="metric-image" />
      </div>
      <div class="card card-4">
        <img src="@/assets/Frame 1321315170.png" alt="frame" class="metric-image" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeacherUsage'
}
</script>

<style scoped>
.stat-card {
  position: relative;
  height: 400px;
  width: 100%;
}

.content {
  position: relative;
  width: 100%;
  height: 100%;
}

.card {
  position: absolute;
  width: 60%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.metric-image {
  width: 200%;
  height: 200%;
  object-fit: contain;
  margin-bottom: -80px;
}

.card-1 {
  left: -29%;
  top: 4%;
}

.card-2 {
  right: -60%;
  top: 4%;
}

.card-3 {
  left: -29%;
  top: 38%;
}

.card-4 {
  right: -60%;
  top: 38%;
}
</style> 