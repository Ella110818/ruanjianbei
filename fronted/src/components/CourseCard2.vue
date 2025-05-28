<template>
  <el-card class="course-card" shadow="hover" @click="viewCourseDetail">
    <div class="course-header">
      <img 
        :src="courseImage" 
        alt="课程图片" 
        class="course-image"
        loading="lazy"
        @load="handleImageLoad"
        @error="handleImageError" 
      />
      <div class="image-placeholder" v-if="!imageLoaded"></div>
    </div>
    <div class="course-info">
      <h3 class="course-title">{{ course.title }}</h3>
      <p class="course-location">{{ displayLocation }}</p>
    </div>
  </el-card>
</template>

<script>
import course1 from '@/assets/course1.jpg'
import { useRouter } from 'vue-router'

export default {
  name: 'CourseCard2',
  props: {
    course: {
      type: Object,
      required: true,
      default: () => ({}),
      validator: function(value) {
        return Object.prototype.hasOwnProperty.call(value, 'course_id') && 
               Object.prototype.hasOwnProperty.call(value, 'title') &&
               Object.prototype.hasOwnProperty.call(value, 'location');
      }
    },
  },
  setup(props) {
    const router = useRouter()

    const viewCourseDetail = () => {
      // 存储当前课程信息到localStorage
      localStorage.setItem('currentCourseName', props.course.title)
      localStorage.setItem('currentCourseId', props.course.course_id)
      localStorage.setItem('currentCourseLocation', props.course.location)
      
      // 跳转到课程详情页
      router.push(`/student/course/${props.course.course_id}`)
    }

    return {
      viewCourseDetail
    }
  },
  data() {
    return {
      imageLoaded: false
    }
  },
  computed: {
    displayLocation() {
      return this.course.location || '线上课程';
    },
    courseImage() {
      return course1;
    }
  },
  mounted() {
    const img = new Image();
    img.src = this.courseImage;
    img.onload = this.handleImageLoad;
  },
  methods: {
    handleImageLoad() {
      this.imageLoaded = true;
    },
    handleImageError(e) {
      console.error('课程图片加载失败');
      e.target.src = course1;
    }
  }
};
</script>

<style scoped>
.course-card {
  width: 360px;
  border-radius: 12px;
  background: #fff;
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.course-header {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
  background: #f5f7fa;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 400% 100%;
  animation: loading 1.4s ease infinite;
}

@keyframes loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  display: block;
  will-change: transform;
  filter: brightness(0.9);
}

.course-info {
  padding: 16px 20px;
  background: #fff;
}

.course-title {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin: 0;
  margin-bottom: 8px;
  line-height: 1.4;
}

.course-location {
  font-size: 14px;
  color: #666;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-location::after {
  content:'课程详情';
  color: #409EFF;
  background: #E6F4FF;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.course-card:hover .course-location::after {
  background: #409EFF;
  color: #fff;
}

.course-actions {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__body) {
  padding: 0;
}
</style> 