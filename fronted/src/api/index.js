// 只用localStorage控制环境
function getMockFlag() {
    return localStorage.getItem('USE_MOCK') === 'true';
}

// 示例接口：获取用户信息
export function getUserInfo() {
    if (getMockFlag()) {
        return Promise.resolve({
            name: '本地测试用户',
            role: 'teacher',
            id: 1
        });
    } else {
        return fetch('/api/user/info').then(res => res.json());
    }
}

// 新增mock登录接口
export function login(account, password) {
    if (getMockFlag()) {
        if ((account === '11' || account === '11') && password === '22') {
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
        return fetch('/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ account, password })
        }).then(res => res.json());
    }
}

// 你可以继续添加其他接口方法，按需mock或真实请求
