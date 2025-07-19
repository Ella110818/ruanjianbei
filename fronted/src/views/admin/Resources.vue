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
            <el-tag :type="getTypeTagType(row.type)">{{ row.typeDisplay }}</el-tag>
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
    <el-dialog 
      title="上传资源" 
      v-model="uploadDialogVisible" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="uploadForm" 
        :rules="uploadRules" 
        ref="uploadForm" 
        label-width="100px"
      >
        <el-form-item label="资源名称" prop="name">
          <el-input v-model="uploadForm.name" placeholder="请输入资源名称"></el-input>
        </el-form-item>
        
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

        <el-form-item label="资源描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入资源描述（选填）"
          ></el-input>
        </el-form-item>

        <el-form-item label="资源文件" prop="file">
          <el-upload
            class="upload-demo"
            drag
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            :on-change="(file) => beforeUpload(file.raw)"
            :on-exceed="() => ElMessage.warning('只能上传一个文件')"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
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
import { getCourseList, deleteCourseware, API_CONFIG } from '@/api'

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
      resourceList: [],
      courseOptions: [],
      uploadForm: {
        course: '',
        file: null,
        name: '',  // 添加文件名字段
        description: ''  // 添加描述字段
      },
      uploadRules: {
        course: [
          { required: true, message: '请选择所属课程', trigger: 'change' }
        ],
        file: [
          { required: true, message: '请上传资源文件', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入资源名称', trigger: 'blur' }
        ]
      }
    }
  },
  async created() {
    await this.fetchCourseList()
    await this.fetchResourceList()
  },
  methods: {
    async fetchResourceList() {
      try {
        this.loading = true
        const token = localStorage.getItem('token')
        if (!token) {
          ElMessage.error('未登录或登录已过期，请重新登录')
          return
        }

        const params = {
          page: this.currentPage,
          page_size: this.pageSize,
          search: this.searchQuery,
          type: this.typeFilter,
          course: this.courseFilter
        }
        if (this.dateRange && this.dateRange.length === 2) {
          params.start_date = this.dateRange[0]
          params.end_date = this.dateRange[1]
        }
        
        const queryString = new URLSearchParams(params).toString()
        const response = await fetch(`${API_CONFIG.BASE_URL}/coursewares/?${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            return
          }
          throw new Error(`获取资源列表失败: ${response.status}`)
        }

        const data = await response.json()
        if (data.success && data.status_code === 200) {
          // 处理返回的资源列表数据
          this.resourceList = (data.data.results || []).map(item => ({
            id: item.id,
            name: item.title,  // 修改这里：使用 title 而不是 file_name
            type: item.type,  // 修改这里：直接使用 type
            typeDisplay: item.type_display,  // 添加这里：显示类型的中文名
            size: item.size || 0,  // 添加默认值
            uploadTime: item.created_at,  // 修改这里：使用 created_at
            course: item.course_title || '未知课程',  // 修改这里：使用 course_title
            uploader: item.creator_name || '未知用户'  // 修改这里：使用 creator_name
          }))
          this.total = data.data.count || 0
        } else {
          ElMessage.error(data.message || '获取资源列表失败')
        }
      } catch (error) {
        console.error('获取资源列表失败:', error)
        ElMessage.error(error.message || '获取资源列表失败')
      } finally {
        this.loading = false
      }
    },
    async fetchCourseList() {
      try {
        this.loading = true
        const response = await getCourseList()
        console.log('课程列表响应:', response)  // 添加日志
        if (response.code === 0 && response.data) {  // 修改这里：检查 code 而不是 success
          let courseList = []
          // 处理分页格式
          if (response.data.results) {
            courseList = response.data.results
          } 
          // 处理直接数组格式
          else if (Array.isArray(response.data)) {
            courseList = response.data
          }
          
          this.courseOptions = courseList.map(course => ({
            label: course.title,
            value: course.id
          }))
          console.log('处理后的课程选项:', this.courseOptions)  // 添加日志
        } else {
          ElMessage.error(response.msg || '获取课程列表失败')
        }
      } catch (error) {
        console.error('获取课程列表失败:', error)
        ElMessage.error('获取课程列表失败')
      } finally {
        this.loading = false
      }
    },
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
    formatFileSize(size) {
      if (!size || size === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(size) / Math.log(k))
      return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    handleSearch() {
      this.currentPage = 1
      this.fetchResourceList()
    },
    handleUpload() {
      this.uploadDialogVisible = true
    },
    async handleDownload(row) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          ElMessage.error('未登录或登录已过期，请重新登录')
          return
        }

        // 构建正确的下载URL，添加必要的查询参数
        const params = new URLSearchParams({
          search: '1',
          ordering: '1',
          page: '1'
        })
        const downloadUrl = `${API_CONFIG.BASE_URL}/coursewares/download/${row.id}/?${params.toString()}`
        console.log('下载URL:', downloadUrl)
        
        // 创建下载请求
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            return
          }
          throw new Error(`下载失败: ${response.status}`)
        }
        
        // 获取文件blob
        const blob = await response.blob()
        
        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = row.name // 使用资源名称作为下载文件名
        
        // 触发下载
        document.body.appendChild(link)
        link.click()
        
        // 清理
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        ElMessage.success(`文件"${row.name}"下载成功`)
      } catch (error) {
        console.error('下载失败:', error)
        ElMessage.error(error.message || '下载失败，请稍后重试')
      }
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
        
        // 调用删除接口，直接传入 id
        const response = await deleteCourseware(row.id)
        if (response.code === 0) {  // 修改这里：检查 code === 0
          ElMessage.success('删除成功')
          // 重新加载资源列表
          await this.fetchResourceList()
        } else {
          ElMessage.error(response.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除资源失败:', error)
          ElMessage.error('删除失败，请稍后重试')
        }
      }
    },
    async handleBatchDownload() {
      try {
        const selection = this.$refs.table.getSelectionRows()
        if (!selection || selection.length === 0) {
          ElMessage.warning('请选择要下载的资源')
          return
        }

        // 获取token
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('未登录或登录已过期')
        }

        // 创建所有下载任务
        const downloadTasks = selection.map(async (item) => {
          try {
            const downloadUrl = `${API_CONFIG.BASE_URL}/coursewares/download/${item.id}/`
            const response = await fetch(downloadUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
              }
            })

            if (!response.ok) {
              throw new Error(`下载失败: ${response.status}`)
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = item.name
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            return item.name
          } catch (error) {
            console.error(`下载文件 "${item.name}" 失败:`, error)
            throw error
          }
        })

        // 等待所有下载完成
        await Promise.all(downloadTasks)
        ElMessage.success('批量下载完成')
      } catch (error) {
        console.error('批量下载失败:', error)
        ElMessage.error('批量下载失败，请稍后重试')
      }
    },
    async handleBatchDelete() {
      try {
        const selection = this.$refs.table.getSelectionRows()
        if (!selection || selection.length === 0) {
          ElMessage.warning('请选择要删除的资源')
          return
        }

        await ElMessageBox.confirm(
          `确定要删除选中的 ${selection.length} 个资源吗？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // 批量删除，每个请求只传入 id
        const promises = selection.map(item => deleteCourseware(item.id))
        await Promise.all(promises)
        
        ElMessage.success('批量删除成功')
        // 重新加载资源列表
        await this.fetchResourceList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败:', error)
          ElMessage.error('批量删除失败，请稍后重试')
        }
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchResourceList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchResourceList()
    },
    beforeUpload(file) {
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (file.size > maxSize) {
        ElMessage.error('文件大小不能超过100MB')
        return false
      }
      
      // 只保存文件对象
      this.uploadForm.file = file
      
      // 打印文件信息
      console.log('文件信息:', {
        name: file.name,
        type: file.type,
        size: file.size
      })
      
      return true
    },
    async handleUploadSubmit() {
      if (!this.$refs.uploadForm) {
        console.log('表单引用不存在')
        return
      }
      
      try {
        console.log('开始验证表单')
        await this.$refs.uploadForm.validate()
        
        if (!this.uploadForm.file) {
          console.log('未选择文件')
          ElMessage.warning('请选择要上传的文件')
          return
        }

        // 检查认证令牌
        const token = localStorage.getItem('token')
        if (!token) {
          ElMessage.error('未登录或登录已过期，请重新登录')
          return
        }

        console.log('准备上传文件:', {
          fileName: this.uploadForm.file.name,
          fileSize: this.uploadForm.file.size,
          fileType: this.uploadForm.file.type,
          course: this.uploadForm.course
        })

        // 第一步：创建课件记录
        const coursewareData = {
          title: this.uploadForm.name,
          content: this.uploadForm.description || '',
          type: 'document',
          course: this.uploadForm.course
        }

        console.log('创建课件记录:', coursewareData)
        const createResponse = await fetch(`${API_CONFIG.BASE_URL}/coursewares/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(coursewareData)
        })

        if (!createResponse.ok) {
          const errorData = await createResponse.json()
          console.error('创建课件失败响应:', errorData)
          if (createResponse.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            return
          }
          throw new Error(errorData.message || `创建课件记录失败: ${createResponse.status}`)
        }

        const createData = await createResponse.json()
        console.log('创建课件响应:', createData)

        if (!createData.success || createData.status_code !== 201) {
          throw new Error(createData.message || '创建课件记录失败')
        }

        const coursewareId = createData.data.id
        console.log('获取到的课件ID:', coursewareId)

        // 第二步：上传文件
        const formData = new FormData()
        formData.append('courseware_id', coursewareId.toString())  // 确保 ID 是字符串
        formData.append('file', this.uploadForm.file)

        // 打印 FormData 内容（仅用于调试）
        for (let [key, value] of formData.entries()) {
          console.log('FormData 字段:', key, value)
        }

        console.log('开始上传文件，课件ID:', coursewareId)
        const uploadResponse = await fetch(`${API_CONFIG.BASE_URL}/coursewares/upload/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
            // 注意：这里不要设置 Content-Type，让浏览器自动设置正确的 multipart/form-data
          },
          body: formData
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          console.error('上传文件失败响应:', errorData)
          if (uploadResponse.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            return
          }
          throw new Error(errorData.message || `文件上传失败: ${uploadResponse.status}`)
        }

        const uploadData = await uploadResponse.json()
        console.log('文件上传响应:', uploadData)
        
        if (uploadData.success && uploadData.status_code === 200) {
          ElMessage.success('资源上传成功')
          this.uploadDialogVisible = false
          // 重置表单
          this.$refs.uploadForm.resetFields()
          this.uploadForm.file = null
          // 刷新资源列表
          await this.fetchResourceList()
        } else {
          throw new Error(uploadData.message || '文件上传失败')
        }
      } catch (error) {
        console.error('上传失败:', error)
        ElMessage.error(error.message || '上传失败，请稍后重试')
      }
    }
  }
}
</script>

<style scoped>
.resources-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F0F2F5 0%, #FFFFFF 100%);
}

.resources-content {
  padding: 84px 24px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  background: #FFFFFF;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1A1F36;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header h2::before {
  content: '';
  width: 4px;
  height: 24px;
  background: #409EFF;
  border-radius: 2px;
  display: inline-block;
}

.filter-section {
  background: #FFFFFF;
  padding: 20px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar .el-input {
  width: 360px;
}

.filter-options {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-options .el-select {
  width: 180px;
}

.resource-name {
  display: flex;
  align-items: center;
  gap: 10px;
}

.resource-name i {
  font-size: 20px;
  color: #409EFF;
}

.resource-name span {
  color: #1A1F36;
  font-weight: 500;
}

.table-footer {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.batch-actions {
  display: flex;
  gap: 16px;
}

.batch-actions .el-button {
  padding: 8px 20px;
  border-radius: 8px;
}

.danger {
  color: #F56C6C;
}

.danger:hover {
  color: #ff4d4f;
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-table th) {
  background-color: #F5F7FA !important;
  color: #1A1F36;
  font-weight: 600;
  padding: 12px 0;
}

:deep(.el-table td) {
  padding: 16px 0;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #F5F7FA;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  border-radius: 8px;
  border: 2px dashed #E4E7ED;
  background: #F5F7FA;
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409EFF;
  background: #F0F7FF;
}

:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #E4E7ED;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #E4E7ED;
}

:deep(.el-button--primary) {
  background: #409EFF;
  border-color: #409EFF;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-button--primary:hover) {
  background: #66B1FF;
  border-color: #66B1FF;
}

:deep(.el-tag) {
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: 500;
}
</style> 