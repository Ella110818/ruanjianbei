// 环境配置
const ENV = {
    development: {
        API_URL: 'http://localhost:8000',  // 本地开发服务器地址
        API_VERSION: 'api'
    },
    production: {
        API_URL: 'https://d35fdced922c.ngrok-free.app',  // 更新为新的ngrok地址
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
    withCredentials: true,  // 允许跨域凭证
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
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
    // 解析JWT token
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('解析token失败:', e);
            return null;
        }
    },

    // 检查token是否即将过期（5分钟内）
    isTokenExpiringSoon(token) {
        try {
            const decoded = this.parseJwt(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            const expirationTime = decoded.exp * 1000; // 转换为毫秒
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;
            const fiveMinutes = 5 * 60 * 1000; // 5分钟（毫秒）

            console.log('Token过期时间检查:', {
                currentTime: new Date(currentTime).toISOString(),
                expirationTime: new Date(expirationTime).toISOString(),
                timeUntilExpiry: Math.floor(timeUntilExpiry / 1000) + '秒'
            });

            return timeUntilExpiry < fiveMinutes;
        } catch (e) {
            console.error('检查token过期失败:', e);
            return true;
        }
    },

    // 检查是否需要刷新token
    async refreshTokenIfNeeded() {
        try {
            const token = this.getAccessToken();
            if (!token) {
                console.log('没有access token，需要刷新');
                return false;
            }

            // 如果token即将过期，才刷新
            if (this.isTokenExpiringSoon(token)) {
                console.log('Token即将过期，尝试刷新');
                const newToken = await this.refreshToken();
                return !!newToken;
            }

            console.log('Token仍然有效，无需刷新');
            return true;
        } catch (error) {
            console.error('检查token刷新失败:', error);
            return false;
        }
    },

    setTokens(accessToken, refreshToken) {
        if (accessToken) {
            localStorage.setItem('token', accessToken);
            console.log('Access Token已保存');
        }
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
            console.log('Refresh Token已保存');
        }
    },

    setAccessToken(accessToken) {
        if (accessToken) {
            localStorage.setItem('token', accessToken);
            console.log('Access Token已更新');
        }
    },

    getAccessToken() {
        const token = localStorage.getItem('token');
        console.log('当前Access Token状态:', token ? '存在' : '不存在');
        return token;
    },

    getRefreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        console.log('当前Refresh Token状态:', refreshToken ? '存在' : '不存在');
        return refreshToken;
    },

    clearTokens() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userPermissions');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isStaff');
        localStorage.removeItem('isSuperuser');
        console.log('所有认证相关数据已清除');
    },

    isValidToken(token) {
        const valid = token && typeof token === 'string' && token.length > 0;
        console.log('Token有效性检查:', valid);
        return valid;
    },

    async refreshToken(retryCount = 0) {
        const MAX_RETRIES = 2;
        try {
            const refreshToken = this.getRefreshToken();
            console.log('准备刷新token，当前refresh token状态:', refreshToken ? '存在' : '不存在');

            if (!refreshToken) {
                console.error('没有可用的Refresh Token');
                return null;
            }

            // 先尝试获取新token
            const tokenUrl = `${API_CONFIG.BASE_URL}/token/refresh/`;
            console.log('尝试刷新token，请求URL:', tokenUrl);

            const response = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ refresh: refreshToken })
            });

            // 打印响应头信息
            console.log('Token刷新响应状态:', response.status);
            console.log('Token刷新响应头:', Object.fromEntries(response.headers.entries()));

            const responseText = await response.text();
            console.log('Token刷新原始响应:', responseText);

            let responseData;
            try {
                responseData = JSON.parse(responseText);
                console.log('Token刷新解析后响应:', responseData);
            } catch (e) {
                console.error('Token刷新响应解析失败:', e);
                throw new Error('服务器响应格式错误');
            }

            if (response.ok && responseData.success && responseData.data) {
                const { access, refresh } = responseData.data;
                if (access && refresh) {
                    this.setTokens(access, refresh);
                    return access;
                }
            }

            // 如果刷新失败且未超过重试次数，等待后重试
            if (retryCount < MAX_RETRIES) {
                console.log(`Token刷新失败，${retryCount + 1}秒后重试...`);
                await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
                return this.refreshToken(retryCount + 1);
            }

            // 如果所有重试都失败，清除tokens并重定向到登录页
            console.error('Token刷新重试次数已达上限');
            this.clearTokens();
            window.location.href = '/login';
            return null;
        } catch (error) {
            console.error('刷新Token过程出错:', error);

            // 如果是网络错误且未超过重试次数，等待后重试
            if (error.name === 'TypeError' && retryCount < MAX_RETRIES) {
                console.log(`网络错误，${retryCount + 1}秒后重试...`);
                await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
                return this.refreshToken(retryCount + 1);
            }

            return null;
        }
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
                success: true,
                status_code: 200,
                data: {
                    name: '测试用户',
                    role: role || 'teacher',
                    id: 1,
                    access: 'mock_token',
                    refresh: 'mock_refresh_token'
                }
            });
        } else {
            return Promise.resolve({
                success: false,
                status_code: 400,
                message: '用户名或密码错误',
                data: null
            });
        }
    } else {
        try {
            // 1. 首先进行登录
            const loginUrl = `${API_CONFIG.BASE_URL}/login/`;
            console.log('开始登录请求');

            const loginData = {
                username,
                password,
                role
            };

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(loginData)
            });

            let responseData;
            try {
                responseData = await response.json();
                console.log('登录响应数据:', responseData);
            } catch (e) {
                console.error('登录响应解析失败:', e);
                return {
                    code: 1,
                    msg: '服务器响应格式错误',
                    data: null
                };
            }

            if (!response.ok) {
                return handleHttpError(response, responseData);
            }

            // 检查登录响应是否成功
            if (responseData.success && responseData.status_code === 200 && responseData.data) {
                const { access, refresh } = responseData.data;
                console.log('登录成功，获取到tokens:', {
                    accessToken: access ? '存在' : '不存在',
                    refreshToken: refresh ? '存在' : '不存在'
                });

                // 先清除旧数据
                TokenManager.clearTokens();

                // 保存新token
                TokenManager.setTokens(access, refresh);

                // 2. 获取角色列表，找到对应角色的ID
                console.log('开始获取角色列表');
                const rolesResponse = await fetch(`${API_CONFIG.BASE_URL}/roles/`, {
                    method: 'GET',
                    headers: {
                        ...API_CONFIG.headers,
                        'Authorization': `Bearer ${access}`, // 使用新获取的 token
                        'ngrok-skip-browser-warning': 'true'
                    }
                });

                const rolesData = await rolesResponse.json();
                console.log('获取角色列表响应:', rolesData);

                if (!rolesData.success || rolesData.status_code !== 200) {
                    console.error('获取角色列表失败:', rolesData);
                    return {
                        code: 1,
                        msg: '获取角色信息失败',
                        data: null
                    };
                }

                // 找到对应角色的ID
                const userRole = rolesData.data.results.find(r => r.name === role);
                if (!userRole) {
                    console.error('未找到对应的角色ID');
                    return {
                        code: 1,
                        msg: '未找到对应的角色信息',
                        data: null
                    };
                }

                // 3. 获取角色详细信息
                console.log('开始获取角色详细信息, 角色ID:', userRole.id);
                const roleDetailResponse = await fetch(`${API_CONFIG.BASE_URL}/roles/${userRole.id}/`, {
                    method: 'GET',
                    headers: {
                        ...API_CONFIG.headers,
                        'Authorization': `Bearer ${access}`, // 使用新获取的 token
                        'ngrok-skip-browser-warning': 'true'
                    }
                });

                const roleDetailData = await roleDetailResponse.json();
                console.log('角色详细信息响应:', roleDetailData);

                if (!roleDetailData.success || roleDetailData.status_code !== 200) {
                    console.error('获取角色详细信息失败:', roleDetailData);
                    return {
                        code: 1,
                        msg: '获取角色详细信息失败',
                        data: null
                    };
                }

                // 保存用户信息
                const userInfo = {
                    ...responseData.data.user,
                    role,
                    roleId: userRole.id,
                    permissions: roleDetailData.data.permissions || []
                };
                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('userRole', role);
                localStorage.setItem('userRoleId', userRole.id);
                localStorage.setItem('userPermissions', JSON.stringify(roleDetailData.data.permissions || []));

                return {
                    code: 0,
                    msg: '登录成功',
                    data: {
                        token: access,
                        refreshToken: refresh,
                        user: userInfo,
                        roleDetail: roleDetailData.data
                    }
                };
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

// 获取角色列表和详细信息的函数已经在文件前面定义过了

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
        console.log('准备刷新token，当前refresh token状态:', refreshToken ? '存在' : '不存在');

        if (!refreshToken) {
            console.error('没有可用的Refresh Token');
            return null;
        }

        // 打印完整请求信息
        const requestInfo = {
            url: `${API_CONFIG.BASE_URL}/token/refresh/`,
            headers: {
                ...API_CONFIG.headers,
                'ngrok-skip-browser-warning': 'true'
            },
            body: { refresh: refreshToken }
        };
        console.log('Token刷新请求信息:', requestInfo);

        const response = await fetch(requestInfo.url, {
            method: 'POST',
            headers: requestInfo.headers,
            body: JSON.stringify(requestInfo.body)
        });

        // 打印响应头信息
        console.log('Token刷新响应状态:', response.status);
        console.log('Token刷新响应头:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Token刷新原始响应:', responseText);

        try {
            const data = JSON.parse(responseText);
            console.log('Token刷新解析后响应:', data);

            if (response.ok && data.success && data.data && data.data.access) {
                TokenManager.setTokens(data.data.access, data.data.refresh);
                return data.data.access;
            }

            // 详细的错误信息
            if (response.status === 401) {
                console.error('Refresh Token已失效，需要重新登录');
                TokenManager.clearTokens();
            } else {
                console.error('刷新Token失败:', {
                    status: response.status,
                    data: data,
                    error: data.error_code || data.message
                });
            }
            return null;
        } catch (e) {
            console.error('Token刷新响应解析失败:', e);
            console.error('原始响应内容:', responseText);
            return null;
        }
    } catch (error) {
        console.error('刷新Token请求失败:', error);
        return null;
    }
}

// 通用请求处理函数
async function handleRequest(url, options = {}, retryCount = 0) {
    const MAX_RETRIES = 1; // 最多重试一次

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            console.log('没有access token，尝试刷新');
            const newToken = await TokenManager.refreshToken();
            if (!newToken) {
                console.log('刷新token失败，需要重新登录');
                TokenManager.clearTokens();
                window.location.href = '/login';
                return {
                    code: 1,
                    msg: '请重新登录',
                    data: null
                };
            }
        }

        // 确保每次请求都使用最新的token
        const currentToken = TokenManager.getAccessToken();
        console.log('发送请求使用的token:', currentToken);

        const finalOptions = {
            ...options,
            headers: {
                ...API_CONFIG.headers,
                'Authorization': `Bearer ${currentToken}`,
                'ngrok-skip-browser-warning': 'true',
                ...(options.headers || {})
            }
        };

        console.log('请求配置:', {
            url,
            method: finalOptions.method || 'GET',
            headers: finalOptions.headers
        });

        const response = await fetch(url, finalOptions);
        let responseData;

        try {
            const responseText = await response.text();
            console.log('原始响应:', responseText);
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('响应解析失败:', e);
            throw new Error('服务器返回了非JSON格式的数据');
        }

        // 如果是401或403，并且还没有达到最大重试次数，尝试刷新token
        if ((response.status === 401 || response.status === 403) && retryCount < MAX_RETRIES) {
            console.log(`收到${response.status}响应，尝试刷新token (重试次数: ${retryCount + 1}/${MAX_RETRIES})`);
            const newToken = await TokenManager.refreshToken();
            if (newToken) {
                console.log('Token刷新成功，重试请求');
                return handleRequest(url, options, retryCount + 1);
            } else {
                console.log('Token刷新失败，需要重新登录');
                TokenManager.clearTokens();
                window.location.href = '/login';
                return {
                    code: 1,
                    msg: '请重新登录',
                    data: null
                };
            }
        }

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return responseData;
    } catch (error) {
        console.error('Request Error:', error);
        return {
            code: 1,
            msg: error.message || '请求失败',
            data: null
        };
    }
}

// 重置用户密码
export async function resetUserPassword(username) {
    if (getMockFlag()) {
        return mockApiResponse({ success: true });
    }

    const url = `${API_CONFIG.BASE_URL}/users/${username}/reset-password/`;
    return handleRequest(url, {
        method: 'POST'
    });
}

// 获取课程列表
export async function getCourseList(params = {}) {
    if (getMockFlag()) {
        return mockApiResponse(mockCourseList);
    }

    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.BASE_URL}/courses/${queryString ? `?${queryString}` : ''}`;

        const response = await handleRequest(url);

        if (response.success && response.status_code === 200) {
            return {
                code: 0,
                msg: '获取课程列表成功',
                data: response.data
            };
        } else {
            return {
                code: 1,
                msg: response.message || '获取课程列表失败',
                data: null
            };
        }
    } catch (error) {
        console.error('获取课程列表失败:', error);
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
        const courseDetailUrl = `${API_CONFIG.BASE_URL}/courses/${courseId}/`;

        const response = await fetch(courseDetailUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
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
export function hasPermission(permissionName) {
    try {
        // 检查是否是超级用户
        const isSuperuser = localStorage.getItem('isSuperuser') === 'true';
        if (isSuperuser) {
            return true;  // 超级用户拥有所有权限
        }

        // 获取权限数据
        const permissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');

        // 检查具体权限
        return permissions.permissions?.some(p => p.name === permissionName) || false;
    } catch (error) {
        console.error('检查权限失败:', error);
        return false;
    }
}

// 检查用户是否有特定角色
export function hasRole(roleName) {
    try {
        const userRole = localStorage.getItem('userRole');
        return userRole === roleName;
    } catch (error) {
        console.error('检查角色失败:', error);
        return false;
    }
}

// 检查用户是否是工作人员
export function isStaff() {
    return localStorage.getItem('isStaff') === 'true';
}

// 检查用户是否是超级用户
export function isSuperuser() {
    return localStorage.getItem('isSuperuser') === 'true';
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
        if (!token) {
            throw new Error('请先登录');
        }

        // 构建导出URL
        const exportUrl = `${API_CONFIG.BASE_URL}/questions-generate/export/?session_key=${sessionKey}&format=${format}&filename=${filename}`;
        console.log('导出URL:', exportUrl);

        const response = await fetch(exportUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': format === 'json' ? 'application/json' : 'text/csv'
            }
        });

        if (!response.ok) {
            throw new Error(`导出失败: ${response.status}`);
        }

        // 检查Content-Type
        const contentType = response.headers.get('Content-Type');

        if (contentType && contentType.includes('application/json')) {
            // JSON响应
            const data = await response.json();
            return {
                code: 0,
                msg: '导出成功',
                data
            };
        } else {
            // 文件下载
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
            return {
                code: 1,
                msg: '未登录或登录已过期',
                data: null
            };
        }

        const queryString = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.BASE_URL}/exercises/${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...API_CONFIG.headers,
                'Authorization': `Bearer ${token}`
            }
        });

        // 添加详细的响应日志
        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

        // 获取原始响应文本
        const responseText = await response.text();
        console.log('API Raw Response:', responseText);

        // 尝试解析JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            throw new Error('服务器返回了非JSON格式的数据');
        }

        if (!response.ok) {
            // 如果是401或403，可能是token过期
            if (response.status === 401 || response.status === 403) {
                // 尝试刷新token
                try {
                    const newToken = await TokenManager.refreshToken();
                    if (newToken) {
                        // 使用新token重试请求
                        return await getExercises(params);
                    }
                } catch (refreshError) {
                    console.error('Token刷新失败:', refreshError);
                    // 清除token并重定向到登录页
                    TokenManager.clearTokens();
                    window.location.href = '/login';
                    return {
                        code: 1,
                        msg: '登录已过期，请重新登录',
                        data: null
                    };
                }
            }
            return handleHttpError(response, data);
        }

        return {
            code: 0,
            msg: '获取练习题成功',
            data: data.data || []
        };
    } catch (error) {
        console.error('获取练习题失败:', error);
        return {
            code: 1,
            msg: error.message || '获取练习题失败',
            data: null
        };
    }
}

// 获取单个练习题详情
export async function getExerciseDetail(exerciseId) {
    if (getMockFlag()) {
        // 返回mock数据
        const exercise = mockCourses.find(course => course.id === exerciseId);
        if (!exercise) {
            return {
                code: 1,
                msg: '练习题不存在',
                data: null
            };
        }
        return mockApiResponse({
            ...exercise,
            ...mockCourseDetail
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        // 构建URL并添加bypass参数
        const exerciseDetailUrl = `${API_CONFIG.BASE_URL}/exercises/${exerciseId}/`;

        const response = await fetch(exerciseDetailUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        const responseData = await response.json();
        console.log('练习题详情响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        if (responseData.success && responseData.status_code === 200) {
            return {
                code: 0,
                msg: '获取练习题详情成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '获取练习题详情失败',
                data: null
            };
        }
    } catch (error) {
        console.error('获取练习题详情失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 创建新练习题
export async function createExercise(exerciseData) {
    if (getMockFlag()) {
        // 返回mock数据
        const newExercise = {
            ...exerciseData,
            id: mockCourses.length + 1, // 使用课程ID作为练习题ID
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        mockCourses.push(newExercise); // 将新练习题添加到mock课程列表中
        return Promise.resolve({
            code: 0,
            msg: '创建练习题成功',
            data: newExercise
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${BASE_URL}/exercises/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(exerciseData)
        });

        const responseData = await response.json();
        console.log('创建练习题响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        if (responseData.success && responseData.status_code === 200) {
            return {
                code: 0,
                msg: '创建练习题成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '创建练习题失败',
                data: null
            };
        }
    } catch (error) {
        console.error('创建练习题失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 更新练习题信息
export async function updateExercise(exerciseId, exerciseData) {
    if (getMockFlag()) {
        // 返回mock数据
        const index = mockCourses.findIndex(course => course.id === exerciseId);
        if (index !== -1) {
            mockCourses[index] = {
                ...mockCourses[index],
                ...exerciseData,
                updated_at: new Date().toISOString()
            };
            return Promise.resolve({
                code: 0,
                msg: '更新练习题成功',
                data: mockCourses[index]
            });
        }
        return Promise.resolve({
            code: 1,
            msg: '练习题不存在',
            data: null
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${BASE_URL}/exercises/${exerciseId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(exerciseData)
        });

        const responseData = await response.json();
        console.log('更新练习题响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        if (responseData.success && responseData.status_code === 200) {
            return {
                code: 0,
                msg: '更新练习题成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '更新练习题失败',
                data: null
            };
        }
    } catch (error) {
        console.error('更新练习题失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 删除练习题
export async function deleteExercise(exerciseId) {
    if (getMockFlag()) {
        // 返回mock数据
        const index = mockCourses.findIndex(course => course.id === exerciseId);
        if (index !== -1) {
            mockCourses.splice(index, 1);
            return Promise.resolve({
                code: 0,
                msg: '删除练习题成功',
                data: null
            });
        }
        return Promise.resolve({
            code: 1,
            msg: '练习题不存在',
            data: null
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${BASE_URL}/exercises/${exerciseId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.status === 204) {
            return {
                code: 0,
                msg: '删除练习题成功',
                data: null
            };
        }

        const responseData = await response.json();
        console.log('删除练习题响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return {
            code: 1,
            msg: responseData.message || '删除练习题失败',
            data: null
        };
    } catch (error) {
        console.error('删除练习题失败:', error);
        return {
            code: 1,
            msg: error.message || '网络错误，请稍后重试',
            data: null
        };
    }
}

// 获取所有角色列表
export async function getRoles() {
    if (getMockFlag()) {
        return Promise.resolve({
            success: true,
            status_code: 200,
            data: {
                count: 3,
                next: null,
                previous: null,
                results: [
                    { id: 1, name: 'teacher', display_name: '教师' },
                    { id: 2, name: 'student', display_name: '学生' },
                    { id: 3, name: 'admin', display_name: '管理员' }
                ]
            }
        });
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/roles/`, {
            method: 'GET',
            headers: {
                ...API_CONFIG.headers,
                'Authorization': `Bearer ${TokenManager.getAccessToken()}`,
                'ngrok-skip-browser-warning': 'true'
            }
        });

        const responseData = await response.json();
        console.log('获取角色列表原始响应:', responseData);

        // 直接返回后端的响应，不做转换
        return responseData;
    } catch (error) {
        console.error('获取角色列表失败:', error);
        return {
            success: false,
            status_code: 500,
            message: '获取角色列表失败'
        };
    }
}

// 获取指定角色详情
export async function getRoleById(roleId) {
    if (getMockFlag()) {
        const mockRole = {
            id: roleId,
            name: roleId === 1 ? 'teacher' : roleId === 2 ? 'student' : 'admin',
            display_name: roleId === 1 ? '教师' : roleId === 2 ? '学生' : '管理员',
            permissions: []
        };
        return mockApiResponse({
            code: 0,
            msg: '获取角色详情成功',
            data: mockRole
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/roles/${roleId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        const responseData = await response.json();
        console.log('获取角色详情响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '获取角色详情成功',
            data: responseData.data || null
        };
    } catch (error) {
        console.error('获取角色详情失败:', error);
        return {
            code: 1,
            msg: error.message || '获取角色详情失败',
            data: null
        };
    }
}

// 获取我的课程列表
export async function getMyCourses(params = {}, retryCount = 0) {
    const MAX_RETRIES = 1; // 最多只重试一次

    if (getMockFlag()) {
        return mockApiResponse(mockCourseList);
    }

    try {
        // 先检查并刷新token如果需要
        await TokenManager.refreshTokenIfNeeded();

        const token = TokenManager.getAccessToken();
        if (!token) {
            console.log('没有有效的token，重定向到登录页');
            TokenManager.clearTokens();
            window.location.href = '/login';
            return {
                code: 1,
                msg: '请重新登录',
                data: null
            };
        }

        // 检查用户角色
        const userInfo = getUserInfo();
        if (!userInfo || !userInfo.role) {
            console.log('用户信息不完整，尝试重新获取用户信息');
            // 尝试重新获取用户信息和权限
            const roleResponse = await getUserRoleAndPermissions();
            if (roleResponse.code !== 0) {
                console.error('获取用户角色和权限失败');
                return {
                    code: 1,
                    msg: '获取用户权限失败',
                    data: null
                };
            }
        }

        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.ordering) queryParams.append('ordering', params.ordering);
        if (params.page) queryParams.append('page', params.page);

        const queryString = queryParams.toString();
        const url = `${API_CONFIG.BASE_URL}/courses/my_courses/${queryString ? `?${queryString}` : ''}`;

        console.log('请求我的课程列表URL:', url);
        console.log('请求Headers:', {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        });

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        // 打印响应头信息，帮助调试
        console.log('响应状态:', response.status);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));

        const responseData = await response.json();
        console.log('获取我的课程列表响应:', responseData);

        if (!response.ok) {
            if ((response.status === 403 || response.status === 401) && retryCount < MAX_RETRIES) {
                console.log(`认证失败，尝试刷新token (重试次数: ${retryCount + 1}/${MAX_RETRIES})`);
                const newToken = await TokenManager.refreshToken();
                if (newToken) {
                    console.log('token刷新成功，重试请求');
                    return getMyCourses(params, retryCount + 1);
                }
            }

            // 如果是权限问题，检查用户角色
            if (response.status === 403) {
                const userRole = localStorage.getItem('userRole');
                console.log('当前用户角色:', userRole);

                // 如果没有角色信息，尝试重新获取
                if (!userRole) {
                    console.log('尝试重新获取用户角色和权限');
                    const roleResponse = await getUserRoleAndPermissions();
                    if (roleResponse.code === 0) {
                        // 获取成功后重试请求
                        return getMyCourses(params, retryCount);
                    }
                }

                // 返回具体的权限错误信息
                return {
                    code: 1,
                    msg: '没有访问权限，请确认您是否具有教师角色',
                    data: null
                };
            }

            return handleHttpError(response, responseData);
        }

        // 检查响应格式
        if (responseData.success && responseData.data) {
            return {
                code: 0,
                msg: '获取我的课程列表成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '获取我的课程列表失败',
                data: null
            };
        }
    } catch (error) {
        console.error('获取我的课程列表失败:', error);
        return {
            code: 1,
            msg: error.message || '获取我的课程列表失败',
            data: null
        };
    }
}

// 获取用户列表
export async function getUserList(params = {}) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取用户列表成功',
            data: {
                total: 100,
                results: Array(10).fill().map((_, index) => ({
                    id: index + 1,
                    username: `user${index + 1}`,
                    name: `用户${index + 1}`,
                    role: index % 2 === 0 ? 'teacher' : 'student',
                    email: `user${index + 1}@example.com`,
                    lastLogin: new Date().toISOString(),
                    status: index % 5 === 0 ? 'disabled' : 'active'
                }))
            }
        });
    }

    try {
        // 先检查并刷新token如果需要
        await TokenManager.refreshTokenIfNeeded();

        const token = TokenManager.getAccessToken();
        if (!token) {
            console.log('没有有效的token，重定向到登录页');
            TokenManager.clearTokens();
            window.location.href = '/login';
            return {
                code: 1,
                msg: '请重新登录',
                data: null
            };
        }

        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.role) queryParams.append('role', params.role);
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page);
        if (params.ordering) queryParams.append('ordering', params.ordering);

        const queryString = queryParams.toString();
        const url = `${API_CONFIG.BASE_URL}/users/${queryString ? `?${queryString}` : ''}`;

        console.log('请求用户列表URL:', url);
        console.log('请求Headers:', {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        });

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        // 打印响应头信息，帮助调试
        console.log('响应状态:', response.status);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));

        const responseData = await response.json();
        console.log('获取用户列表响应:', responseData);

        if (!response.ok) {
            if (response.status === 403 || response.status === 401) {
                console.log('认证失败，尝试刷新token');
                const newToken = await TokenManager.refreshToken();
                if (newToken) {
                    console.log('token刷新成功，重试请求');
                    return getUserList(params);
                } else {
                    console.log('token刷新失败，需要重新登录');
                    TokenManager.clearTokens();
                    window.location.href = '/login';
                    return {
                        code: 1,
                        msg: '认证失败，请重新登录',
                        data: null
                    };
                }
            }
            return handleHttpError(response, responseData);
        }

        // 检查响应格式
        if (responseData.success && responseData.data) {
            return {
                code: 0,
                msg: '获取用户列表成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '获取用户列表失败',
                data: null
            };
        }
    } catch (error) {
        console.error('获取用户列表失败:', error);
        return {
            code: 1,
            msg: error.message || '获取用户列表失败',
            data: null
        };
    }
}

// 创建用户
export async function createUser(userData) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '创建用户成功',
            data: {
                ...userData,
                id: Math.floor(Math.random() * 1000),
                created_at: new Date().toISOString()
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/users/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(userData)
        });

        const responseData = await response.json();
        console.log('创建用户响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '创建用户成功',
            data: responseData.data
        };
    } catch (error) {
        console.error('创建用户失败:', error);
        return {
            code: 1,
            msg: error.message || '创建用户失败',
            data: null
        };
    }
}

// 更新用户信息
export async function updateUser(username, userData) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '更新用户成功',
            data: {
                ...userData,
                updated_at: new Date().toISOString()
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/users/${username}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(userData)
        });

        const responseData = await response.json();
        console.log('更新用户响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '更新用户成功',
            data: responseData.data
        };
    } catch (error) {
        console.error('更新用户失败:', error);
        return {
            code: 1,
            msg: error.message || '更新用户失败',
            data: null
        };
    }
}

// 切换用户状态（启用/禁用）
export async function toggleUserStatus(username) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '切换用户状态成功',
            data: null
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/users/${username}/toggle-status/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        const responseData = await response.json();
        console.log('切换用户状态响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '切换用户状态成功',
            data: responseData.data
        };
    } catch (error) {
        console.error('切换用户状态失败:', error);
        return {
            code: 1,
            msg: error.message || '切换用户状态失败',
            data: null
        };
    }
}

// 获取当前用户信息
export async function getCurrentUser() {
    if (getMockFlag()) {
        const mockUser = {
            id: 1,
            username: 'teacher1',
            name: '测试教师',
            role: 'teacher',
            email: 'teacher@example.com',
            lastLogin: new Date().toISOString(),
            status: 'active'
        };
        return mockApiResponse({
            code: 0,
            msg: '获取用户信息成功',
            data: mockUser
        });
    }

    try {
        // 先检查并刷新token如果需要
        await TokenManager.refreshTokenIfNeeded();

        const token = TokenManager.getAccessToken();
        if (!token) {
            console.log('没有有效的token，重定向到登录页');
            TokenManager.clearTokens();
            window.location.href = '/login';
            return {
                code: 1,
                msg: '请重新登录',
                data: null
            };
        }

        // 先尝试从localStorage获取缓存的用户信息
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
            try {
                const userData = JSON.parse(cachedUser);
                console.log('从缓存获取用户信息:', userData);
                return {
                    code: 0,
                    msg: '获取用户信息成功',
                    data: userData
                };
            } catch (e) {
                console.error('解析缓存用户信息失败:', e);
                // 如果解析失败，继续从服务器获取
            }
        }

        const url = `${API_CONFIG.BASE_URL}/users/me/`;
        console.log('请求当前用户信息URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        // 打印响应头信息，帮助调试
        console.log('响应状态:', response.status);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));

        const responseData = await response.json();
        console.log('获取当前用户信息响应:', responseData);

        if (!response.ok) {
            if (response.status === 403 || response.status === 401) {
                console.log('认证失败，尝试刷新token');
                const newToken = await TokenManager.refreshToken();
                if (newToken) {
                    console.log('token刷新成功，重试请求');
                    return getCurrentUser();
                } else {
                    console.log('token刷新失败，需要重新登录');
                    TokenManager.clearTokens();
                    window.location.href = '/login';
                    return {
                        code: 1,
                        msg: '认证失败，请重新登录',
                        data: null
                    };
                }
            }
            return handleHttpError(response, responseData);
        }

        // 检查响应格式
        if (responseData.success && responseData.data) {
            // 缓存用户信息到localStorage
            localStorage.setItem('user', JSON.stringify(responseData.data));

            return {
                code: 0,
                msg: '获取用户信息成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '获取用户信息失败',
                data: null
            };
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        return {
            code: 1,
            msg: error.message || '获取用户信息失败',
            data: null
        };
    }
}

// 修改获取用户角色和权限的函数
export async function getUserRoleAndPermissions() {
    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        // 获取用户信息
        const userInfo = getUserInfo();
        console.log('当前用户信息:', userInfo);
        if (!userInfo || !userInfo.role) {
            throw new Error('用户信息或角色不存在');
        }

        // 获取所有角色列表
        const rolesResponse = await fetch(`${API_CONFIG.BASE_URL}/roles/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        const rolesData = await rolesResponse.json();
        console.log('所有角色列表:', rolesData);

        if (!rolesResponse.ok || !rolesData.success) {
            throw new Error('获取角色列表失败');
        }

        // 从results数组中找到用户的角色
        const userRole = rolesData.data.results.find(role => role.name === userInfo.role);
        console.log('找到用户角色:', userRole);

        if (!userRole) {
            throw new Error('未找到用户对应的角色信息');
        }

        // 获取该角色的详细权限信息
        const roleDetailResponse = await fetch(`${API_CONFIG.BASE_URL}/roles/${userRole.id}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        const roleDetailData = await roleDetailResponse.json();
        console.log('角色详细信息:', roleDetailData);

        if (!roleDetailResponse.ok || !roleDetailData.success) {
            throw new Error('获取角色详情失败');
        }

        const roleData = roleDetailData.data;

        // 保存角色和权限信息
        localStorage.setItem('userRole', roleData.name);
        localStorage.setItem('isStaff', roleData.name === 'teacher' ? 'true' : 'false');
        localStorage.setItem('isSuperuser', roleData.name === 'admin' ? 'true' : 'false');
        localStorage.setItem('userPermissions', JSON.stringify({
            permissions: roleData.permissions || []
        }));

        return {
            code: 0,
            msg: '获取用户角色和权限成功',
            data: roleData
        };
    } catch (error) {
        console.error('获取用户角色和权限失败:', error);
        return {
            code: 1,
            msg: error.message || '获取用户角色和权限失败',
            data: null
        };
    }
}

// 获取知识点列表
export async function getKnowledgePoints(params = {}) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取知识点列表成功',
            data: {
                results: [
                    {
                        id: 1,
                        name: '变量与数据类型',
                        description: 'Python基础知识点',
                        subject: 'Python',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 2,
                        name: '条件语句',
                        description: 'Python控制流',
                        subject: 'Python',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 3,
                        name: '循环结构',
                        description: 'Python循环语句',
                        subject: 'Python',
                        created_at: new Date().toISOString()
                    }
                ],
                total: 3
            }
        });
    }

    try {
        // 先检查并刷新token如果需要
        await TokenManager.refreshTokenIfNeeded();

        const token = TokenManager.getAccessToken();
        if (!token) {
            console.log('没有有效的token，重定向到登录页');
            TokenManager.clearTokens();
            window.location.href = '/login';
            return {
                code: 1,
                msg: '请重新登录',
                data: null
            };
        }

        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.subject) queryParams.append('subject', params.subject);
        if (params.page) queryParams.append('page', params.page);
        if (params.page_size) queryParams.append('page_size', params.page_size);
        if (params.ordering) queryParams.append('ordering', params.ordering);

        const queryString = queryParams.toString();
        const url = `${API_CONFIG.BASE_URL}/knowledge-points/${queryString ? `?${queryString}` : ''}`;

        console.log('请求知识点列表URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        // 打印响应头信息，帮助调试
        console.log('响应状态:', response.status);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));

        const responseData = await response.json();
        console.log('获取知识点列表响应:', responseData);

        if (!response.ok) {
            if (response.status === 403 || response.status === 401) {
                console.log('认证失败，尝试刷新token');
                const newToken = await TokenManager.refreshToken();
                if (newToken) {
                    console.log('token刷新成功，重试请求');
                    return getKnowledgePoints(params);
                } else {
                    console.log('token刷新失败，需要重新登录');
                    TokenManager.clearTokens();
                    window.location.href = '/login';
                    return {
                        code: 1,
                        msg: '认证失败，请重新登录',
                        data: null
                    };
                }
            }
            return handleHttpError(response, responseData);
        }

        // 检查响应格式
        if (responseData.success && responseData.data) {
            return {
                code: 0,
                msg: '获取知识点列表成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '获取知识点列表失败',
                data: null
            };
        }
    } catch (error) {
        console.error('获取知识点列表失败:', error);
        return {
            code: 1,
            msg: error.message || '获取知识点列表失败',
            data: null
        };
    }
}

// 获取单个知识点详情
export async function getKnowledgePointDetail(pointId) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取知识点详情成功',
            data: {
                id: pointId,
                name: '变量与数据类型',
                description: 'Python基础知识点',
                subject: 'Python',
                content: '详细的知识点内容...',
                examples: ['示例1', '示例2'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const url = `${API_CONFIG.BASE_URL}/knowledge-points/${pointId}/`;
        console.log('请求知识点详情URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        const responseData = await response.json();
        console.log('获取知识点详情响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        if (responseData.success && responseData.data) {
            return {
                code: 0,
                msg: '获取知识点详情成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '获取知识点详情失败',
                data: null
            };
        }
    } catch (error) {
        console.error('获取知识点详情失败:', error);
        return {
            code: 1,
            msg: error.message || '获取知识点详情失败',
            data: null
        };
    }
}

// 创建知识点
export async function createKnowledgePoint(pointData) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '创建知识点成功',
            data: {
                ...pointData,
                id: Math.floor(Math.random() * 1000),
                created_at: new Date().toISOString()
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/knowledge-points/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(pointData)
        });

        const responseData = await response.json();
        console.log('创建知识点响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '创建知识点成功',
            data: responseData.data
        };
    } catch (error) {
        console.error('创建知识点失败:', error);
        return {
            code: 1,
            msg: error.message || '创建知识点失败',
            data: null
        };
    }
}

// 更新知识点
export async function updateKnowledgePoint(pointId, pointData) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '更新知识点成功',
            data: {
                ...pointData,
                id: pointId,
                updated_at: new Date().toISOString()
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/knowledge-points/${pointId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(pointData)
        });

        const responseData = await response.json();
        console.log('更新知识点响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '更新知识点成功',
            data: responseData.data
        };
    } catch (error) {
        console.error('更新知识点失败:', error);
        return {
            code: 1,
            msg: error.message || '更新知识点失败',
            data: null
        };
    }
}

// 删除知识点
export async function deleteKnowledgePoint(pointId) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '删除知识点成功',
            data: null
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/knowledge-points/${pointId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (response.status === 204) {
            return {
                code: 0,
                msg: '删除知识点成功',
                data: null
            };
        }

        const responseData = await response.json();
        console.log('删除知识点响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return {
            code: 1,
            msg: responseData.message || '删除知识点失败',
            data: null
        };
    } catch (error) {
        console.error('删除知识点失败:', error);
        return {
            code: 1,
            msg: error.message || '删除知识点失败',
            data: null
        };
    }
}

// 获取学生答题记录
export async function getStudentAnswers(params = {}) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取学生答题记录成功',
            data: {
                results: [
                    {
                        id: 1,
                        student_id: 1,
                        student_name: '张三',
                        exercise_id: 1,
                        exercise_title: 'Python基础语法',
                        answer: 'A',
                        is_correct: true,
                        score: 10,
                        submit_time: new Date().toISOString()
                    },
                    {
                        id: 2,
                        student_id: 2,
                        student_name: '李四',
                        exercise_id: 1,
                        exercise_title: 'Python基础语法',
                        answer: 'B',
                        is_correct: false,
                        score: 0,
                        submit_time: new Date().toISOString()
                    }
                ],
                total: 2
            }
        });
    }

    try {
        // 先检查并刷新token如果需要
        await TokenManager.refreshTokenIfNeeded();

        const token = TokenManager.getAccessToken();
        if (!token) {
            console.log('没有有效的token，重定向到登录页');
            TokenManager.clearTokens();
            window.location.href = '/login';
            return {
                code: 1,
                msg: '请重新登录',
                data: null
            };
        }

        // 构建查询参数
        const queryParams = new URLSearchParams();
        if (params.exercise_id) queryParams.append('exercise_id', params.exercise_id);
        if (params.student_id) queryParams.append('student_id', params.student_id);
        if (params.is_correct !== undefined) queryParams.append('is_correct', params.is_correct);
        if (params.page) queryParams.append('page', params.page);
        if (params.page_size) queryParams.append('page_size', params.page_size);
        if (params.ordering) queryParams.append('ordering', params.ordering);

        const queryString = queryParams.toString();
        const url = `${API_CONFIG.BASE_URL}/student-answers/${queryString ? `?${queryString}` : ''}`;

        console.log('请求学生答题记录URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        // 打印响应头信息，帮助调试
        console.log('响应状态:', response.status);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));

        const responseData = await response.json();
        console.log('获取学生答题记录响应:', responseData);

        if (!response.ok) {
            if (response.status === 403 || response.status === 401) {
                console.log('认证失败，尝试刷新token');
                const newToken = await TokenManager.refreshToken();
                if (newToken) {
                    console.log('token刷新成功，重试请求');
                    return getStudentAnswers(params);
                } else {
                    console.log('token刷新失败，需要重新登录');
                    TokenManager.clearTokens();
                    window.location.href = '/login';
                    return {
                        code: 1,
                        msg: '认证失败，请重新登录',
                        data: null
                    };
                }
            }
            return handleHttpError(response, responseData);
        }

        // 检查响应格式
        if (responseData.success && responseData.data) {
            return {
                code: 0,
                msg: '获取学生答题记录成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '获取学生答题记录失败',
                data: null
            };
        }
    } catch (error) {
        console.error('获取学生答题记录失败:', error);
        return {
            code: 1,
            msg: error.message || '获取学生答题记录失败',
            data: null
        };
    }
}

// 生成PPT的接口
export const generateKnowledgePointsPPT = async (params) => {
    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/knowledge-points-to-ppt/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(params)
        });

        const responseData = await response.json();
        console.log('生成PPT响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return responseData;
    } catch (error) {
        console.error('生成PPT失败:', error);
        return {
            code: -1,
            msg: error.message || '生成PPT失败'
        };
    }
};

// 获取课件列表
export async function getCoursewareList(params = {}) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取课件列表成功',
            data: {
                results: [
                    {
                        id: 1,
                        name: '第一章课件.pptx',
                        type: 'ppt',
                        size: 1024576,
                        course: '高等数学',
                        uploader: '张老师',
                        upload_time: new Date().toISOString(),
                        downloads: 25
                    }
                ],
                total: 1
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const queryString = new URLSearchParams(params).toString();
        const url = `${API_CONFIG.BASE_URL}/courseware/${queryString ? `?${queryString}` : ''}`;

        console.log('请求课件列表URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        const responseData = await response.json();
        console.log('获取课件列表响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        return {
            code: 0,
            msg: '获取课件列表成功',
            data: responseData.data
        };
    } catch (error) {
        console.error('获取课件列表失败:', error);
        return {
            code: 1,
            msg: error.message || '获取课件列表失败',
            data: null
        };
    }
}

// 获取用户权限
export async function getUserPermissions() {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取权限成功',
            data: {
                role: 'teacher',
                permissions: ['view_course', 'edit_course'],
                is_staff: true,
                is_superuser: false,
                is_authenticated: true
            }
        });
    }

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            return {
                code: 1,
                msg: '未登录',
                data: null
            };
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/users/my_permissions/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        const responseData = await response.json();
        console.log('获取用户权限响应:', responseData);

        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        if (responseData.success && responseData.status_code === 200) {
            // 保存权限信息到本地存储
            localStorage.setItem('userRole', responseData.data.role || '');
            localStorage.setItem('userPermissions', JSON.stringify(responseData.data.permissions || []));
            localStorage.setItem('isStaff', responseData.data.is_staff.toString());
            localStorage.setItem('isSuperuser', responseData.data.is_superuser.toString());
            localStorage.setItem('isAuthenticated', responseData.data.is_authenticated.toString());

            return {
                code: 0,
                msg: '获取权限成功',
                data: responseData.data
            };
        } else {
            return {
                code: 1,
                msg: responseData.message || '获取权限失败',
                data: null
            };
        }
    } catch (error) {
        console.error('获取用户权限失败:', error);
        return {
            code: 1,
            msg: error.message || '获取用户权限失败',
            data: null
        };
    }
}