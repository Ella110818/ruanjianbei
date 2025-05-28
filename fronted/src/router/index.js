import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/student',
    redirect: '/student/ai-assistant',
    meta: { requiresAuth: true }
  },
  {
    path: '/student/ai-assistant',
    name: 'aiAssistant',
    component: () => import('../views/Student/AIAssistant.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/profile',
    name: 'studentProfile',
    component: () => import('../views/Student/StudentProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/classroom',
    name: 'studentClassroom',
    component: () => import('../views/Student/StudentMain.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/student/course/:id',
    name: 'studentCourse',
    component: () => import('../views/Student/StudentCourse.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/teacher',
    redirect: '/teacher/course',
    meta: { requiresAuth: true }
  },
  {
    path: '/teacher/course',
    name: 'teacherCourse',
    component: () => import('../views/Teacher/TeacherCourse.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/teacher/manage',
    name: 'teacherManage',
    component: () => import('../views/Teacher/TeacherManage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/teacher/ai',
    name: 'teacherAi',
    component: () => import('../views/Teacher/TeacherAi.vue'),
    meta: {
      requiresAuth: true,
      keepAlive: true  // 添加缓存以保持状态
    },
    props: () => ({
      courses: JSON.parse(localStorage.getItem('teacherCourses') || '[]')
    })
  },
  {
    path: '/teacher/profile',
    name: 'teacherProfile',
    component: () => import('../views/Teacher/TeacherProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/dashboard',
    name: 'adminDashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'adminUsers',
    component: () => import('../views/admin/Users.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/resources',
    name: 'adminResources',
    component: () => import('../views/admin/Resources.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    const studentName = localStorage.getItem('studentName')
    const teacherName = localStorage.getItem('teacherName')
    const adminName = localStorage.getItem('adminName')  // 添加管理员检查

    if (!studentName && !teacherName && !adminName) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
