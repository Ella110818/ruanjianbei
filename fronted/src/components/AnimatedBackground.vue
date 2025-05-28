<template>
  <div class="animated-background">
    <div class="dot" v-for="i in 40" :key="i"></div>
  </div>
</template>

<script setup>
// 无需额外逻辑
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.dot {
  position: absolute;
  border-radius: 50%;
  opacity: 0.2;
  background: rgba(13, 71, 161, 0.8);
}

.dot:nth-child(1) { width: 10px; height: 10px; left: 10%; top: 20%; animation: brownian1 20s infinite; }
.dot:nth-child(2) { width: 14px; height: 14px; left: 20%; top: 40%; animation: brownian2 25s infinite; }
.dot:nth-child(3) { width: 8px; height: 8px; left: 30%; top: 60%; animation: brownian3 22s infinite; }
.dot:nth-child(4) { width: 12px; height: 12px; left: 40%; top: 80%; animation: brownian4 28s infinite; }
.dot:nth-child(5) { width: 16px; height: 16px; left: 50%; top: 30%; animation: brownian5 24s infinite; }
.dot:nth-child(6) { width: 9px; height: 9px; left: 60%; top: 50%; animation: brownian1 26s infinite; }
.dot:nth-child(7) { width: 11px; height: 11px; left: 70%; top: 70%; animation: brownian2 23s infinite; }
.dot:nth-child(8) { width: 13px; height: 13px; left: 80%; top: 25%; animation: brownian3 27s infinite; }
.dot:nth-child(9) { width: 10px; height: 10px; left: 90%; top: 45%; animation: brownian4 21s infinite; }
.dot:nth-child(10) { width: 15px; height: 15px; left: 15%; top: 85%; animation: brownian5 29s infinite; }
.dot:nth-child(11) { width: 8px; height: 8px; left: 25%; top: 15%; animation: brownian1 22s infinite; }
.dot:nth-child(12) { width: 12px; height: 12px; left: 35%; top: 35%; animation: brownian2 26s infinite; }
.dot:nth-child(13) { width: 14px; height: 14px; left: 45%; top: 55%; animation: brownian3 24s infinite; }
.dot:nth-child(14) { width: 9px; height: 9px; left: 55%; top: 75%; animation: brownian4 28s infinite; }
.dot:nth-child(15) { width: 11px; height: 11px; left: 65%; top: 25%; animation: brownian5 23s infinite; }
.dot:nth-child(16) { width: 13px; height: 13px; left: 75%; top: 45%; animation: brownian1 27s infinite; }
.dot:nth-child(17) { width: 10px; height: 10px; left: 85%; top: 65%; animation: brownian2 25s infinite; }
.dot:nth-child(18) { width: 15px; height: 15px; left: 95%; top: 85%; animation: brownian3 29s infinite; }
.dot:nth-child(19) { width: 8px; height: 8px; left: 5%; top: 95%; animation: brownian4 21s infinite; }
.dot:nth-child(20) { width: 12px; height: 12px; left: 15%; top: 5%; animation: brownian5 24s infinite; }
.dot:nth-child(21) { width: 10px; height: 10px; left: 22%; top: 88%; animation: brownian1 23s infinite; }
.dot:nth-child(22) { width: 13px; height: 13px; left: 33%; top: 12%; animation: brownian2 27s infinite; }
.dot:nth-child(23) { width: 9px; height: 9px; left: 44%; top: 92%; animation: brownian3 25s infinite; }
.dot:nth-child(24) { width: 15px; height: 15px; left: 55%; top: 8%; animation: brownian4 22s infinite; }
.dot:nth-child(25) { width: 11px; height: 11px; left: 66%; top: 82%; animation: brownian5 26s infinite; }
.dot:nth-child(26) { width: 14px; height: 14px; left: 77%; top: 18%; animation: brownian1 24s infinite; }
.dot:nth-child(27) { width: 8px; height: 8px; left: 88%; top: 72%; animation: brownian2 28s infinite; }
.dot:nth-child(28) { width: 12px; height: 12px; left: 99%; top: 28%; animation: brownian3 21s infinite; }
.dot:nth-child(29) { width: 10px; height: 10px; left: 3%; top: 62%; animation: brownian4 25s infinite; }
.dot:nth-child(30) { width: 13px; height: 13px; left: 8%; top: 38%; animation: brownian5 27s infinite; }
.dot:nth-child(31) { width: 9px; height: 9px; left: 28%; top: 78%; animation: brownian1 26s infinite; }
.dot:nth-child(32) { width: 15px; height: 15px; left: 48%; top: 18%; animation: brownian2 23s infinite; }
.dot:nth-child(33) { width: 11px; height: 11px; left: 68%; top: 58%; animation: brownian3 28s infinite; }
.dot:nth-child(34) { width: 13px; height: 13px; left: 88%; top: 38%; animation: brownian4 24s infinite; }
.dot:nth-child(35) { width: 10px; height: 10px; left: 18%; top: 68%; animation: brownian5 22s infinite; }
.dot:nth-child(36) { width: 12px; height: 12px; left: 38%; top: 88%; animation: brownian1 27s infinite; }
.dot:nth-child(37) { width: 14px; height: 14px; left: 58%; top: 28%; animation: brownian2 25s infinite; }
.dot:nth-child(38) { width: 8px; height: 8px; left: 78%; top: 48%; animation: brownian3 23s infinite; }
.dot:nth-child(39) { width: 11px; height: 11px; left: 93%; top: 13%; animation: brownian4 26s infinite; }
.dot:nth-child(40) { width: 13px; height: 13px; left: 13%; top: 93%; animation: brownian5 24s infinite; }

@keyframes brownian1 {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(40px, -30px); }
  40% { transform: translate(-25px, 40px); }
  60% { transform: translate(35px, 25px); }
  80% { transform: translate(-30px, -35px); }
}

@keyframes brownian2 {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-35px, 25px); }
  50% { transform: translate(30px, -40px); }
  75% { transform: translate(-25px, -30px); }
}

@keyframes brownian3 {
  0%, 100% { transform: translate(0, 0); }
  30% { transform: translate(25px, 35px); }
  55% { transform: translate(-35px, -25px); }
  85% { transform: translate(30px, -30px); }
}

@keyframes brownian4 {
  0%, 100% { transform: translate(0, 0); }
  15% { transform: translate(-40px, -35px); }
  45% { transform: translate(35px, 30px); }
  75% { transform: translate(-25px, 40px); }
}

@keyframes brownian5 {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(30px, 40px); }
  50% { transform: translate(-40px, -30px); }
  80% { transform: translate(35px, -35px); }
}

/* 添加模糊渐变背景 */
.animated-background::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 50% 50%, rgba(13, 71, 161, 0.05) 0%, transparent 25%),
    radial-gradient(circle at 80% 20%, rgba(13, 71, 161, 0.05) 0%, transparent 35%),
    radial-gradient(circle at 20% 80%, rgba(13, 71, 161, 0.05) 0%, transparent 35%);
  animation: moveGradient 15s ease infinite;
}

@keyframes moveGradient {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-1%, 1%) scale(1.02); }
  66% { transform: translate(1%, -1%) scale(0.98); }
  100% { transform: translate(0, 0) scale(1); }
}
</style> 