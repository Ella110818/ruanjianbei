import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import dataV from '@kjgl77/datav-vue3'

const app = createApp(App)

app.use(store)
app.use(router)
app.use(ElementPlus)
app.use(dataV)
app.mount('#app')

// 处理 ResizeObserver 错误
const resizeHandler = () => {
    const resizeObserverError = 'ResizeObserver loop completed with undelivered notifications.';
    window.addEventListener('error', (e) => {
        if (e.message === resizeObserverError) {
            e.stopImmediatePropagation();
        }
    });
};

resizeHandler();
