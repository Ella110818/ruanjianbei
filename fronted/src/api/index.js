// 环境配置
const ENV = {
    development: {
        API_URL: 'http://localhost:8000',  // 本地开发服务器地址
        API_VERSION: 'api'
    },
    production: {
        API_URL: 'https://b8d6dd43f441.ngrok-free.app',  // 更新为新的ngrok地址
        API_VERSION: 'api'
    }
};

// 获取基础URL
function getBaseUrl() {
    const env = getEnvironment();
    return `${ENV[env].API_URL}/${ENV[env].API_VERSION}`;
}

// 导出API配置
export const API_CONFIG = {
    BASE_URL: getBaseUrl(),
    TIMEOUT: 10000,  // 请求超时时间：10秒
    withCredentials: false,  // 不需要跨域凭证
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    fetchOptions: {
        cache: 'no-store',  // 禁用缓存
        redirect: 'follow',  // 自动跟随重定向
        referrerPolicy: 'no-referrer'  // 不发送referrer
    }
};

// 获取当前环境
function getEnvironment() {
    return process.env.NODE_ENV || 'development';
}

// 检查并设置Mock环境
export function checkAndSetMockEnvironment() {
    const env = getEnvironment();
    // 如果是开发环境且没有设置过mock标志，默认设置为true
    if (env === 'development' && localStorage.getItem('USE_MOCK') === null) {
        localStorage.setItem('USE_MOCK', 'true');
        return true;
    }
    return getMockFlag();
}

// 切换Mock环境
export function toggleMockEnvironment() {
    const currentState = getMockFlag();
    localStorage.setItem('USE_MOCK', (!currentState).toString());
    return !currentState;
}

// 基础URL配置
const BASE_URL = getBaseUrl();

// Token管理
const TokenManager = {
    setTokens(accessToken, refreshToken) {
        if (accessToken) localStorage.setItem('token', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    },

    getAccessToken() {
        return localStorage.getItem('token');
    },

    getRefreshToken() {
        return localStorage.getItem('refreshToken');
    },

    clearTokens() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    },

    isValidToken(token) {
        return token && typeof token === 'string' && token.length > 0;
    }
};

// 导入mock数据
import { mockCourses, mockCourseDetail, mockApiResponse } from '@/mock/courseData';

// 只用localStorage控制环境
function getMockFlag() {
    return localStorage.getItem('USE_MOCK') === 'true';
}

// HTTP错误处理
const handleHttpError = (response, errorData) => {
    switch (response.status) {
        case 401:
            return {
                code: 1,
                msg: errorData.message || '用户名或密码错误',
                data: null
            };
        case 403:
            return {
                code: 1,
                msg: '没有访问权限',
                data: null
            };
        case 404:
            return {
                code: 1,
                msg: '请求的资源不存在',
                data: null
            };
        case 500:
            return {
                code: 1,
                msg: '服务器内部错误',
                data: null
            };
        default:
            return {
                code: 1,
                msg: errorData.message || `请求失败，状态码: ${response.status}`,
                data: null
            };
    }
};

// 辅助函数：添加bypass参数到URL
function addBypassParam(url) {
    return url + (url.includes('?') ? '&' : '?') + 'bypass-tunnel-reminder=true';
}

// 登录接口
export async function login(username, password, role) {
    if (getMockFlag()) {
        // 本地测试模式
        if (username === '11' && password === '22') {
            return Promise.resolve({
                code: 0,
                msg: '登录成功',
                data: {
                    name: '测试用户',
                    role: role || 'teacher',
                    id: 1
                }
            });
        } else {
            return Promise.resolve({
                code: 1,
                msg: '用户名或密码错误',
                data: null
            });
        }
    } else {
        // 真实API请求
        try {
            const loginUrl = `${API_CONFIG.BASE_URL}/login/`;
            const loginData = {
                username,
                password,
                role
            };

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
                },
                body: JSON.stringify(loginData)
            });

            let responseData;
            try {
                responseData = await response.json();
            } catch (e) {
                return {
                    code: 1,
                    msg: '服务器响应格式错误',
                    data: null
                };
            }

            if (!response.ok) {
                return handleHttpError(response, responseData);
            }

            // 检查响应是否成功
            if (responseData.success && responseData.status_code === 200 && responseData.data) {
                const { access, refresh, user } = responseData.data;

                // 验证并保存token
                if (TokenManager.isValidToken(access) &&
                    TokenManager.isValidToken(refresh)) {
                    TokenManager.setTokens(access, refresh);

                    // 保存用户信息
                    const userInfo = {
                        ...user,
                        role
                    };
                    localStorage.setItem('user', JSON.stringify(userInfo));

                    // 获取用户权限
                    try {
                        const permissionsResponse = await fetch(`${API_CONFIG.BASE_URL}/roles/${user.role_id || 1}/permissions/`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${access}`,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            }
                        });

                        if (permissionsResponse.ok) {
                            const permissionsData = await permissionsResponse.json();
                            // 保存权限信息
                            localStorage.setItem('userPermissions', JSON.stringify(permissionsData));
                            console.log('用户权限已保存:', permissionsData);
                        }
                    } catch (error) {
                        console.error('获取权限失败:', error);
                    }

                    return {
                        code: 0,
                        msg: '登录成功',
                        data: {
                            token: access,
                            refreshToken: refresh,
                            user: userInfo
                        }
                    };
                } else {
                    return {
                        code: 1,
                        msg: 'Token格式无效',
                        data: null
                    };
                }
            } else {
                return {
                    code: 1,
                    msg: responseData.message || '登录失败',
                    data: null
                };
            }
        } catch (error) {
            return {
                code: 1,
                msg: error.message || '网络错误，请稍后重试',
                data: null
            };
        }
    }
}

// Mock数据
const mockCourseList = {
    code: 0,
    msg: '获取课程列表成功',
    data: [
        {
            id: 1,
            title: 'Python编程基础',
            description: 'Python入门课程',
            subject: 'Python编程',
            grade_level: '大学一年级',
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            title: 'Java编程基础',
            description: 'Java入门课程',
            subject: 'Java编程',
            grade_level: '大学一年级',
            created_at: new Date().toISOString()
        }
    ]
};

// 获取用户信息
export function getUserInfo() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        return null;
    }
    return JSON.parse(userStr);
}

// 刷新Token
export async function refreshToken() {
    try {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
            throw new Error('刷新Token不存在');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken })
        });

        const data = await response.json();
        if (response.ok && data.access) {
            TokenManager.setAccessToken(data.access);
            return data.access;
        }
        throw new Error('刷新Token失败');
    } catch (error) {
        throw new Error('刷新Token失败');
    }
}

// 通用请求处理函数
async function handleRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...API_CONFIG.headers,
            ...options.headers
        }
    });

    if (response.status === 401) {
        // Token过期，尝试刷新
        const newToken = await refreshToken();
        if (newToken) {
            // 使用新Token重试请求
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`
            };
            return handleRequest(url, options);
        }
        throw new Error('认证失败');
    }

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        return handleHttpError(response, data);
    }

    return data;
}

// 获取课程列表
export async function getCourseList(params = {}) {
    if (getMockFlag()) {
        return mockApiResponse(mockCourseList);
    }

    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.BASE_URL}/courses/${queryString ? `?${queryString}` : ''}`;
        const data = await handleRequest(url);

        return {
            code: 0,
            msg: '获取课程列表成功',
            data: data.data || []
        };
    } catch (error) {
        return {
            code: 1,
            msg: error.message || '获取课程列表失败',
            data: null
        };
    }
}

// 获取单个课程详情
export async function getCourseDetail(courseId) {
    if (getMockFlag()) {
        // 返回mock数据
        const courseBasicInfo = mockCourses.find(course => course.id === courseId);
        if (!courseBasicInfo) {
            return {
                code: 1,
                msg: '课程不存在',
                data: null
            };
        }
        return mockApiResponse({
            ...courseBasicInfo,
            ...mockCourseDetail
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        // 构建URL并添加bypass参数
        const courseDetailUrl = addBypassParam(`${API_CONFIG.BASE_URL}/courses/${courseId}/`);

        const response = await fetch(courseDetailUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const responseData = await response.json();
        console.log('课程详情响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        if (responseData.success && responseData.status_code === 200) {
            return {
                code: 0,
                msg: '获取课程详情成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '获取课程详情失败',
                data: null
            };
        }
    } catch (error) {
        console.error('获取课程详情失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 创建新课程
export async function createCourse(courseData) {
    if (getMockFlag()) {
        // 返回mock数据
        const newCourse = {
            ...courseData,
            id: mockCourses.length + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        mockCourses.push(newCourse);
        return Promise.resolve({
            code: 0,
            msg: '创建课程成功',
            data: newCourse
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${BASE_URL}/courses/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(courseData)
        });

        const responseData = await response.json();
        console.log('创建课程响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        if (responseData.success && responseData.status_code === 200) {
            return {
                code: 0,
                msg: '创建课程成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '创建课程失败',
                data: null
            };
        }
    } catch (error) {
        console.error('创建课程失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 更新课程信息
export async function updateCourse(courseId, courseData) {
    if (getMockFlag()) {
        // 返回mock数据
        const index = mockCourses.findIndex(course => course.id === courseId);
        if (index !== -1) {
            mockCourses[index] = {
                ...mockCourses[index],
                ...courseData,
                updated_at: new Date().toISOString()
            };
            return Promise.resolve({
                code: 0,
                msg: '更新课程成功',
                data: mockCourses[index]
            });
        }
        return Promise.resolve({
            code: 1,
            msg: '课程不存在',
            data: null
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${BASE_URL}/courses/${courseId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(courseData)
        });

        const responseData = await response.json();
        console.log('更新课程响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        if (responseData.success && responseData.status_code === 200) {
            return {
                code: 0,
                msg: '更新课程成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '更新课程失败',
                data: null
            };
        }
    } catch (error) {
        console.error('更新课程失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 删除课程
export async function deleteCourse(courseId) {
    if (getMockFlag()) {
        // 返回mock数据
        const index = mockCourses.findIndex(course => course.id === courseId);
        if (index !== -1) {
            mockCourses.splice(index, 1);
            return Promise.resolve({
                code: 0,
                msg: '删除课程成功',
                data: null
            });
        }
        return Promise.resolve({
            code: 1,
            msg: '课程不存在',
            data: null
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${BASE_URL}/courses/${courseId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.status === 204) {
            return {
                code: 0,
                msg: '删除课程成功',
                data: null
            };
        }

        const responseData = await response.json();
        console.log('删除课程响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return {
            code: 1,
            msg: responseData.message || '删除课程失败',
            data: null
        };
    } catch (error) {
        console.error('删除课程失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 检查用户是否有特定权限
function hasPermission(permissionName) {
    try {
        const permissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');
        return permissions.permissions?.some(p => p.name === permissionName) || false;
    } catch (error) {
        console.error('检查权限失败:', error);
        return false;
    }
}

// 课程内容生成
export async function generateCourseContent() {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '课程内容生成成功',
            data: {
                id: 1,
                title: 'Python编程基础',
                description: 'Python入门课程',
                subject: 'Python编程',
                grade_level: '大学一年级',
                created_at: new Date().toISOString()
            }
        });
    }

    // 检查是否有生成课程的权限
    if (!hasPermission('generate_course')) {
        return {
            code: 1,
            msg: '没有生成课程的权限',
            data: null
        };
    }

    const token = TokenManager.getAccessToken();
    if (!token) {
        return {
            code: 1,
            msg: '请先登录',
            data: null
        };
    }

    try {
        // 使用固定的简单参数
        const requestBody = {
            course_name: 'Python编程基础',
            course_description: 'Python入门课程',
            subject: 'Python编程',
            grade_level: '大学一年级',
            chapter_count: 5
        };

        const response = await fetch(`${API_CONFIG.BASE_URL}/course-generate/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const responseData = await response.json();
        console.log('课程内容生成响应:', responseData);

        if (!response.ok) {
            if (response.status === 403) {
                return {
                    code: 1,
                    msg: responseData.message || '没有权限访问此功能',
                    data: null
                };
            }
            return handleHttpError(response, responseData);
        }

        if (responseData.success && responseData.status_code === 200) {
            return {
                code: 0,
                msg: '课程内容生成成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '生成课程内容失败',
                data: null
            };
        }
    } catch (error) {
        console.error('生成课程内容失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 导出问题
export async function exportQuestions(sessionKey, format = 'json', filename = 'questions') {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '导出成功',
            data: {
                url: 'mock_export_url.json'
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        const response = await fetch(`${API_CONFIG.BASE_URL}/question-generation/export/?session_key=${sessionKey}&format=${format}&filename=${filename}`, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`导出失败: ${response.status}`);
        }

        // 检查Content-Type
        const contentType = response.headers.get('Content-Type');

        if (contentType && contentType.includes('application/json')) {
            // 如果是JSON响应,返回数据
            const data = await response.json();
            return {
                code: 0,
                msg: '导出成功',
                data
            };
        } else {
            // 如果是文件下载,创建下载链接
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${filename}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

            return {
                code: 0,
                msg: '文件下载成功',
                data: null
            };
        }
    } catch (error) {
        console.error('导出问题失败:', error);
        return {
            code: 1,
            msg: error.message || '导出失败',
            data: null
        };
    }
}

// 获取练习题列表
export async function getExercises(params) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取练习题成功',
            data: {
                count: 10,
                results: Array(10).fill().map((_, index) => ({
                    id: index + 1,
                    title: `模拟练习题 ${index + 1}`,
                    content: '这是一道模拟练习题',
                    type: 'single_choice',
                    difficulty: 1,
                    knowledge_point: '基础知识',
                    options: ['A', 'B', 'C', 'D'],
                    answer: 'A'
                }))
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('请先登录');
        }

        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.ordering) queryParams.append('ordering', params.ordering);
        if (params.knowledge_point) queryParams.append('knowledge_point', params.knowledge_point);
        if (params.type) queryParams.append('type', params.type);
        if (params.difficulty) queryParams.append('difficulty', params.difficulty);
        if (params.page) queryParams.append('page', params.page);

        const exercisesUrl = `${API_CONFIG.BASE_URL}/exercises/?${queryParams.toString()}`;
        console.log('获取练习题请求URL:', exercisesUrl);

        const response = await fetch(exercisesUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const responseData = await response.json();
        console.log('练习题响应数据:', responseData);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('没有权限，请确保已登录');
            }
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '获取练习题成功',
            data: responseData
        };
    } catch (error) {
        console.error('获取练习题失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 获取知识点列表
export async function getKnowledgePoints(params) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取知识点成功',
            data: {
                count: 10,
                results: Array(10).fill().map((_, index) => ({
                    id: index + 1,
                    title: `知识点 ${index + 1}`,
                    description: '这是一个知识点的描述',
                    subject: '计算机科学',
                    grade_level: '大学一年级',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }))
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('请先登录');
        }

        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.ordering) queryParams.append('ordering', params.ordering);
        if (params.page) queryParams.append('page', params.page);

        const knowledgePointsUrl = `${API_CONFIG.BASE_URL}/knowledge-points/?${queryParams.toString()}`;
        console.log('获取知识点请求URL:', knowledgePointsUrl);

        const response = await fetch(knowledgePointsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const responseData = await response.json();
        console.log('知识点响应数据:', responseData);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('没有权限，请确保已登录');
            }
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '获取知识点成功',
            data: responseData
        };
    } catch (error) {
        console.error('获取知识点失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 获取角色权限列表
export async function getRolePermissions(roleId) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取角色权限成功',
            data: {
                permissions: [
                    {
                        id: 1,
                        name: 'create_course',
                        description: '创建课程'
                    },
                    {
                        id: 2,
                        name: 'edit_course',
                        description: '编辑课程'
                    },
                    {
                        id: 3,
                        name: 'delete_course',
                        description: '删除课程'
                    },
                    {
                        id: 4,
                        name: 'view_students',
                        description: '查看学生列表'
                    }
                ]
            }
        });
    }

    const token = TokenManager.getAccessToken();
    if (!token) {
        return {
            code: 1,
            msg: '请先登录',
            data: null
        };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/roles/${roleId}/permissions/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    const responseData = await response.json();

    if (!response.ok) {
        if (response.status === 403) {
            return {
                code: 1,
                msg: '没有权限访问',
                data: null
            };
        }
        return handleHttpError(response, responseData);
    }

    return {
        code: 0,
        msg: '获取角色权限成功',
        data: responseData
    };
}

// 获取课件列表
export async function getCoursewareList(params = {}) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取课件列表成功',
            data: {
                count: 10,
                results: Array(10).fill().map((_, index) => ({
                    id: index + 1,
                    title: `示例课件 ${index + 1}`,
                    description: '这是一个示例课件',
                    file_url: 'https://example.com/file.pdf',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }))
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('请先登录');
        }

        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.ordering) queryParams.append('ordering', params.ordering);
        if (params.page) queryParams.append('page', params.page);

        const coursewareUrl = `${API_CONFIG.BASE_URL}/courseware/by_course/?${queryParams.toString()}`;
        console.log('获取课件列表请求URL:', coursewareUrl);

        const response = await fetch(coursewareUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const responseData = await response.json();
        console.log('课件列表响应数据:', responseData);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('没有权限，请确保已登录');
            }
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '获取课件列表成功',
            data: responseData
        };
    } catch (error) {
        console.error('获取课件列表失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 获取学生答案列表
export async function getStudentAnswers(params = {}) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取学生答案成功',
            data: {
                count: 10,
                results: Array(10).fill().map((_, index) => ({
                    id: index + 1,
                    student_id: 1,
                    exercise_id: index + 1,
                    answer_content: '示例答案内容',
                    score: Math.floor(Math.random() * 100),
                    feedback: '答案反馈',
                    submitted_at: new Date().toISOString(),
                    is_correct: Math.random() > 0.5
                }))
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('请先登录');
        }

        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (params.student_id) queryParams.append('student_id', params.student_id);
        if (params.exercise_id) queryParams.append('exercise_id', params.exercise_id);
        if (params.page) queryParams.append('page', params.page);
        if (params.page_size) queryParams.append('page_size', params.page_size);

        const answersUrl = `${API_CONFIG.BASE_URL}/student-answers/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        console.log('获取学生答案请求URL:', answersUrl);

        const response = await fetch(answersUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const responseData = await response.json();
        console.log('学生答案响应数据:', responseData);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('没有权限，请确保已登录');
            }
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '获取学生答案成功',
            data: responseData
        };
    } catch (error) {
        console.error('获取学生答案失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 提交学生答案
export async function submitStudentAnswer(data) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '提交答案成功',
            data: {
                id: Date.now(),
                ...data,
                submitted_at: new Date().toISOString()
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('请先登录');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/student-answers/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        console.log('提交答案响应:', responseData);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('没有权限，请确保已登录');
            }
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '提交答案成功',
            data: responseData
        };
    } catch (error) {
        console.error('提交答案失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 你可以继续添加其他接口方法，按需mock或真实请求

