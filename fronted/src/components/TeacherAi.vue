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
      <el-button 
        type="success" 
        @click="handleGenerateCourse"
        :loading="isGeneratingCourse"
        :disabled="selectedPoints.length === 0"
      >
        {{ isGeneratingCourse ? '正在生成课程...' : '生成课程内容' }}
      </el-button>
    </div>

    <!-- 生成课程内容的对话框 -->
    <el-dialog
      v-model="courseDialogVisible"
      title="生成课程内容"
      width="70%"
    >
      <div class="course-config">
        <el-form :model="courseConfig" label-width="120px">
          <el-form-item label="课程标题">
            <el-input v-model="courseConfig.title" placeholder="请输入课程标题" />
          </el-form-item>
          <el-form-item label="课程描述">
            <el-input
              v-model="courseConfig.description"
              type="textarea"
              :rows="3"
              placeholder="请输入课程描述"
            />
          </el-form-item>
          <el-form-item label="学科">
            <el-input v-model="courseConfig.subject" placeholder="请输入学科" />
          </el-form-item>
          <el-form-item label="年级">
            <el-input v-model="courseConfig.grade_level" placeholder="请输入年级" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="courseDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmGenerateCourse" :loading="isGeneratingCourse">
            确认生成
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getKnowledgePoints, generateCourseContent } from '@/api'
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
const isGeneratingCourse = ref(false)
const courseDialogVisible = ref(false)

// 课程配置
const courseConfig = ref({
  title: '',
  description: '',
  subject: '',
  grade_level: '',
  knowledge_point_ids: []
})

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

// 处理生成课程内容
const handleGenerateCourse = () => {
  if (selectedPoints.value.length === 0) {
    ElMessage.warning('请先选择要生成课程的知识点')
    return
  }
  courseConfig.value.knowledge_point_ids = selectedPoints.value.map(point => point.id)
  courseDialogVisible.value = true
}

// 确认生成课程内容
const confirmGenerateCourse = async () => {
  if (!courseConfig.value.title) {
    ElMessage.warning('请输入课程标题')
    return
  }

  try {
    isGeneratingCourse.value = true
    const response = await generateCourseContent({
      ...courseConfig.value,
      use_ai: true
    })

    if (response.success && response.status_code === 201) {
      ElMessage.success('课程内容生成成功！')
      courseDialogVisible.value = false
      // 重置表单
      courseConfig.value = {
        title: '',
        description: '',
        subject: '',
        grade_level: '',
        knowledge_point_ids: []
      }
    } else {
      ElMessage.error(response.message || '生成课程内容失败')
    }
  } catch (error) {
    console.error('生成课程内容失败:', error)
    ElMessage.error('生成课程内容失败，请稍后重试')
  } finally {
    isGeneratingCourse.value = false
  }
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