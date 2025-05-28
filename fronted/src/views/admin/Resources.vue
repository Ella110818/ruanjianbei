<template>
  <div class="resources-container">
    <AdminHeader />
    
    <div class="resources-content">
      <div class="page-header">
        <h2>资源管理</h2>
        <el-button type="primary" @click="handleUpload">上传资源</el-button>
      </div>

      <div class="filter-section">
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索资源名称/上传者"
            prefix-icon="el-icon-search"
            clearable
            @clear="handleSearch"
            @input="handleSearch"
          >
          </el-input>
        </div>
        <div class="filter-options">
          <el-select v-model="typeFilter" placeholder="资源类型" @change="handleSearch">
            <el-option label="全部" value=""></el-option>
            <el-option label="文档" value="document"></el-option>
            <el-option label="视频" value="video"></el-option>
            <el-option label="图片" value="image"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
          <el-select v-model="courseFilter" placeholder="所属课程" @change="handleSearch">
            <el-option label="全部" value=""></el-option>
            <el-option
              v-for="course in courseOptions"
              :key="course.value"
              :label="course.label"
              :value="course.value"
            >
            </el-option>
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleSearch"
          >
          </el-date-picker>
        </div>
      </div>

      <el-table :data="resourceList" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" label="资源名称" min-width="200">
          <template #default="{ row }">
            <div class="resource-name">
              <i :class="getFileIcon(row.type)"></i>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="course" label="所属课程" width="150"></el-table-column>
        <el-table-column prop="uploader" label="上传者" width="120"></el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180"></el-table-column>
        <el-table-column prop="downloads" label="下载次数" width="100"></el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="handleDownload(row)">下载</el-button>
            <el-button type="text" @click="handlePreview(row)">预览</el-button>
            <el-button type="text" class="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div class="batch-actions">
          <el-button size="small" @click="handleBatchDownload">批量下载</el-button>
          <el-button size="small" type="danger" @click="handleBatchDelete">批量删除</el-button>
        </div>
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
        </el-pagination>
      </div>
    </div>

    <!-- 上传资源对话框 -->
    <el-dialog title="上传资源" v-model="uploadDialogVisible" width="500px">
      <el-form :model="uploadForm" :rules="uploadRules" ref="uploadForm" label-width="100px">
        <el-form-item label="所属课程" prop="course">
          <el-select v-model="uploadForm.course" placeholder="请选择课程">
            <el-option
              v-for="course in courseOptions"
              :key="course.value"
              :label="course.label"
              :value="course.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资源文件" prop="file">
          <el-upload
            class="upload-demo"
            drag
            action="/api/upload"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            :limit="1"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">
                支持任意格式文件，单个文件不超过100MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUploadSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import AdminHeader from '@/components/AdminHeader.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AdminResources',
  components: {
    AdminHeader
  },
  data() {
    return {
      loading: false,
      searchQuery: '',
      typeFilter: '',
      courseFilter: '',
      dateRange: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      uploadDialogVisible: false,
      resourceList: [
        {
          id: 1,
          name: '课程大纲.docx',
          type: 'document',
          size: 1024576, // 1MB
          course: '高等数学',
          uploader: '张老师',
          uploadTime: '2024-03-15 10:30:00',
          downloads: 25
        },
        {
          id: 2,
          name: '实验演示.mp4',
          type: 'video',
          size: 52428800, // 50MB
          course: '物理实验',
          uploader: '李老师',
          uploadTime: '2024-03-14 15:20:00',
          downloads: 18
        }
      ],
      courseOptions: [
        { label: '高等数学', value: 'math' },
        { label: '物理实验', value: 'physics' },
        { label: '程序设计', value: 'programming' }
      ],
      uploadForm: {
        course: '',
        file: null
      },
      uploadRules: {
        course: [
          { required: true, message: '请选择所属课程', trigger: 'change' }
        ],
        file: [
          { required: true, message: '请上传资源文件', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    getFileIcon(type) {
      const icons = {
        document: 'el-icon-document',
        video: 'el-icon-video-camera',
        image: 'el-icon-picture',
        other: 'el-icon-folder'
      }
      return icons[type] || icons.other
    },
    getTypeTagType(type) {
      const types = {
        document: 'primary',
        video: 'success',
        image: 'warning',
        other: 'info'
      }
      return types[type] || 'info'
    },
    getTypeLabel(type) {
      const labels = {
        document: '文档',
        video: '视频',
        image: '图片',
        other: '其他'
      }
      return labels[type] || type
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    handleSearch() {
      // 实现搜索逻辑
      console.log('搜索条件：', {
        query: this.searchQuery,
        type: this.typeFilter,
        course: this.courseFilter,
        dateRange: this.dateRange
      })
    },
    handleUpload() {
      this.uploadDialogVisible = true
    },
    handleDownload(row) {
      // 实现下载逻辑
      ElMessage.success(`开始下载：${row.name}`)
    },
    handlePreview(row) {
      // 实现预览逻辑
      ElMessage.info(`预览功能开发中：${row.name}`)
    },
    async handleDelete(row) {
      try {
        await ElMessageBox.confirm(
          `确定要删除资源"${row.name}"吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        // 实现删除逻辑
        ElMessage.success('删除成功')
      } catch {
        // 用户取消操作
      }
    },
    handleBatchDownload() {
      // 实现批量下载逻辑
      ElMessage.info('批量下载功能开发中')
    },
    handleBatchDelete() {
      // 实现批量删除逻辑
      ElMessage.info('批量删除功能开发中')
    },
    handleSizeChange(val) {
      this.pageSize = val
      // 重新加载数据
    },
    handleCurrentChange(val) {
      this.currentPage = val
      // 重新加载数据
    },
    beforeUpload(file) {
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        ElMessage.error('文件大小不能超过100MB')
        return false
      }
      return true
    },
    handleUploadSuccess(response, file) {
      this.uploadForm.file = file
      ElMessage.success('上传成功')
    },
    async handleUploadSubmit() {
      try {
        await this.$refs.uploadForm.validate()
        // 实现表单提交逻辑
        ElMessage.success('资源上传成功')
        this.uploadDialogVisible = false
      } catch {
        // 表单验证失败
      }
    }
  }
}
</script>

<style scoped>
.resources-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.resources-content {
  padding: 84px 20px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #2C3E50;
}

.filter-section {
  margin-bottom: 24px;
}

.search-bar {
  margin-bottom: 16px;
}

.search-bar .el-input {
  width: 300px;
}

.filter-options {
  display: flex;
  gap: 16px;
}

.resource-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-name i {
  font-size: 18px;
  color: #606266;
}

.table-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-actions {
  display: flex;
  gap: 12px;
}

.danger {
  color: #F56C6C;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-dialog__body) {
  padding-top: 10px;
}
</style> 