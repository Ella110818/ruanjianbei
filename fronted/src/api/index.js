// 环境配置
const ENV = {
    development: {
        API_URL: 'http://localhost:8000',  // 本地开发服务器地址
        API_VERSION: 'api'
    },
    production: {
        API_URL: 'https://9a3173bc2b72.ngrok-free.app',  // 更新为新的ngrok地址
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
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
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

    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            console.log('准备刷新token，当前refresh token状态:', refreshToken ? '存在' : '不存在');

            if (!refreshToken) {
                console.error('没有可用的Refresh Token');
                return null;
            }

            // 先尝试获取新token
            const tokenUrl = `${API_CONFIG.BASE_URL}/token/`;
            console.log('尝试获取新token');

            const tokenResponse = await fetch(tokenUrl, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ refresh: refreshToken })
            });

            const tokenData = await tokenResponse.json();
            console.log('获取新token响应:', tokenData);

            if (tokenResponse.ok && tokenData.success && tokenData.data) {
                const { access, refresh } = tokenData.data;
                if (access && refresh) {
                    this.setTokens(access, refresh);
                    return access;
                }
            }

            // 如果获取新token失败，尝试刷新token
            const refreshUrl = `${API_CONFIG.BASE_URL}/token/refresh/`;
            console.log('尝试刷新token');

            const response = await fetch(refreshUrl, {
                method: 'POST',
                headers: {
                    ...API_CONFIG.headers,
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ refresh: refreshToken })
            });

            const responseData = await response.json();
            console.log('刷新token响应:', responseData);

            if (response.ok && responseData.access) {
                this.setAccessToken(responseData.access);
                return responseData.access;
            }

            if (response.status === 401) {
                console.error('Refresh Token已失效，需要重新登录');
                this.clearTokens();
                window.location.href = '/login';
            } else {
                console.error('刷新Token失败:', responseData);
            }
            return null;
        } catch (error) {
            console.error('刷新Token过程出错:', error);
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
        try {
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

            // 检查响应是否成功
            if (responseData.success && responseData.status_code === 200 && responseData.data) {
                const { access, refresh, user } = responseData.data;
                console.log('登录成功，获取到tokens:', {
                    accessToken: access ? '存在' : '不存在',
                    refreshToken: refresh ? '存在' : '不存在',
                    user: user ? '存在' : '不存在'
                });

                // 验证并保存token
                if (TokenManager.isValidToken(access) && TokenManager.isValidToken(refresh)) {
                    // 先清除旧数据
                    TokenManager.clearTokens();

                    // 保存新token
                    TokenManager.setTokens(access, refresh);

                    // 保存用户信息
                    const userInfo = {
                        ...user,
                        role
                    };
                    localStorage.setItem('user', JSON.stringify(userInfo));

                    // 获取用户权限
                    try {
                        // 使用新的access token获取权限
                        const permissionsUrl = `${API_CONFIG.BASE_URL}/users/my_permissions/`;
                        const permissionsResponse = await fetch(permissionsUrl, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${access}`,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'ngrok-skip-browser-warning': 'true'
                            }
                        });

                        if (!permissionsResponse.ok) {
                            throw new Error(`获取权限失败: ${permissionsResponse.status}`);
                        }

                        const permissionsData = await permissionsResponse.json();
                        console.log('权限数据:', permissionsData);

                        if (permissionsData.success && permissionsData.status_code === 200) {
                            const data = permissionsData.data;

                            // 保存权限信息
                            localStorage.setItem('userRole', data.role || '');
                            localStorage.setItem('isStaff', String(data.is_staff || false));
                            localStorage.setItem('isSuperuser', String(data.is_superuser || false));
                            localStorage.setItem('userPermissions', JSON.stringify({
                                permissions: Array.isArray(data.permissions) ? data.permissions : []
                            }));
                        }
                    } catch (error) {
                        console.error('获取权限失败:', error);
                        // 设置默认权限
                        localStorage.setItem('userPermissions', JSON.stringify({
                            permissions: []
                        }));
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
                    console.error('Token格式无效');
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

            if (response.ok && data.access) {
                TokenManager.setTokens(data.access, refreshToken);
                return data.access;
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
async function handleRequest(url, options = {}) {
    try {
        // 检查并刷新token
        const tokenValid = await TokenManager.refreshTokenIfNeeded();
        if (!tokenValid) {
            console.log('Token无效或刷新失败，重定向到登录页');
            window.location.href = '/login';
            return {
                code: 1,
                msg: '登录已过期，请重新登录',
                data: null
            };
        }

        const token = TokenManager.getAccessToken();
        const finalOptions = {
            ...API_CONFIG.fetchOptions,
            ...options,
            headers: {
                ...API_CONFIG.headers,
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
                ...(options.headers || {})
            }
        };

        console.log('发送请求:', url);
        console.log('请求配置:', finalOptions);

        const response = await fetch(url, finalOptions);

        // 添加详细的响应日志
        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

        // 获取原始响应文本
        const responseText = await response.text();
        console.log('API Raw Response:', responseText);

        // 尝试解析JSON
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            console.log('Non-JSON Response Content:', responseText);
            throw new Error('服务器返回了非JSON格式的数据');
        }

        if (!response.ok) {
            // 如果是401或403，可能是token过期
            if (response.status === 401 || response.status === 403) {
                console.log('收到401/403响应，尝试刷新token');
                const tokenRefreshed = await TokenManager.refreshTokenIfNeeded();
                if (tokenRefreshed) {
                    console.log('Token已刷新，重试请求');
                    return handleRequest(url, options);
                }
            }
            return handleHttpError(response, responseData);
        }

        return responseData;
    } catch (error) {
        console.error('Request Error:', error);
        console.log('Request URL:', url);
        console.log('Request Options:', options);

        return {
            code: 1,
            msg: error.message || '请求失败',
            data: null
        };
    }
}

// 获取课程列表
export async function getCourseList(params = {}) {
    if (getMockFlag()) {
        return mockApiResponse(mockCourseList);
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
        const url = `${API_CONFIG.BASE_URL}/courses/${queryString ? `?${queryString}` : ''}`;

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
                    const newToken = await refreshToken();
                    if (newToken) {
                        // 使用新token重试请求
                        return await getCourseList(params);
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
            msg: '获取课程列表成功',
            data: data.data || []
        };
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
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
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
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
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

// 获取用户权限列表
export async function getRolePermissions() {
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

    try {
        const token = TokenManager.getAccessToken();
        if (!token) {
            return {
                code: 1,
                msg: '请先登录',
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

        // 检查Content-Type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('服务器返回了非JSON格式的数据');
        }

        const responseData = await response.json();

        if (!response.ok) {
            const errorText = await response.text();
            console.error('获取角色权限详细错误:', {
                status: response.status,
                statusText: response.statusText,
                errorBody: errorText
            });

            if (response.status === 403) {
                return {
                    code: 1,
                    msg: '没有权限访问',
                    data: null
                };
            }
            if (response.status === 500) {
                return {
                    code: 1,
                    msg: `服务器内部错误: ${errorText}`,
                    data: null
                };
            }
            return handleHttpError(response, responseData);
        }

        // 验证权限数据格式
        if (!responseData || !Array.isArray(responseData.permissions)) {
            return {
                code: 1,
                msg: '权限数据格式不正确',
                data: null
            };
        }

        return {
            code: 0,
            msg: '获取角色权限成功',
            data: responseData
        };
    } catch (error) {
        console.error('获取权限失败:', error);
        return {
            code: 1,
            msg: error.message || '获取权限失败',
            data: null
        };
    }
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
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
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
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
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

// 获取用户列表
export async function getUserList(params = {}) {
    const retryCount = 3; // 最大重试次数
    let attempt = 0;

    while (attempt < retryCount) {
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
            const url = `${API_CONFIG.BASE_URL}/users/${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    ...API_CONFIG.headers,
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // 处理数据，添加默认值和格式化
                const processedResults = data.data.results.map(user => ({
                    ...user,
                    email: user.email || '未设置',
                    first_name: user.first_name || '未设置',
                    last_name: user.last_name || '未设置',
                    created_at: new Date(user.created_at).toLocaleString('zh-CN')
                }));

                return {
                    code: 0,
                    msg: '获取用户列表成功',
                    data: {
                        ...data.data,
                        results: processedResults
                    }
                };
            } else {
                throw new Error(data.message || '获取用户列表失败');
            }
        } catch (error) {
            attempt++;
            if (attempt === retryCount) {
                return {
                    code: 1,
                    msg: `获取用户列表失败: ${error.message}`,
                    data: null
                };
            }
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

// 获取指定用户信息
export async function getUserById(userId) {
    if (getMockFlag()) {
        return mockApiResponse({
            id: userId,
            username: 'mock_user',
            email: 'mock@example.com',
            first_name: '',
            last_name: '',
            role: 'admin',
            created_at: new Date().toISOString()
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

        const url = `${API_CONFIG.BASE_URL}/users/${userId}/`;
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
        console.log('获取用户信息响应:', responseData);

        if (responseData.success && responseData.status_code === 200) {
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
        console.error('获取用户信息错误:', error);
        return {
            code: 1,
            msg: error.message || '获取用户信息失败',
            data: null
        };
    }
}

// 验证用户数据
function validateUserData(userData) {
    const errors = [];

    // 验证用户名
    if (!userData.username || userData.username.length < 3) {
        errors.push('用户名至少需要3个字符');
    }

    // 验证邮箱格式
    if (userData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.push('邮箱格式不正确');
        }
    }

    // 教师角色特殊验证
    if (userData.role === 'teacher') {
        if (!userData.first_name || !userData.last_name) {
            errors.push('教师用户必须填写姓名');
        }
    }

    return errors;
}

export async function createUser(userData) {
    // 数据验证
    const validationErrors = validateUserData(userData);
    if (validationErrors.length > 0) {
        return {
            code: 1,
            msg: validationErrors.join('; '),
            data: null
        };
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

        const response = await fetch(`${API_CONFIG.BASE_URL}/users/`, {
            method: 'POST',
            headers: {
                ...API_CONFIG.headers,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return {
                code: 0,
                msg: '创建用户成功',
                data: data.data
            };
        } else {
            throw new Error(data.message || '创建用户失败');
        }
    } catch (error) {
        return {
            code: 1,
            msg: `创建用户失败: ${error.message}`,
            data: null
        };
    }
}

export async function updateUser(username, userData) {
    // 数据验证
    const validationErrors = validateUserData(userData);
    if (validationErrors.length > 0) {
        return {
            code: 1,
            msg: validationErrors.join('; '),
            data: null
        };
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

        const response = await fetch(`${API_CONFIG.BASE_URL}/users/${username}/`, {
            method: 'PUT',
            headers: {
                ...API_CONFIG.headers,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return {
                code: 0,
                msg: '更新用户成功',
                data: data.data
            };
        } else {
            throw new Error(data.message || '更新用户失败');
        }
    } catch (error) {
        return {
            code: 1,
            msg: `更新用户失败: ${error.message}`,
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

// 切换用户状态
export async function toggleUserStatus(username) {
    if (getMockFlag()) {
        return mockApiResponse({ success: true });
    }

    const url = `${API_CONFIG.BASE_URL}/users/${username}/toggle-status/`;
    return handleRequest(url, {
        method: 'POST'
    });
}

// 获取当前用户信息
export async function getCurrentUser(retryCount = 0) {
    const MAX_RETRIES = 2;

    if (getMockFlag()) {
        const userInfo = getUserInfo();
        if (!userInfo) {
            return {
                code: 1,
                msg: '未登录',
                data: null
            };
        }
        return mockApiResponse({
            id: 1,
            username: userInfo.username,
            name: userInfo.name,
            email: userInfo.email,
            role: userInfo.role,
            avatar: userInfo.avatar,
            department: userInfo.department,
            position: userInfo.position,
            phone: userInfo.phone,
            lastLogin: new Date().toISOString()
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

        const url = `${API_CONFIG.BASE_URL}/users/me/`;
        console.log(`尝试获取用户信息 (重试次数: ${retryCount})`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        // 获取响应文本
        const responseText = await response.text();
        console.log('用户信息原始响应:', responseText);

        // 尝试解析JSON
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            console.error('响应解析失败:', e);
            throw new Error('服务器返回了非JSON格式的数据');
        }

        // 处理401/403错误
        if ((response.status === 401 || response.status === 403) && retryCount < MAX_RETRIES) {
            console.log(`收到${response.status}响应，尝试刷新token`);
            const tokenRefreshed = await TokenManager.refreshTokenIfNeeded();
            if (tokenRefreshed) {
                console.log('Token已刷新，重试请求');
                return getCurrentUser(retryCount + 1);
            } else {
                console.log('Token刷新失败，需要重新登录');
                TokenManager.clearTokens();
                return {
                    code: 1,
                    msg: '登录已过期，请重新登录',
                    data: null
                };
            }
        }

        // 处理其他错误
        if (!response.ok) {
            return handleHttpError(response, responseData);
        }

        // 验证响应数据
        if (responseData.success && responseData.status_code === 200) {
            if (!responseData.data || !responseData.data.username) {
                console.error('用户数据不完整:', responseData.data);
                return {
                    code: 1,
                    msg: '获取用户信息失败：用户数据不完整',
                    data: null
                };
            }
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
        console.error('获取用户信息错误:', error);
        // 如果是网络错误且未超过重试次数，则重试
        if (error.name === 'TypeError' && retryCount < MAX_RETRIES) {
            console.log('网络错误，准备重试');
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return getCurrentUser(retryCount + 1);
        }
        return {
            code: 1,
            msg: error.message || '获取用户信息失败',
            data: null
        };
    }
}

// 获取我的课程列表
export async function getMyCourses(params = {}) {
    if (getMockFlag()) {
        return mockApiResponse({
            code: 0,
            msg: '获取我的课程列表成功',
            data: {
                count: 3,
                results: [
                    {
                        id: 1,
                        name: '高等数学',
                        location: '教学楼A 101'
                    },
                    {
                        id: 2,
                        name: '大学物理',
                        location: '教学楼B 202'
                    },
                    {
                        id: 3,
                        name: '程序设计',
                        location: '实验楼 304'
                    }
                ]
            }
        });
    }

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
        try {
            // 1. 获取并验证 token
            const token = TokenManager.getAccessToken();
            console.log('当前 Token 状态:', {
                exists: !!token,
                length: token ? token.length : 0,
                preview: token ? `${token.substring(0, 10)}...` : 'none'
            });

            if (!token) {
                throw new Error('请先登录');
            }

            // 2. 检查 token 有效性
            const isTokenValid = await TokenManager.refreshTokenIfNeeded();
            console.log('Token 有效性检查结果:', isTokenValid);

            if (!isTokenValid) {
                throw new Error('Token 已过期或无效');
            }

            // 3. 构建查询参数
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.ordering) queryParams.append('ordering', params.ordering);
            if (params.page) queryParams.append('page', params.page);

            const url = `${API_CONFIG.BASE_URL}/courses/my_courses/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            console.log('获取我的课程列表请求URL:', url);

            // 4. 构建请求头
            const headers = {
                ...API_CONFIG.headers,
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            };
            console.log('请求头信息:', headers);

            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            // 5. 获取响应数据
            const responseText = await response.text();
            console.log('原始响应内容:', responseText);

            let responseData;
            try {
                responseData = JSON.parse(responseText);
                console.log('我的课程列表响应数据:', responseData);
            } catch (e) {
                console.error('JSON解析错误:', e);
                console.log('非JSON响应内容:', responseText);

                // 如果是HTML响应，可能是临时性问题，尝试重试
                if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
                    console.log('收到HTML响应，准备重试');
                    retryCount++;
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // 递增延迟
                    continue;
                }

                throw new Error('服务器返回了非JSON格式的数据');
            }

            if (!response.ok) {
                console.error('请求失败详情:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: responseData
                });

                if (response.status === 403) {
                    // 如果是认证问题，尝试刷新token
                    const refreshed = await TokenManager.refreshTokenIfNeeded();
                    if (refreshed) {
                        console.log('Token已刷新，重试请求');
                        retryCount++;
                        continue;
                    }
                    throw new Error('没有权限，请确保已登录');
                }

                // 如果是其他错误，直接返回错误信息
                return handleHttpError(response, responseData);
            }

            return {
                code: 0,
                msg: '获取我的课程列表成功',
                data: responseData
            };
        } catch (error) {
            console.error('获取我的课程列表失败:', error);

            // 如果已经重试了最大次数，则返回错误
            if (retryCount >= maxRetries - 1) {
                return {
                    code: 1,
                    msg: error.message || '网络错误，请稍后重试',
                    data: null
                };
            }

            // 否则继续重试
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
    }

    return {
        code: 1,
        msg: '多次请求失败，请稍后重试',
        data: null
    };
}

// 你可以继续添加其他接口方法，按需mock或真实请求

