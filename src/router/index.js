import { createRouter, createWebHistory } from 'vue-router'
import { stringifyQuery, parseQuery } from "./query";

const BootPage = () => import('../pages/BootPage.vue');
const Home = () => import('../pages/Home.vue');
const TakeCamera = () => import('../pages/TakeCamera.vue');
const Share = () => import('../pages/Share.vue');
const Card = () => import('../pages/Card.vue');

const routes = [
    { 
        path: '/', 
        name: 'Home',
        component: Home,
        props: true,
    },
    { 
        path: '/TakeCamera', 
        name: 'TakeCamera',
        component: TakeCamera,
        props: true,
    },
    { 
        path: '/Share', 
        name: 'Share',
        component: Share,
        props: true,
    },
    { 
        path: '/Card', 
        name: 'Card',
        component: Card,
        props: true,
    },
]

const router = createRouter({
    history: createWebHistory(),
    // stringifyQuery: stringifyQuery,
    // parseQuery: parseQuery,
    routes
});

// router.beforeEach((to, from, next) => {
//     console.log(to);
//     if(to.meta.requireAuth){  // 判断该路由是否需要登录权限
//         if (window.localStorage.getItem('token') && window.localStorage.getItem('role') > -1) {  // 通过vuex state获取当前的token是否存在
//             next();
//         }else {
//             next({
//                 path: ('/'),// query: {redirect: to.fullPath}  // 将跳转的路由path作为参数，登录成功后跳转到该路由
//             })
//         }
//     }else {
//         next();
//     }
// })

export default router