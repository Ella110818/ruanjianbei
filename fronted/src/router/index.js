import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import TeacherPlan from '../views/Teacher/TeacherPlan.vue'
import TeacherQA from '../views/Teacher/TeacherQA.vue'

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
    component: () => import(/* webpackChunkName: "teacher-course" */ '../views/Teacher/TeacherCourse.vue'),
    meta: {
      requiresAuth: true,
      keepAlive: true
    },
    beforeEnter: (to, from, next) => {
      // 如果是从备课助手返回，恢复之前的导航状态
      if (from.path === '/teacher/ai') {
        const navigationState = localStorage.getItem('navigationState')
        if (navigationState) {
          const state = JSON.parse(navigationState)
          localStorage.removeItem('navigationState')
          return next({ ...state })
        }
      }
      next()
    }
  },
  {
    path: '/teacher/manage',
    name: 'teacherManage',
    component: () => import(/* webpackChunkName: "teacher-manage" */ '../views/Teacher/TeacherManage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/teacher/ai',
    name: 'teacherAi',
    component: () => import(/* webpackChunkName: "teacher-ai" */ '../views/Teacher/TeacherAi.vue'),
    meta: {
      requiresAuth: true,
      keepAlive: true  // 添加缓存以保持状态
    },
    beforeEnter: (to, from, next) => {
      // 如果是从课程页面来的，保存当前的导航状态
      if (from.path === '/teacher/course') {
        const navigationState = {
          path: from.path,
          query: from.query
        }
        localStorage.setItem('navigationState', JSON.stringify(navigationState))
      }
      next()
    }
  },
  {
    path: '/teacher/profile',
    name: 'teacherProfile',
    component: () => import(/* webpackChunkName: "teacher-profile" */ '../views/Teacher/TeacherProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/teacher/exercises',
    name: 'teacherExercises',
    component: () => import(/* webpackChunkName: "teacher-exercises" */ '../views/Teacher/TeacherExercises.vue'),
    meta: {
      requiresAuth: true,
      keepAlive: true
    }
  },
  {
    path: '/teacher/student-answers',
    name: 'TeacherStudentAnswers',
    component: () => import('@/views/Teacher/StudentAnswers.vue'),
    meta: {
      requiresAuth: true,
      role: 'teacher'
    }
  },
  {
    path: '/teacher/analysis',
    name: 'TeacherAnalysis',
    component: () => import('@/views/Teacher/TeacherAnalysis.vue'),
    meta: {
      requiresAuth: true,
      role: 'teacher',
      keepAlive: true
    }
  },
  {
    path: '/teacher/plan',
    name: 'TeacherPlan',
    component: () => import('@/views/Teacher/TeacherPlan.vue'),
    meta: {
      requiresAuth: true,
      role: 'teacher'
    }
  },
  {
    path: '/teacher/qa',
    name: 'TeacherQA',
    component: TeacherQA,
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
  },
  {
    path: '/admin/profile',
    name: 'adminProfile',
    component: () => import('../views/admin/Profile.vue'),
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
    const userRole = localStorage.getItem('userRole');

    if (!userRole) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
      return;
    }

    // 检查路由路径是否匹配用户角色
    const pathRole = to.path.split('/')[1]; // 获取路径中的角色部分
    if (pathRole !== userRole) {
      next({
        path: `/${userRole}`
      });
      return;
    }

    next();
  } else {
    next();
  }
})

export default router
