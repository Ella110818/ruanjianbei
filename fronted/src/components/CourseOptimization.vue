<template>
  <div class="stat-card">
    <div class="card-header">
      <h3>课程优化方向</h3>
    </div>
    <div v-if="selectedCourse && currentOptimizations.length > 0" class="optimization-content">
      <div class="optimization-scroll">
        <el-timeline>
          <el-timeline-item
            v-for="(category, index) in currentOptimizations"
            :key="index"
            :type="'primary'"
            :hollow="true"
            :size="'large'"
          >
            <template #dot>
              <div class="custom-dot">
                <el-icon :size="24" color="#409EFF">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="12" r="6" fill="currentColor"/>
                  </svg>
                </el-icon>
              </div>
            </template>
            <div class="timeline-content">
              <h4 class="category-title">{{ category.title }}</h4>
              <div class="content-box">
                <div class="category-items">
                  <div v-for="(item, itemIndex) in category.items" :key="itemIndex" class="item">
                    {{ item }}
                  </div>
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
    <div v-else class="empty-state">
      {{ selectedCourse ? '暂无该课程的优化方向' : '请选择课程查看优化方向' }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseOptimization',
  props: {
    selectedCourse: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      courses: [
        { value: 'circuit', label: '电路分析' },
        { value: 'math', label: '高等数学' },
        { value: 'physics', label: '大学物理' }
      ],
      optimizations: {
        circuit: [
          {
            title: '教学内容优化',
            items: [
              '开发虚拟电路实验平台，提供实时模拟环境',
              '将节点电压法拆分为三个子技能模块',
              '增加实际工程案例的分析练习'
            ]
          },
          {
            title: '教学方法改进',
            items: [
              '采用翻转课堂模式，课前视频学习理论',
              '引入同伴教学，促进小组讨论和互助',
              '建立错题回溯机制，强化问题分析能力'
            ]
          },
          {
            title: '评价体系改革',
            items: [
              '增设期中"复活赛"机制',
              '提高平时成绩占比至40%',
              '实施自适应难度的阶段性测验'
            ]
          }
        ],
        math: [
          {
            title: '基础强化',
            items: [
              '开设数学预备课程填补基础漏洞',
              '按学生基础水平分层教学',
              '建立数学思维训练体系'
            ]
          },
          {
            title: '应用导向',
            items: [
              '增加专业相关的应用题实践',
              '开发数学建模训练模块',
              '设置跨学科综合问题讨论'
            ]
          },
          {
            title: '学习支持',
            items: [
              '配备专职数学辅导员',
              '建立数学在线答疑平台',
              '组织数学竞赛和研讨活动'
            ]
          }
        ],
        physics: [
          {
            title: '实验教学',
            items: [
              '增设虚拟物理实验平台',
              '强化实验数据分析能力',
              '开展创新性物理实验项目'
            ]
          },
          {
            title: '理论教学',
            items: [
              '加强物理概念可视化教学',
              '引入现代物理前沿案例',
              '建立物理问题解决模型'
            ]
          },
          {
            title: '能力培养',
            items: [
              '训练物理直觉和估算能力',
              '培养科学思维和研究方法',
              '强化实验设计和创新能力'
            ]
          }
        ]
      }
    }
  },
  watch: {
    selectedCourse: {
      handler(newVal) {
        console.log('CourseOptimization - selectedCourse changed:', newVal);
        console.log('Current optimizations:', this.currentOptimizations);
      },
      immediate: true
    }
  },
  created() {
    console.log('CourseOptimization created - selectedCourse:', this.selectedCourse);
  },
  computed: {
    currentOptimizations() {
      console.log('Computing currentOptimizations for course:', this.selectedCourse);
      return this.optimizations[this.selectedCourse] || [];
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
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(120, 196, 221, 0.1) 0%, rgba(47, 137, 227, 0.05) 100%);
  pointer-events: none;
}

.card-header {
  display: flex;
  align-items: center;
  padding-left: 20px;
  margin-bottom: 15px;
  position: relative;
  z-index: 1;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #3f6487 !important;
  margin-left: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  position: relative;
}

.optimization-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: calc(100% - 40px);
}

.optimization-scroll {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 0 10px;
}

.optimization-scroll::-webkit-scrollbar {
  width: 6px;
}

.optimization-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;
}

.category-title {
  font-size: 15px;
  color: #78c4dd;
  margin: 0;
  font-weight: 500;
  line-height: 24px;
  padding-left: 8px;
  display: flex;
  align-items: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-title::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #78c4dd;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 8px rgba(120, 196, 221, 0.6);
}

.content-box {
  background: rgba(120, 196, 221, 0.08);
  padding: 15px 18px;
  margin-left: 8px;
  border-radius: 12px;
  position: relative;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.content-box:hover {
  background: rgba(120, 196, 221, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.content-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(4, 108, 212, 0.2) 0%, rgba(214, 232, 238, 0.03) 100%);
  border-radius: 12px;
  pointer-events: none;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;
  position: relative;
  padding-left: 16px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.item:hover {
  color: #fff;
  transform: translateX(2px);
}

.item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: #78c4dd;
  border-radius: 50%;
  opacity: 0.8;
  box-shadow: 0 0 6px rgba(120, 196, 221, 0.4);
  transition: all 0.3s ease;
}

.item:hover::before {
  opacity: 1;
  transform: translateY(-50%) scale(1.2);
}

:deep(.el-timeline) {
  padding-left: 0;
}

:deep(.el-timeline-item__node) {
  background-color: transparent;
  border: none;
  z-index: 1;
}

:deep(.el-timeline-item__tail) {
  border-left: 2px solid rgba(120, 196, 221, 0.15);
  left: 3px;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 25px;
  margin-bottom: 24px;
  opacity: 0;
  transform: translateX(-10px);
  animation: slideIn 0.5s ease forwards;
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

:deep(.el-timeline-item:last-child .el-timeline-item__tail) {
  display: none;
}

.custom-dot {
  position: absolute;
  left: -9px;
  top: 5px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(120, 196, 221, 0.15);
  border-radius: 50%;
  backdrop-filter: blur(4px);
  box-shadow: 0 0 10px rgba(120, 196, 221, 0.2);
  transition: all 0.3s ease;
}

.custom-dot:hover {
  transform: scale(1.1);
  background: rgba(120, 196, 221, 0.25);
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  text-align: center;
  background: rgba(120, 196, 221, 0.08);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-select) {
  --el-select-input-focus-border-color: #78c4dd;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(78, 160, 197, 0.3);
  box-shadow: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

:deep(.el-select .el-input__wrapper:hover) {
  background: rgba(78, 160, 197, 0.4);
  border-color: rgba(255, 255, 255, 0.25);
}

:deep(.el-select .el-input__wrapper.is-focus) {
  background: rgba(78, 160, 197, 0.45);
  border-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-select-dropdown__item) {
  color: #ffffff;
}

:deep(.el-select-dropdown__item.hover) {
  background: rgba(78, 160, 197, 0.45);
}

:deep(.el-select-dropdown__item.selected) {
  background: rgba(78, 160, 197, 0.6);
  color: #ffffff;
}

:deep(.el-popper) {
  background: rgba(78, 160, 197, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(8px);
}

:deep(.el-popper__arrow::before) {
  background: rgba(78, 160, 197, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}

:deep(.el-input__inner) {
  color: #ffffff;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}
</style> 