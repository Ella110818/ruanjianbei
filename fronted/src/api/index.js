import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const API_CONFIG = {
    BASE_URL: 'https://455d114ce65d.ngrok-free.app/api',
    TIMEOUT: 10000
}

// 创建axios实例
const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }
})

// 是否正在刷新token
let isRefreshing = false
// 重试队列
let requests = []

// 刷新token
const refreshToken = async () => {
    try {
        const refresh_token = localStorage.getItem('refresh_token')
        if (!refresh_token) {
            throw new Error('No refresh token')
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ refresh: refresh_token })
        })

        const data = await response.json()
        if (data.success && data.status_code === 200 && data.data) {
            localStorage.setItem('token', data.data.access)
            return data.data.access
        } else {
            throw new Error('Token refresh failed')
        }
    } catch (error) {
        console.error('Token refresh failed:', error)
        // 不要立即清除 token，先检查是否真的过期
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('refresh_token')
            router.push('/login')
        }
        throw error
    }
}

// 请求拦截器
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
instance.interceptors.response.use(
    response => response.data,
    async error => {
        const originalRequest = error.config

        // 如果是401错误且不是刷新token的请求
        if (error.response?.status === 401 && !originalRequest._retry) {
            // 检查 token 是否真的过期
            const tokenExpires = localStorage.getItem('tokenExpires')
            const now = new Date().getTime()

            if (tokenExpires && now < parseInt(tokenExpires)) {
                // token 还没过期，可能是其他原因导致的401
                return Promise.reject(error)
            }

            if (isRefreshing) {
                return new Promise(resolve => {
                    requests.push(token => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`
                        resolve(instance(originalRequest))
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const newToken = await refreshToken()
                // 更新过期时间
                const expiresIn = 24 * 60 * 60 * 1000 // 24小时
                localStorage.setItem('tokenExpires', new Date().getTime() + expiresIn)

                requests.forEach(cb => cb(newToken))
                requests = []
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`
                return instance(originalRequest)
            } catch (refreshError) {
                ElMessage.error('登录已过期，请重新登录')
                router.push('/login')
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        if (error.response?.status === 403) {
            ElMessage.error('没有权限访问该资源')
        }

        return Promise.reject(error)
    }
)

// API函数
export const login = async (credentials) => {
    try {
        // 只发送用户名和密码
        const loginData = {
            username: credentials.username,
            password: credentials.password
        }

        const response = await instance.post('/login/', loginData)

        // 检查响应格式
        if (response.success && response.status_code === 200 && response.data) {
            // 保存 tokens
            localStorage.setItem('token', response.data.access)
            localStorage.setItem('refresh_token', response.data.refresh)

            // 保存用户信息
            const user = response.data.user
            localStorage.setItem('userRole', user.role)
            localStorage.setItem('userId', user.id)
            localStorage.setItem('username', user.username)

            // 设置 token 过期时间
            const expiresIn = 24 * 60 * 60 * 1000 // 24小时
            localStorage.setItem('tokenExpires', new Date().getTime() + expiresIn)

            return {
                success: true,
                status_code: response.status_code,
                access: response.data.access,
                refresh: response.data.refresh,
                user_type: user.role,
                message: '登录成功'
            }
        }
        return response
    } catch (error) {
        console.error('Login failed:', error)
        throw error
    }
}

export const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('userRole')
    router.push('/login')
}

// 导出API实例
export const apiClient = instance

// 其他API函数
export const getKnowledgePoints = () => instance.get('/knowledge-points/')
export const getCourseList = async () => {
    try {
        const response = await instance.get('/courses/')
        return response
    } catch (error) {
        console.error('获取课程列表失败:', error)
        throw error
    }
}
export const getExercises = (params) => instance.get('/exercises/', { params })
export const createExercise = (data) => instance.post('/exercises/', data)
export const generateQuestions = (data) => instance.post('/exercises/generate/', data)

// 获取当前用户信息
export const getCurrentUser = async () => {
    try {
        const response = await instance.get('/users/me/')
        return response
    } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
    }
}

