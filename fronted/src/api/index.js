// 环境配置
const ENV = {
    development: {
        API_URL: 'https://dariajane.pythonanywhere.com'
    },
    production: {
        API_URL: 'https://dariajane.pythonanywhere.com'
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
                    'Accept': 'application/json'
                },
                mode: 'cors', // 明确指定跨域模式
                credentials: 'omit', // 不发送cookies
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

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
                },
                mode: 'cors',
                credentials: 'omit'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
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
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify({
                refresh: refreshToken
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.access) {
            localStorage.setItem('token', data.access);
            return data.access;
        } else {
            throw new Error('No access token in response');
        }
    } catch (error) {
        console.error('Token刷新失败:', error);
        throw error;
    }
}

// 你可以继续添加其他接口方法，按需mock或真实请求
