<template>
  <div class="stat-card">
    <div class="card-header">
      <div class="header-left">
        <h3>高频错误知识点</h3>
      </div>
    </div>
    <div class="error-list" v-loading="loading">
      <div v-if="errorPoints.length > 0">
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
      <div v-else class="no-data">
        <el-empty description="暂无错误知识点数据" />
      </div>
    </div>
  </div>
</template>

<script>
// 模拟数据：课程对应的错误知识点
const courseErrorPoints = {
  'python': [
    { name: '变量作用域', description: '局部变量和全局变量的概念混淆，未正确理解变量的生命周期' },
    { name: '列表切片', description: '对列表切片的起始索引和步长理解不清，导致获取错误的子列表' },
    { name: '递归函数', description: '递归的终止条件设置不当，或递归深度过大导致栈溢出' },
    { name: '异常处理', description: '未正确使用try-except语句，异常捕获范围过大或过小' },
    { name: '文件操作', description: '未正确关闭文件句柄，或未使用with语句进行文件操作' }
  ],
  'java': [
    { name: '内存管理', description: '对象创建和垃圾回收机制理解不清，导致内存泄漏' },
    { name: '多线程同步', description: '线程同步问题处理不当，导致死锁或竞态条件' },
    { name: '继承与多态', description: '方法重写和重载概念混淆，接口实现不完整' },
    { name: '集合框架', description: '对各种集合类的特性理解不足，使用场景选择不当' },
    { name: '异常处理', description: '检查异常和运行时异常的处理方式不当' }
  ],
  'javascript': [
    { name: '闭包使用', description: '闭包概念理解不清，导致内存泄漏或作用域问题' },
    { name: '异步编程', description: 'Promise和async/await使用不当，回调地狱问题' },
    { name: '原型链', description: '对JavaScript原型继承机制理解不足，导致继承问题' },
    { name: '事件处理', description: '事件冒泡和捕获机制处理不当，事件监听器未及时移除' },
    { name: '变量提升', description: 'let、const和var的作用域和提升机制理解不清' }
  ],
  'c++': [
    { name: '指针操作', description: '指针的使用和内存管理不当，导致内存泄漏或访问越界' },
    { name: '内存管理', description: '动态内存分配和释放不当，new和delete使用不匹配' },
    { name: '模板编程', description: '模板特化和实例化理解不清，导致编译错误' },
    { name: 'STL使用', description: '标准模板库的使用不当，迭代器失效问题' },
    { name: '多重继承', description: '菱形继承问题处理不当，虚函数使用不正确' }
  ]
}

export default {
  name: 'FrequentErrors',
  props: {
    selectedCourse: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      errorPoints: [],
      loading: false
    }
  },
  watch: {
    selectedCourse: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.generateErrorPoints()
        } else {
          this.errorPoints = []
        }
      }
    }
  },
  methods: {
    generateErrorPoints() {
      this.loading = true
      
      // 模拟加载延迟
      setTimeout(() => {
        try {
          // 根据课程ID获取课程名称（这里简单处理，实际应该从父组件传入课程信息）
          const courseTypes = ['python', 'java', 'javascript', 'c++']
          const courseType = courseTypes[Math.floor(Math.random() * courseTypes.length)]
          
          // 获取对应课程的错误知识点
          const points = courseErrorPoints[courseType] || []
          
          // 为每个知识点生成随机的错误率和频次
          this.errorPoints = points.map(point => ({
            name: point.name,
            errorRate: Math.floor(Math.random() * 30) + 60, // 60-90之间的随机数
            frequency: Math.floor(Math.random() * 50) + 50, // 50-100之间的随机数
            details: point.description
          }))
          
          // 按错误率排序
          this.errorPoints.sort((a, b) => b.errorRate - a.errorRate)
          
        } catch (error) {
          console.error('生成错误知识点数据失败:', error)
          this.errorPoints = []
        } finally {
          this.loading = false
        }
      }, 500) // 添加500ms延迟模拟加载
    },
    showDetail(item) {
      this.$message({
        message: item.details,
        type: 'info',
        duration: 5000,
        showClose: true
      })
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

.no-data {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-empty__description) {
  color: #8aa6c1;
}
</style> 