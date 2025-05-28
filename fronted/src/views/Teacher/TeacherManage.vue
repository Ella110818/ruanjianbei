<template>
  <div class="page-content">
    <TeacherHeader />
    <animated-background />
    <div class="gray-space"></div>
    <div class="content-wrapper">
      <div class="search-section">
        <el-button type="primary" @click="showDialog('add')">新增学生</el-button>
        <el-select
          v-model="selectedDepartments"
          multiple
          placeholder="所有班级"
          class="course-select"
          @change="handleDepartmentChange"
        >
          <el-option
            v-for="item in departmentOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-model="searchText"
          class="search-input"
          placeholder="搜索学生姓名或ID"
          :suffix-icon="Search"
          @input="handleSearchChange"
        />
      </div>
      <div class="table"> 
        <el-table :data="filteredTableData" style="width: 100%" :border="false" :cell-style="{ textAlign: 'center' }" v-loading="loading">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="班级" prop="department" min-width="180" align="center" />
          <el-table-column label="学生" min-width="180" align="center">
            <template #default="scope">
              <div class="user">
                <img class="avatar" :src="scope.row.avatar || '@/assets/avatar.png'" />
                <div class="user-info">
                  <p class="user-name">{{ scope.row.name }}</p>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="学号" prop="teacherId" min-width="180" align="center" />
          <el-table-column label="邮箱" prop="email" min-width="220" align="center" />
          <el-table-column label="手机号" min-width="180" align="center">
            <template #default="scope">
              {{ scope.row.phone || '暂无' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button
                type="primary"
                size="default"
                class="blue-button"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加学生' : '编辑学生'"
        width="30%"
      >
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="formData.name" />
          </el-form-item>
          <el-form-item label="学号" prop="teacherId">
            <el-input v-model="formData.teacherId" :disabled="dialogType === 'edit'" />
          </el-form-item>
          <el-form-item label="班级" prop="department">
            <el-input v-model="formData.department" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="formData.phone" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">提交</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import TeacherHeader from '@/components/TeacherHeader.vue';
import AnimatedBackground from '@/components/AnimatedBackground.vue';

const dialogType = ref('add');
const dialogVisible = ref(false);
const loading = ref(false);
const searchText = ref('');
const selectedDepartments = ref([]);

// 班级选项
const departmentOptions = ref([
  { value: '计算机科学与技术系', label: '计算机科学与技术系' },
  { value: '物理系', label: '物理系' },
  { value: '化学系', label: '化学系' }
]);

const tableData = ref([]);

const filteredTableData = computed(() => {
  let data = tableData.value;
  
  // 按班级筛选
  if (selectedDepartments.value.length > 0) {
    data = data.filter(item => selectedDepartments.value.includes(item.department));
  }
  
  // 按搜索文本筛选
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase();
    data = data.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.teacherId.toLowerCase().includes(searchLower) ||
      item.email.toLowerCase().includes(searchLower)
    );
  }
  
  return data;
});

const handleDepartmentChange = () => {
  // 班级选择变化时的处理逻辑
};

const handleSearchChange = () => {
  // 搜索文本变化时的处理逻辑
};

// Mock API functions
const fetchTeachersAPI = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          items: [
            { id: 1, name: '张三丰', teacherId: 'T001', department: '计算机科学与技术系', email: 'zhangsf@example.com', phone: '13800138001', avatar: 'https://via.placeholder.com/40?text=ZSF' },
            { id: 2, name: '李莫愁', teacherId: 'T002', department: '物理系', email: 'limc@example.com', phone: '13900139002', avatar: 'https://via.placeholder.com/40?text=LMC' },
            { id: 3, name: '黄药师', teacherId: 'T003', department: '化学系', email: 'huangys@example.com', phone: '13700137003', avatar: 'https://via.placeholder.com/40?text=HYS' },
          ],
        },
      })
    }, 500)
  })
}

const fetchTeachers = async () => {
  loading.value = true;
  try {
    const response = await fetchTeachersAPI();
    if (response.code === 200) {
      tableData.value = response.data.items;
    }
  } catch (error) {
    console.error('获取学生列表失败:', error);
    ElMessage.error('获取学生列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const formData = reactive({
  name: '',
  teacherId: '',
  department: '',
  email: '',
  phone: '',
  avatar: '',
});

const rules = reactive({
  name: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  teacherId: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ]
});

const formRef = ref(null);

const showDialog = (type, row = null) => {
  dialogType.value = type;
  dialogVisible.value = true;
  
  if (type === 'edit' && row) {
    Object.assign(formData, row);
  } else {
    Object.assign(formData, {
      name: '',
      teacherId: '',
      department: '',
      email: '',
      phone: '',
      avatar: ''
    });
  }
};

const handleEdit = (row) => {
  showDialog('edit', row);
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    // 这里添加提交逻辑
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功');
    dialogVisible.value = false;
    fetchTeachers();
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

onMounted(() => {
  fetchTeachers();
});
</script>

<style lang="scss" scoped>
.page-content {
  width: 100%;
  max-width: 1480px;
  min-height: calc(100vh - 24px);
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  background-color: transparent;
  z-index: 1;
  isolation: isolate;
  margin-top: 34px;
}

.gray-space {
  height: 12px;
  background-color: transparent;
}

.content-wrapper {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 
    rgba(99, 147, 244, 0.2) 0px 0px 0px 2px,
    rgba(99, 147, 244, 0.15) 0px 4px 16px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
  margin-top: 40px;
}

.search-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  border: 1px solid rgba(99, 147, 244, 0.2);
  box-shadow: 0 2px 8px rgba(99, 147, 244, 0.1);
  
}

.el-button {
  margin-right: 20px;
  border-width: 2px;
  &.el-button--primary {
    border-color: rgba(99, 147, 244, 0.8);
    box-shadow: 0 2px 6px rgba(99, 147, 244, 0.15);
  }
}

.course-select {
  width: 240px;
  margin-right: 20px;
  :deep(.el-input__wrapper) {
    border: 1px solid rgba(99, 147, 244, 0.2);
    box-shadow: 0 2px 6px rgba(99, 147, 244, 0.08);
    &:hover {
      border-color: rgba(99, 147, 244, 0.4);
    }
    &.is-focus {
      border-color: rgba(99, 147, 244, 0.6);
      box-shadow: 0 0 0 2px rgba(99, 147, 244, 0.1);
    }
  }
}

.search-input {
  width: 400px !important;
  margin: 0 20px 0 30px !important;
  :deep(.el-input__wrapper) {
    border: 1px solid rgba(99, 147, 244, 0.2);
    box-shadow: 0 2px 6px rgba(99, 147, 244, 0.08);
    &:hover {
      border-color: rgba(99, 147, 244, 0.4);
    }
    &.is-focus {
      border-color: rgba(99, 147, 244, 0.6);
      box-shadow: 0 0 0 2px rgba(99, 147, 244, 0.1);
    }
  }
}

.table {
  background-color: white;
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(99, 147, 244, 0.15);
  box-shadow: 0 2px 12px rgba(99, 147, 244, 0.08);
}

:deep(.el-table) {
  border: none;
  
  &::before {
    display: none;
  }
  
  .el-table__header-wrapper {
    background-color: #f0f7ff;
    
    th.el-table__cell {
      background-color: #f0f7ff !important;
      color: #333;
  font-weight: 600;
      border-bottom: none;
      height: 50px;
    }
  }

  .el-table__body-wrapper {
    .el-table__row {
      td {
        border-bottom: 1px solid rgba(99, 147, 244, 0.1);
        height: 60px;
      }
      
      &:hover {
        td {
          background-color: rgba(99, 147, 244, 0.05);
        }
      }
    }
  }
}

// 覆盖 element-plus 的默认表头样式
:deep(.el-table__header) {
  th.el-table__cell {
    background-color: #f0f7ff !important;
  }
}

.user {
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  border: 2px solid #ebeef5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  text-align: left;
}

.user-name {
  font-weight: 500;
  color: #333;
  margin: 0;
}

.blue-button {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s, border-color 0.3s;
  border: none;
  
  &:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
  }
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
  
  &:hover {
    background-color: #66b1ff;
    border-color: #66b1ff;
  }
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  
  .el-dialog__header {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #e0e6f0;
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .el-dialog__footer {
    border-top: 1px solid #e0e6f0;
    padding: 16px 24px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
