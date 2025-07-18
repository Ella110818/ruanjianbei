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
      // 基础课程优化模板
      baseOptimizations: {
        'teaching': [ // 教学类课程通用优化方向
          {
            title: '教学方法优化',
            items: [
              '增加互动教学环节',
              '引入案例教学方式',
              '开展分组讨论活动'
            ]
          },
          {
            title: '学习评估改进',
            items: [
              '建立多维度评价体系',
              '实施形成性评估方案',
              '提供及时学习反馈'
            ]
          },
          {
            title: '资源建设完善',
            items: [
              '丰富在线学习资源',
              '建设微课视频库',
              '开发实践练习题库'
            ]
          }
        ],
        'programming': [ // 编程类课程通用优化方向
          {
            title: '实践环境优化',
            items: [
              '搭建在线编程环境',
              '提供自动评测系统',
              '建立代码版本管理'
            ]
          },
          {
            title: '编程能力培养',
            items: [
              '设计阶段性项目实战',
              '举办编程竞赛活动',
              '建立代码审查机制'
            ]
          },
          {
            title: '技术支持体系',
            items: [
              '完善技术文档库',
              '提供在线答疑平台',
              '组织技术分享会'
            ]
          }
        ],
        'science': [ // 理科类课程通用优化方向
          {
            title: '概念理解强化',
            items: [
              '开发概念可视化工具',
              '建立知识关联图谱',
              '设计概念理解测评'
            ]
          },
          {
            title: '解题能力提升',
            items: [
              '构建题型分类库',
              '提供解题思路指导',
              '开展解题方法讨论'
            ]
          },
          {
            title: '应用能力培养',
            items: [
              '增加实际应用案例',
              '开展建模训练',
              '设置跨学科专题'
            ]
          }
        ],
        'language': [ // 语言类课程通用优化方向
          {
            title: '语言技能提升',
            items: [
              '开展口语训练活动',
              '强化听力练习',
              '组织写作工作坊'
            ]
          },
          {
            title: '文化理解深化',
            items: [
              '引入文化背景教学',
              '组织文化交流活动',
              '开展主题文化周'
            ]
          },
          {
            title: '应用能力培养',
            items: [
              '设置情境对话练习',
              '开展翻译实践',
              '举办语言竞赛'
            ]
          }
        ]
      },
      // 特定课程优化方向
      optimizations: {
        '1': [ // Python编程基础
          {
            title: '编程实践强化',
            items: [
              '增加实时编程演示和代码分析',
              '设计阶段性编程项目实战',
              '建立代码评审和反馈机制'
            ]
          },
          {
            title: '学习路径优化',
            items: [
              '按难度划分学习模块',
              '提供个性化练习推荐',
              '建立编程进度追踪系统'
            ]
          },
          {
            title: '互动学习增强',
            items: [
              '组织编程竞赛和挑战',
              '建立学习社区和讨论组',
              '提供在线即时编程辅导'
            ]
          }
        ],
        '2': [ // TensorFlow应用开发
          {
            title: '实践环境优化',
            items: [
              '搭建云端GPU训练环境',
              '提供预配置的开发环境',
              '建立模型部署演示平台'
            ]
          },
          {
            title: '项目驱动学习',
            items: [
              '设计AI实际应用案例',
              '分阶段项目开发指导',
              '建立项目评估体系'
            ]
          },
          {
            title: '技术支持体系',
            items: [
              '提供框架使用文档库',
              '建立技术问题答疑平台',
              '组织技术分享讨论会'
            ]
          }
        ],
        '3': [ // 语文
          {
            title: '阅读能力提升',
            items: [
              '建立分级阅读体系',
              '开展主题阅读活动',
              '训练快速阅读技巧'
            ]
          },
          {
            title: '写作能力培养',
            items: [
              '设计写作主题训练',
              '建立写作评价体系',
              '组织写作竞赛活动'
            ]
          },
          {
            title: '综合素养提升',
            items: [
              '开展课外阅读指导',
              '举办语文知识竞赛',
              '组织文学社团活动'
            ]
          }
        ],
        '6': [ // 数学（高数上册）
          {
            title: '概念理解强化',
            items: [
              '开发数学概念可视化工具',
              '建立知识点关联图谱',
              '设计概念理解测评'
            ]
          },
          {
            title: '解题能力提升',
            items: [
              '构建题型分类练习库',
              '提供解题思路指导',
              '开展解题方法讨论'
            ]
          },
          {
            title: '应用能力培养',
            items: [
              '增加实际应用案例',
              '开展建模训练',
              '设置跨学科专题'
            ]
          }
        ],
        '13': [ // 体育
          {
            title: '体能提升',
            items: [
              '制定个性化训练计划',
              '建立体能评估体系',
              '开展专项体能训练'
            ]
          },
          {
            title: '运动技能',
            items: [
              '提供动作要领视频',
              '开展技术动作训练',
              '组织技能达标测试'
            ]
          },
          {
            title: '健康管理',
            items: [
              '建立运动记录系统',
              '提供营养健康指导',
              '开展体育保健知识讲座'
            ]
          }
        ],
        '14': [ // 测试集成课程
          {
            title: 'AI服务集成',
            items: [
              '优化AI模型集成流程',
              '提供服务性能监控',
              '建立测试用例库'
            ]
          },
          {
            title: '实践环境',
            items: [
              '搭建测试环境平台',
              '提供自动化测试工具',
              '建立持续集成系统'
            ]
          },
          {
            title: '质量保证',
            items: [
              '制定测试规范文档',
              '建立问题跟踪机制',
              '开展代码审查活动'
            ]
          }
        ]
      }
    }
  },
  methods: {
    // 根据课程类型获取优化方向
    getCourseType(courseId) {
      // 这里可以根据课程ID判断课程类型
      const programmingCourses = ['1', '2', '14'] // Python、TensorFlow、测试集成
      const languageCourses = ['3'] // 语文
      const scienceCourses = ['6'] // 数学
      const teachingCourses = ['13'] // 体育

      if (programmingCourses.includes(courseId)) return 'programming'
      if (languageCourses.includes(courseId)) return 'language'
      if (scienceCourses.includes(courseId)) return 'science'
      if (teachingCourses.includes(courseId)) return 'teaching'
      
      return 'teaching' // 默认返回教学类
    },

    // 生成课程优化建议
    generateOptimizations(courseId) {
      // 如果有特定的优化方向，直接返回
      if (this.optimizations[courseId]) {
        return this.optimizations[courseId]
      }

      // 否则返回对应类型的通用优化方向
      const courseType = this.getCourseType(courseId)
      return this.baseOptimizations[courseType]
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
      if (!this.selectedCourse) return []
      return this.generateOptimizations(this.selectedCourse)
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