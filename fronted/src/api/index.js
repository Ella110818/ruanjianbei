// 环境配置
const ENV = {
    development: {
        API_URL: 'http://localhost:8000',  // 本地开发服务器地址
        API_VERSION: 'api'
    },
    production: {
        API_URL: 'https://dariajane.pythonanywhere.com',
        API_VERSION: 'api'
    }
};

// 根据当前环境选择配置
const currentEnv = process.env.NODE_ENV || 'development';
const config = ENV[currentEnv];

// 导出API配置
export const API_CONFIG = {
    BASE_URL: `${config.API_URL}/${config.API_VERSION}`,
    TIMEOUT: 10000,  // 请求超时时间：10秒
    withCredentials: true  // 允许跨域请求携带凭证
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

// 获取基础URL
function getBaseUrl() {
    const env = getEnvironment();
    return `${ENV[env].API_URL}/${ENV[env].API_VERSION}`;
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
            console.log('尝试登录:', { username, role });

            const response = await fetch(`${BASE_URL}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    role
                })
            });

            console.log('登录响应状态:', response.status);

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
                return handleHttpError(response, responseData);
            }

            // 检查响应是否成功
            if (responseData.success && responseData.status_code === 200 && responseData.data) {
                const { access, refresh, user } = responseData.data;

                // 验证并保存token
                if (TokenManager.isValidToken(access) &&
                    TokenManager.isValidToken(refresh)) {
                    TokenManager.setTokens(access, refresh);

                    return {
                        code: 0,
                        msg: '登录成功',
                        data: {
                            token: access,
                            refreshToken: refresh,
                            user: {
                                ...user,
                                role
                            }
                        }
                    };
                } else {
                    console.error('Token格式无效:', responseData);
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
        // 返回mock数据
        return mockApiResponse(mockCourses);
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${BASE_URL}/courses/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const responseData = await response.json();
        console.log('课程列表响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        if (responseData.success && responseData.status_code === 200) {
            return {
                code: 0,
                msg: '获取课程列表成功',
                data: responseData.data.results || []
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '获取课程列表失败',
                data: []
            };
        }
    } catch (error) {
        console.error('获取课程列表失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
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

        const response = await fetch(`${BASE_URL}/courses/${courseId}/`, {
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

// 你可以继续添加其他接口方法，按需mock或真实请求
