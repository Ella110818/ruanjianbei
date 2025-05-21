# 智能教学实训平台前端项目结构

## 目录组织逻辑

项目采用 Vue3 + Element Plus + TypeScript 的技术栈，使用组件化和模块化的开发方式。目录结构遵循职责分离原则，便于维护和扩展。

## 项目结构

```
front-end/                 # 项目根目录
├── src/                  # 源代码目录
│   ├── assets/          # 静态资源
│   │   ├── images/      # 图片资源
│   │
│   ├── components/      # 公共组件
│   ├── views/          # 页面视图
│   │   ├── teacher/    # 教师端页面
│   │   ├── student/    # 学生端页面
│   │   └── admin/      # 管理端页面
│   │
│   ├── router/         # 路由配置
│   │   └── index.ts    # 路由主文件
│   │
│   ├── stores/         # Pinia状态管理
│   │   └── index.ts    # 状态管理主文件
│   │
│   ├── env.d.ts        # 类型声明文件
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
│
├── public/             # 公共资源目录
├── e2e/               # 端到端测试目录
├── .vscode/           # VSCode配置
├── index.html         # HTML入口文件
├── vite.config.ts     # Vite配置文件
├── tsconfig.json      # TypeScript配置
├── tsconfig.app.json  # 应用TypeScript配置
├── tsconfig.node.json # Node TypeScript配置
├── .prettierrc.json   # Prettier配置
├── .gitignore         # Git忽略文件
└── package.json       # 项目依赖配置

## 命名约定

1. 文件命名：
   - 组件文件：使用大驼峰命名法，如 `HeaderNav.vue`
   - 工具类文件：使用小驼峰命名法，如 `authUtils.ts`
   - 样式文件：使用连字符命名法，如 `common-style.scss`
   - TypeScript文件：使用小驼峰命名法，如 `userStore.ts`

2. 组件命名：
   - 组件名使用大驼峰命名法
   - 基础组件以 `Base` 开头，如 `BaseButton.vue`
   - 页面组件以功能命名，如 `LessonPrep.vue`

3. 变量命名：
   - 变量使用小驼峰命名法
   - 常量使用大写下划线命名法
   - 接口名使用大驼峰命名法并以 I 开头，如 `IUserState`
   - 类型名使用大驼峰命名法并以 T 开头，如 `TUserInfo`

4. CSS类命名：
   - 使用 BEM 命名规范
   - 模块名__元素名--修饰符名

## 主要功能模块说明

1. 教师模块 (`views/Teacher/`)：
   - 备课设计：智能生成教学内容和课程设计
   - 考核管理：自动生成试题和评分标准
   - 学情分析：学生数据可视化和教学建议

2. 学生模块 (`views/Student/`)：
   - 在线学习：智能问答和学习指导
   - 练习系统：自适应练习和即时反馈

3. 管理模块 (`views/Admin/`)：
   - 用户管理：用户信息维护
   - 资源管理：课程资源统一管理
   - 数据大屏：教学数据实时监控

## 开发规范

1. 代码规范：
   - 使用 ESLint 进行代码检查
   - 使用 Prettier 进行代码格式化
   - 遵循 TypeScript 严格模式

2. 组件开发：
   - 使用 Composition API
   - 组件属性类型声明
   - 组件事件类型声明

3. 状态管理：
   - 使用 Pinia 进行状态管理
   - 模块化的状态设计
   - TypeScript 类型支持

4. 测试规范：
   - 单元测试：使用 Vitest
   - E2E测试：使用 Playwright
   - 测试覆盖率要求 