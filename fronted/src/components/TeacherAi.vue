<template>
  <div class="teacher-ai-container">
    <div class="knowledge-points-section">
      <h2>选择知识点</h2>
      <el-table
        v-loading="loading"
        :data="knowledgePoints"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          prop="name"
          label="知识点名称"
        />
        <el-table-column
          prop="subject"
          label="所属学科"
        />
        <el-table-column
          prop="description"
          label="描述"
        />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </div>

    <div class="action-buttons">
      <el-button 
        type="primary" 
        @click="handleGeneratePPT"
        :loading="isGeneratingPPT"
        :disabled="selectedPoints.length === 0"
      >
        {{ isGeneratingPPT ? '正在生成PPT...' : '生成知识点PPT' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getKnowledgePoints } from '@/api'
import { ElMessage } from 'element-plus'

defineProps({
  isGeneratingPPT: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['generate-ppt'])

const loading = ref(false)
const knowledgePoints = ref([])
const selectedPoints = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 加载知识点列表
const loadKnowledgePoints = async () => {
  loading.value = true
  try {
    const response = await getKnowledgePoints({
      page: currentPage.value,
      page_size: pageSize.value
    })

    if (response.code === 0 && response.data) {
      knowledgePoints.value = response.data.results
      total.value = response.data.count
    } else {
      ElMessage.error(response.msg || '获取知识点列表失败')
    }
  } catch (error) {
    console.error('加载知识点失败:', error)
    ElMessage.error('加载知识点失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedPoints.value = selection
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  loadKnowledgePoints()
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadKnowledgePoints()
}

const handleGeneratePPT = () => {
  if (selectedPoints.value.length === 0) {
    ElMessage.warning('请先选择要生成PPT的知识点')
    return
  }
  emit('generate-ppt', selectedPoints.value)
}

onMounted(() => {
  loadKnowledgePoints()
})
</script>

<style scoped>
.teacher-ai-container {
  padding: 20px;
}

.knowledge-points-section {
  margin-bottom: 20px;
}

.knowledge-points-section h2 {
  margin-bottom: 16px;
  color: #333;
}

.action-buttons {
  margin-top: 20px;
  text-align: right;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style> 