<template>
    <div class="home-wrap">
        <div class="head-wrap">
            <h3 class="title">时空穿越</h3>
            <p class="desc">世界那么大，我想去看看！那些曾经走过路，留下的记忆，都弥足珍贵……</p>
        </div>
        <div class="content-wrap">
            <Carousel3DModule />
        </div>
        <div class="foot-wrap">
            <button class="btn" @click="login">开始穿越</button>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, setValue, getValue, createMsg } from '../util/ADS';
import {  } from '../util/api';
import Carousel3DModule from '../components/Carousel3DModule.vue';

export default {
    components: {
        Carousel3DModule, 
    },
    name: 'home',
    props: ['id'],
    setup(props, context) {
        const { token, origin } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        onMounted(() => {
            const TOKEN = getQueryVariable('token');
            navigator.mediaDevices.getUserMedia({ 
                audio: false, 
                video: true
            }).then(stream => {
                
            }).catch(err => {
                console.log('error: ' + err.message);
            });
        });

        const openLogin = () =>{
            window.open(
                `https://account.qingtime.cn?apphigh=26&logo=https://cdn.qingtime.cn/supplierSystem.svg&redirect=${origin.value}`,
                "new",
                `width=360, height=560, resizable=false, toolbar=no, menubar=no, location=no, status=no, top=${
                (screen.height - 560) / 2
                }, left=${(screen.width - 360) / 2}`
            );
        }

        const login = () => {
            if(token.value){
                router.push('/TakeCamera');
            }else{
                router.push('/TakeCamera');
                // openLogin();
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
            login, token, close,
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
    background: #fff;
    background-size: cover;
}
.head-wrap{
    position: relative;
    width: 100%;
    text-align: center;
    .title{
        font-size: 74px;
        color: #87B940;
        line-height: 103px;
        padding: 112px 0 36px 0;
    }
    .desc{
        padding-bottom: 60px;
    }
}
.content-wrap{
    position: relative;
    width: 100%;
    height: calc(100% - 592px);
}
.foot-wrap{
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .btn{
        margin: 58px 0 109px 0;
    }
}
</style>