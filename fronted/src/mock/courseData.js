// 课程列表数据
export const mockCourses = [
    {
        id: 1,
        name: '计算机组成原理',
        description: '本课程主要介绍计算机系统的基本组成和工作原理',
        grade_level: '大二',
        subject: '计算机科学',
        teacher: '张教授',
        img: require('@/assets/course1.jpg'),
        class_count: 2,
        student_count: 35,
        created_at: '2024-03-01T00:00:00Z',
        updated_at: '2024-03-01T00:00:00Z'
    },
    {
        id: 2,
        name: '数据结构',
        description: '介绍基本数据结构和算法设计',
        grade_level: '大一',
        subject: '计算机科学',
        teacher: '李教授',
        img: require('@/assets/course2.jpg'),
        class_count: 1,
        student_count: 30,
        created_at: '2024-03-01T00:00:00Z',
        updated_at: '2024-03-01T00:00:00Z'
    }
];

// 课程详情数据
export const mockCourseDetail = {
    announcements: [
        {
            id: 'ann1',
            title: '关于期中考试的通知',
            content: '期中考试将于下周三进行，请同学们做好准备。',
            date: '2024-03-15'
        }
    ],
    assignments: [
        {
            id: 'hw1',
            type: 'homework',
            title: '第一次作业',
            description: '完成第一章课后习题，并提交详细解答步骤。',
            startTime: '2024-03-10 08:00',
            endTime: '2024-03-20 23:59',
            fullScore: 100,
            submittedCount: 25,
            totalStudents: 35,
            status: '进行中'
        },
        {
            id: 'hw2',
            type: 'homework',
            title: '第二次作业',
            description: '设计一个简单的CPU模型并提交设计报告。',
            startTime: '2024-03-05 08:00',
            endTime: '2024-03-15 23:59',
            fullScore: 100,
            submittedCount: 30,
            totalStudents: 35,
            status: '已截止'
        },
        {
            id: 'exam1',
            type: 'exam',
            title: '期中考试',
            description: '闭卷考试，内容覆盖前五章。请携带学生证。',
            startTime: '2024-03-20 14:00',
            endTime: '2024-03-20 16:00',
            fullScore: 100,
            submittedCount: 32,
            totalStudents: 35,
            status: '已截止',
            duration: '120分钟',
            location: '理科楼301'
        }
    ],
    resources: [
        {
            id: 'res1',
            title: '课程教材',
            type: 'PDF',
            description: '主要教材电子版',
            uploadTime: '2024-03-01'
        },
        {
            id: 'res2',
            title: '课程PPT',
            type: 'PPT',
            description: '课程讲义和演示文稿',
            uploadTime: '2024-03-05'
        }
    ],
    grades: [
        {
            index: 1,
            name: '张三',
            studentId: '2021001',
            classScore: 25,
            homeworkScore: 18,
            examScore: 45,
            totalScore: 88
        }
        // ... 可以添加更多成绩数据
    ]
};

// Mock API 响应
export const mockApiResponse = (data, message = '操作成功') => {
    return {
        code: 0,
        msg: message,
        data: data
    };
}; 