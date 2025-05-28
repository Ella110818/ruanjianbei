# 智能教学实训平台前端项目结构

## 目录组织逻辑

项目采用 Vue3 的技术栈，使用组件化和模块化的开发方式。目录结构遵循职责分离原则，便于维护和扩展。

## 项目结构

```
fronted/                  # 项目根目录
├── src/                 # 源代码目录
│   ├── assets/         # 静态资源
│   │   ├── avatar.png  # 用户头像
│   │   ├── back3.png   # 背景图片
│   │   └── ppt.png     # AI助手界面图片
│   │
│   ├── components/     # 公共组件
│   │   ├── AdminHeader.vue      # 管理员端顶部导航
│   │   ├── AnimatedBackground.vue # 动态背景组件
│   │   ├── CourseCard2.vue      # 课程卡片组件
│   │   ├── CourseDetail.vue     # 课程详情组件
│   │   ├── HelloWorld.vue       # 示例组件
│   │   ├── StudentHeader.vue    # 学生端顶部导航
│   │   ├── TeacherAi.vue        # AI助手内容组件
│   │   ├── TeacherHeader.vue    # 教师端顶部导航
│   │   └── TeacherSidebar.vue   # 教师端侧边栏
│   │
│   ├── views/          # 页面视图
│   │   ├── LoginView.vue        # 登录页面
│   │   ├── HomeView.vue         # 首页
│   │   ├── Teacher/             # 教师端页面
│   │   │   ├── TeacherCourse.vue  # 课程管理
│   │   │   ├── TeacherManage.vue  # 学生管理
│   │   │   └── TeacherAi.vue      # AI助手页面
│   │   │
│   │   └── Student/             # 学生端页面
│   │       ├── AIAssistant.vue    # AI助手
│   │       └── StudentMain.vue     # 主页面
│   │
│   ├── router/         # 路由配置
│   │   └── index.js    # 路由定义
│   │
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
│
├── public/             # 公共资源目录
├── node_modules/       # 依赖包
├── dist/              # 构建输出目录
├── .eslintrc.js       # ESLint 配置
├── .gitignore         # Git 忽略文件
├── .browserslistrc    # 浏览器兼容配置
├── babel.config.js    # Babel 配置
├── jsconfig.json      # JS 配置
├── package.json       # 项目依赖配置
├── package-lock.json  # 依赖版本锁定文件
├── tsconfig.json      # TypeScript 配置
├── tsconfig.config.json # TypeScript 编译配置
├── vue.config.js      # Vue CLI 配置
├── fileStructure.md   # 项目结构说明文档
└── README.md          # 项目说明文档
```

## 主要功能模块说明

1. 教师模块：
   - 课程管理：课程内容管理和教学资源组织
   - 学生管理：学生信息维护和学习进度跟踪
   - AI备课助手：
     * 实时记录：语音转文字、发言识别、要点总结
     * 阅读助手：文档总结、思维导图、智能问答
     * PPT创作：一键生成课件、支持长文本处理

2. 学生模块：
   - AI助手：智能学习辅导
   - 课程学习：课程内容浏览和学习
   - 课程详情：具体课程的详细信息

## 组件说明

1. 布局组件：
   - AdminHeader：管理员端顶部导航栏
   - TeacherHeader：教师端顶部导航栏
   - StudentHeader：学生端顶部导航栏
   - TeacherSidebar：教师端侧边栏导航
   - AnimatedBackground：动态背景效果组件

2. 功能组件：
   - CourseCard2：课程展示卡片，包含课程图片和基本信息
   - CourseDetail：课程详情展示，包含课程信息、作业、考试等
   - TeacherAi：AI助手功能界面，提供多种智能辅助功能

## 路由结构

```
/                   # 重定向到登录页
/login              # 登录页面
/home               # 首页
/teacher            # 教师端（重定向到课程管理）
  ├── /course       # 课程管理
  ├── /manage       # 学生管理
  └── /ai           # AI备课助手
/student            # 学生端（重定向到AI助手）
  ├── /ai-assistant # AI学习助手
  └── /classroom    # 课程主页
/admin              # 管理员端
```

## 开发规范

1. 组件开发：
   - 组件文件使用大驼峰命名
   - 保持组件的单一职责
   - 合理使用 props 和 events 进行组件通信

2. 样式规范：
   - 使用 scoped 样式隔离
   - 统一使用 flex 和 grid 布局
   - 保持颜色和尺寸的一致性
   - 优先使用 SCSS 预处理器

3. 路由管理：
   - 使用懒加载优化性能
   - 合理使用路由守卫进行权限控制
   - 保持路由结构清晰

4. 代码规范：
   - 使用 ESLint 进行代码检查
   - 遵循 Vue3 组合式 API 的最佳实践
   - 保持代码注释的完整性和清晰性 