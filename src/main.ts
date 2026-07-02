import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css'; // Ant Design Vue v4+ reset css
import './index.css';

const app = createApp(App);
app.use(router);
app.use(Antd);
app.mount('#root');
