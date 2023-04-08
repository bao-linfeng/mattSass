<template>
    <div class="home-wrap">
        <adaiCarousel />
        <div class="head-wrap">
            <img class="icon" src="../assets/camera.svg" alt="">
            <h3 class="title">时空穿越</h3>
        </div>
        <div class="content-wrap" @click="login(token && role === 0 ? true : false)">
            <img class="icon" src="../assets/camera.svg" alt="">
            <h3 class="title">{{siteName}}</h3>
            <i v-show="(token && role === 0)" class="margin20 title">|</i>
            <h3 v-show="(token && role === 0)" class="title active">{{token && role === 0 ? '开始穿越' : '立即登录'}}</h3>
        </div>
        <div class="foot-wrap">
            <button v-show="!(token && role === 0)" class="btn" @click="login">{{token && role === 0 ? '开始穿越' : '立即登录'}}</button>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, setValue, getValue, createMsg } from '../util/ADS';
import { user, site } from '../util/api';
import AdaiCarousel from '../components/AdaiCarousel.vue';

export default {
    components: {
        AdaiCarousel,
    },
    name: 'home',
    props: ['id'],
    setup(props, context) {
        const { token, origin, siteKey, role, siteName } = toRefs(useState());
        const router = useRouter();
        const id = props.id;


        const getUserInfo = async (t) => {
            changePropertyValue('isLoading', true);
            const result = await user.getUserInfo(t);
            changePropertyValue('isLoading', false);
            if(result.statusCode == 200){
                let data = result.result;
                changePropertyValue('token', t);
                changePropertyValue('userKey', data._key);
                changePropertyValue('userName', data.profile.trueName || data.profile.nickName);
                changePropertyValue('profile', data.profile);
                changePropertyValue('avatar', data.profile.avatar || '');

                setValue('token', t);
                setValue('userKey', data._key);
                setValue('userName', data.profile.trueName || data.profile.nickName);
                setValue('profile', JSON.stringify(data.profile));
                setValue('avatar', data.profile.avatar || '');

                getSiteDetail(t);
            }else{
                createMsg(result.msg);
            }
        }

        const getSiteDetail = async (token) => {
            changePropertyValue('isLoading', true);
            const result = await site.getSiteDetail(token, siteKey.value);
            changePropertyValue('isLoading', false);
            if(result.status == 200){
                changePropertyValue('role', result.data.role);
                setValue('role', result.data.role);
                changePropertyValue('siteName', result.data.name);
                setValue('siteName', result.data.name);
                if(role.value === 0){
                    
                }else{
                    createMsg('您无权限使用该微站！');
                }
            }else{
                createMsg(result.msg);
            }
        }

        onMounted(() => {
            const TOKEN = getQueryVariable('token');
            const SITEKEY = getQueryVariable('siteKey');
            if(SITEKEY){
                changePropertyValue('siteKey', SITEKEY);
                setValue('siteKey', SITEKEY);
            }
            if(TOKEN){
                getUserInfo(TOKEN);
            }
            // 初始化相机
            // navigator.mediaDevices.getUserMedia({ 
            //     audio: false, 
            //     video: true
            // }).then(stream => {
                
            // }).catch(err => {
            //     console.log('error: ' + err.message);
            // });
        });

        const openLogin = () =>{
            window.open(
                `https://account.qingtime.cn?apphigh=66&app=66&logo=https://skcysass.qingtime.cn/camera.svg&redirect=${origin.value}`,
                "new",
                `width=360, height=560, resizable=false, toolbar=no, menubar=no, location=no, status=no, top=${
                (screen.height - 560) / 2
                }, left=${(screen.width - 360) / 2}`
            );
        }

        const login = (f = true) => {
            if(!f){
                return;
            }
            if(token.value && role.value === 0){
                router.push('/TakeCamera');
            }else{
                openLogin();
            }
        }

        const close = () => {
            changePropertyValue('token', '');
            changePropertyValue('userKey', '');
            changePropertyValue('userName', '');
            changePropertyValue('profile', '');
            changePropertyValue('avatar', '');
            window.localStorage.clear();
        };

        return {
            login, token, close, role, siteName, 
        }
    }
}
</script>

<style lang="scss" scoped>
.home-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    color: #999;
    font-size: 24px;
    text-align: center;
    background: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}
.head-wrap{
    position: absolute;
    top: 42px;
    left: 54px;
    display: flex;
    align-items: center;
    cursor: pointer;
    z-index: 10;
    .icon{
        margin-right: 16px;
        height: 34px;
    }
    .title{
        font-size: 32px;
        color: #87B940;
    }
}
.content-wrap{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 194px;
    opacity: 0.56;
    background: #000000;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    cursor: pointer;
    .icon{
        margin-right: 18px;
        height: 70px;
    }
    .title{
        font-size: 64px;
        color: #87B940;
    }
    .margin20{
        margin: 0 20px;
    }
}
.foot-wrap{
    position: absolute;
    top: 58px;
    right: -40px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}
</style>