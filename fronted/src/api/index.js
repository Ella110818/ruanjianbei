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
    console.log('当前环境:', env);
    console.log('Mock状态:', getMockFlag());

    // 如果是开发环境且没有设置过mock标志，默认设置为true
    if (env === 'development' && localStorage.getItem('USE_MOCK') === null) {
        localStorage.setItem('USE_MOCK', 'true');
        console.log('已自动设置为Mock环境');
        return true;
    }
    return getMockFlag();
}

// 切换Mock环境
export function toggleMockEnvironment() {
    const currentState = getMockFlag();
    localStorage.setItem('USE_MOCK', (!currentState).toString());
    console.log('Mock环境已切换为:', !currentState);
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
            console.log('===== 登录请求开始 =====');
            console.log('登录信息:', { username, role });

            const loginUrl = `${API_CONFIG.BASE_URL}/login/`;
            console.log('登录API地址:', loginUrl);

            const loginData = {
                username,
                password,
                role
            };
            console.log('发送的登录数据:', loginData);

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
                },
                body: JSON.stringify(loginData)
            });

            console.log('登录响应状态:', response.status);
            console.log('登录响应头:', Object.fromEntries(response.headers.entries()));

            let responseData;
            try {
                responseData = await response.json();
                console.log('登录响应数据:', responseData);
            } catch (e) {
                console.error('解析响应数据失败:', e);
                return {
                    code: 1,
                    msg: '服务器响应格式错误',
                    data: null
                };
            }

            if (!response.ok) {
                console.error('登录失败:', responseData);
                return handleHttpError(response, responseData);
            }

            // 检查响应是否成功
            if (responseData.success && responseData.status_code === 200 && responseData.data) {
                const { access, refresh, user } = responseData.data;
                console.log('获取到的Token信息:', {
                    access: access ? '存在' : '不存在',
                    refresh: refresh ? '存在' : '不存在'
                });

                // 验证并保存token
                if (TokenManager.isValidToken(access) &&
                    TokenManager.isValidToken(refresh)) {
                    console.log('Token验证通过，准备保存');
                    TokenManager.setTokens(access, refresh);

                    // 保存用户信息
                    const userInfo = {
                        ...user,
                        role
                    };
                    localStorage.setItem('user', JSON.stringify(userInfo));
                    console.log('用户信息已保存:', userInfo);

                    // 验证token是否正确保存
                    const savedToken = TokenManager.getAccessToken();
                    const savedRefreshToken = TokenManager.getRefreshToken();
                    console.log('Token保存状态:', {
                        accessToken: savedToken ? '已保存' : '未保存',
                        refreshToken: savedRefreshToken ? '已保存' : '未保存'
                    });

                    console.log('===== 登录成功 =====');
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
                    console.error('Token格式验证失败:', {
                        access: !!access,
                        refresh: !!refresh
                    });
                    return {
                        code: 1,
                        msg: 'Token格式无效',
                        data: null
                    };
                }
            } else {
                console.error('登录响应格式错误:', responseData);
                return {
                    code: 1,
                    msg: responseData.message || '登录失败',
                    data: null
                };
            }
        } catch (error) {
            console.error('登录请求失败:', error);
            return {
                code: 1,
                msg: error.message || '网络错误，请稍后重试',
                data: null
            };
        }
    }
}

// 示例接口：获取用户信息
export async function getUserInfo() {
    if (getMockFlag()) {
        return Promise.resolve({
            name: '本地测试用户',
            role: 'teacher',
            id: 1
        });
    } else {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/user/info`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `获取用户信息失败，状态码: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('获取用户信息失败:', error);
            throw error;
        }
    }
}

// 刷新token的函数
export async function refreshToken() {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(`${BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                refresh: refreshToken
            })
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || `刷新token失败，状态码: ${response.status}`);
        }

        if (responseData.success && responseData.status_code === 200 && responseData.data?.access) {
            TokenManager.setTokens(responseData.data.access, null); // 只更新access token
            return responseData.data.access;
        } else {
            throw new Error('响应中没有有效的access token');
        }
    } catch (error) {
        console.error('Token刷新失败:', error);
        TokenManager.clearTokens(); // 刷新失败时清除所有token
        throw error;
    }
}

// 获取课程列表
export async function getCourses() {
    if (getMockFlag()) {
        return mockApiResponse(mockCourses);
    }

    try {
        const token = TokenManager.getAccessToken();
        const headers = {
            ...API_CONFIG.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const coursesUrl = `${API_CONFIG.BASE_URL}/courses/`;
        console.log('发起请求:', {
            url: coursesUrl,
            method: 'GET',
            headers: headers
        });

        const response = await fetch(coursesUrl, {
            method: 'GET',
            headers: headers,
            cache: 'no-store'  // 禁用缓存
        });

        console.log('响应状态:', response.status);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));

        // 检查响应类型
        const contentType = response.headers.get('content-type');
        console.log('响应内容类型:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
            // 如果不是JSON，尝试读取文本内容以便调试
            const textContent = await response.text();
            console.log('非JSON响应内容:', textContent);
            return {
                code: 1,
                msg: '服务器返回了非JSON格式的响应',
                data: []
            };
        }

        const data = await response.json();
        console.log('响应数据:', data);

        if (!response.ok) {
            return handleHttpError(response, data);
        }

        return {
            code: 0,
            msg: '获取课程列表成功',
            data: data.data || []
        };

    } catch (error) {
        console.error('获取课程列表失败:', error);
        return {
            code: 1,
            msg: error.message || '获取课程列表失败',
            data: []
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

// 课程内容生成
export async function generateCourseContent(params) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '课程内容生成成功',
            data: {
                id: 1,
                title: params.course_name,
                description: params.course_description,
                subject: params.subject,
                grade_level: params.grade_level,
                created_at: new Date().toISOString()
            }
        });
    }

    try {
        console.log('===== 生成课程内容开始 =====');
        
        // 获取并验证token
        const token = TokenManager.getAccessToken();
        console.log('当前token状态:', token ? '存在' : '不存在');
        
        if (!token) {
            console.error('Token不存在，尝试从localStorage直接获取');
            const localToken = localStorage.getItem('token');
            if (localToken) {
                console.log('从localStorage获取到token');
                TokenManager.setTokens(localToken, null);
            } else {
                throw new Error('未找到有效的登录凭证，请重新登录');
            }
        }

        // 构建请求头
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        console.log('请求头:', headers);

        // 构建请求体
        const requestBody = {
            course_name: params.course_name,
            chapter_count: params.chapter_count || 5,  // 默认改为5章
            course_description: params.course_description,
            subject: params.subject,
            grade_level: params.grade_level,
            additional_requirements: params.additional_requirements,
            chatInput: params.chatInput,
            sessionId: params.sessionId || 'default-session'
        };
        console.log('请求参数:', requestBody);

        // 发送请求
        const url = `${API_CONFIG.BASE_URL}/course-generate/`;
        console.log('请求URL:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        console.log('响应状态:', response.status);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));

        const responseData = await response.json();
        console.log('响应数据:', responseData);

        if (!response.ok) {
            if (response.status === 403) {
                // 尝试刷新token
                try {
                    console.log('尝试刷新token...');
                    const newToken = await refreshToken();
                    if (newToken) {
                        console.log('token刷新成功，重试请求');
                        headers.Authorization = `Bearer ${newToken}`;
                        const retryResponse = await fetch(url, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify(requestBody)
                        });
                        
                        if (retryResponse.ok) {
                            const retryData = await retryResponse.json();
                            if (retryData.success && retryData.status_code === 200) {
                                return {
                                    code: 0,
                                    msg: '课程内容生成成功',
                                    data: retryData.data
                                };
                            }
                        }
                    }
                } catch (refreshError) {
                    console.error('token刷新失败:', refreshError);
                    TokenManager.clearTokens();
                    throw new Error('登录已过期，请重新登录');
                }
            }
            return handleHttpError(response, responseData);
        }

        if (responseData.success && responseData.status_code === 200) {
            console.log('===== 生成课程内容成功 =====');
            return {
                code: 0,
                msg: '课程内容生成成功',
                data: responseData.data
            };
        } else {
            console.error('生成课程内容失败:', responseData);
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

// 你可以继续添加其他接口方法，按需mock或真实请求
