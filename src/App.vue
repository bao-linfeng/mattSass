<template>
  <div class="app-box">
	  <Loading v-if="isLoading" />
    <router-view></router-view>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, inject, toRefs } from 'vue'
import { useState, changePropertyValue } from './store';
import { createMsg, getValue } from './util/ADS';
import Loading from './components/Loading.vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  components: {
    Loading
  },
  setup(props, context) {
    const route = useRoute();
    const { navActive, isLoading } = toRefs(useState());

    const initSocketIO = () => {
      const socket = inject('socket');

      socket.on("disconnect", (reason) => {
        console.log(reason);
        if (reason === "io server disconnect") {
          socket.connect();
        }
      });
      
      socket.on("connect_error", (error) => {
        console.log(error);
      });
    }
  
    onMounted(() => {
      // 统一登录消息接收
      window.addEventListener("message", (e) => {
        if (
          e.origin === "https://account.qingtime.cn" &&
          e.data.eventName === "redirect"
        ) {
          window.location.href = e.data.data;
        }
      }, false);

      document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
          event.preventDefault()
        }
      },{ passive: false, capture: false });
    });

    watch(() => route, (to, from) => {
      console.log(to.path);
      changePropertyValue('navActive', to.path);
    },{deep: true});

    return {
      state: useState(), navActive, isLoading, 
    }
  }
}
</script>

<style>
/* 阴影下伪类上显示before after */
*{
	padding:0;
	margin:0;
}
html{
  position: relative;
  width: 100%;
	height: 100%;
  font-family: 'PingFang SC','Source Han Sans CN','Microsoft Yahei';
	font-size: 14px;
  color: #333;
}
body {
  width: 100%;
	height: 100%;
	font-size: 14px;
  -webkit-tap-highlight-color: transparent;
}
a{
	text-decoration: none;
  color: #358acd;
}
ul{
	list-style: none;
}
i{
  font-style: normal;
}
.btn{
  outline: none;
  border: none;
  cursor: pointer;
  width: 320px;
  height: 80px;
  line-height: 80px;
  border-radius: 40px;
  background: #87B940;
  color: #fff;
  font-size: 38px;
}
#app {
  position: relative;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
  font-size: 16px;
}
.app-box{
  position: relative;
  width: 100%;
  height: 100%;
}
/* 消息 */
.msg_wrap{
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  display: block;
  background: #67c23a;
  padding: 5px 15px;
  border-radius: 3px;
  text-align: center;
  color: #333;
  min-width: 80px;
  z-index: 10000;
}
.msg_wrap_ok{
  background: #f0f9eb;
  color: #67c23a;
}
.msg_wrap_warn{
  background:#fdf6ec;
  color: #e6a23c;
}

/* 滑条 */
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: transparent;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: transparent;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #888;
}
.style1::-webkit-scrollbar-corner{
	background-color: transparent;
}

.style2::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: transparent;
}
.style2::-webkit-scrollbar{
	height: 4px;
	background-color: transparent;
}
.style2::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #888;
}
.style2::-webkit-scrollbar-corner{
	background-color: transparent;
}
/* 楷体 */
.kaiti{
  font-family: 'Kaiti';
}
</style>