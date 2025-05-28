// 环境配置
const ENV = {
    development: {
        API_URL: 'https://dariajane.pythonanywhere.com',
        FRONT_URL: 'http://localhost:8080'
    },
    production: {
        API_URL: 'https://dariajane.pythonanywhere.com',
        FRONT_URL: 'https://glowing-sunburst-d86f36.netlify.app'
    }
};

// 获取当前环境
function getEnvironment() {
    return process.env.NODE_ENV || 'development';
}

// 获取基础URL
function getBaseUrl() {
    const env = getEnvironment();
    return ENV[env].API_URL;
}

// 获取前端URL
function getFrontUrl() {
    const env = getEnvironment();
    return ENV[env].FRONT_URL;
}

// 基础URL配置
const BASE_URL = getBaseUrl();

// 只用localStorage控制环境
function getMockFlag() {
    return localStorage.getItem('USE_MOCK') === 'true';
}

// 登录接口
export async function login(username, password) {
    if (getMockFlag()) {
        // 本地测试模式
        if ((username === '11' || username === '11') && password === '22') {
            return Promise.resolve({
                code: 0,
                msg: '登录成功',
                data: {
                    name: '教师',
                    role: 'teacher',
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
            const response = await fetch(`${BASE_URL}/api/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': getFrontUrl() // 添加源站点信息
                },
                credentials: 'include', // 支持跨域携带cookie
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            // 根据后端返回的数据结构处理响应
            if (response.ok) {
                // 保存token到localStorage
                if (data.access) {
                    localStorage.setItem('token', data.access);
                }
                if (data.refresh) {
                    localStorage.setItem('refreshToken', data.refresh);
                }

                return {
                    code: 0,
                    msg: '登录成功',
                    data: {
                        token: data.access,
                        refreshToken: data.refresh,
                        user: data.user
                    }
                };
            } else {
                return {
                    code: 1,
                    msg: data.message || '登录失败',
                    data: null
                };
            }
        } catch (error) {
            console.error('登录请求失败:', error);
            return {
                code: 1,
                msg: '网络错误，请稍后重试',
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
                    'Content-Type': 'application/json',
                    'Origin': getFrontUrl()
                },
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('获取用户信息失败:', error);
            throw error;
        }
    }
}

// 刷新token的函数
export async function refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': getFrontUrl()
            },
            credentials: 'include',
            body: JSON.stringify({
                refresh: refreshToken
            })
        });

        const data = await response.json();
        if (response.ok && data.access) {
            localStorage.setItem('token', data.access);
            return data.access;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        console.error('Token刷新失败:', error);
        throw error;
    }
}

// 你可以继续添加其他接口方法，按需mock或真实请求
