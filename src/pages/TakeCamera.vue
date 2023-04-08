<template>
    <div class="camera-wrap">
        <!-- 资源 -->
        <div class="source-box">
            <!-- 背景 -->
            <img class="bg" :src="prevURL" alt="">
            <img class="bg" :class="{currentBG: loaded}" :style="{opacity: loaded ? 1 : 0}" :src="backgroundURL" @load="bgLoad" alt="">
            <!-- 视屏流 -->
            <video class="video" v-show="isPlay" @canplaythrough="complateVideo" autoplay></video>
            <!-- canvas -->
            <!-- <canvas v-show="countdown === -1" class="display_canvas"></canvas> -->
            <!-- 抠图 -->
            <img class="photo" id="draggable" :style="{transform: 'translate('+x+'px, '+y+'px)', height: (photoH*zoom)+'px'}" :src="sourceData" alt="">
            <!-- 音效 -->
            <audio class="audio" id="kacha" controls="controls">
                <source src="https://skcysass.qingtime.cn/kacha.mp3" type="audio/mp3" />
            </audio>
            <audio class="audio" id="di" controls="controls">
                <source src="https://skcysass.qingtime.cn/di.MP3" type="audio/mp3" />
            </audio>
            <audio class="audio" id="weng" controls="controls">
                <source src="https://skcysass.qingtime.cn/weng.mp3" type="audio/mp3" />
            </audio>
        </div>
        <!-- 导航 -->
        <div class="head-wrap">
            <div class="head-left" @click="goBack">
                <img class="camera" src="../assets/camera.svg" alt="">
                <i class="title">时空穿越</i>
            </div>
        </div>
        <!-- 计数 -->
        <i class="countdown" v-show="countdown > 0">{{countdown}}</i>
        <!-- 开始拍摄 -->
        <div class="foot-wrap" v-show="isFirst">
            <div class="btn-box" @click="start">
                <img class="btn-img" src="../assets/btn.gif" alt="">
                <i class="btn-i">开始拍照</i>
            </div>
        </div>
        <!-- 右上角分享、重新拍摄 -->
        <!-- <div class="share-box" v-show="show">
            <img @click="share" src="../assets/saveShare.svg" alt="">
            <img @click="start" src="../assets/Rephoto.svg" alt="">
        </div> -->
        <div class="save-image" v-show="show" @click="share">
            <img class="img" src="../assets/save.svg" alt="">
            <i class="i">保存照片</i>
        </div>
        <!-- 右侧操作图标 -->
        <div class="galleries-box" :class="{active: show === 2}" v-show="!timer && !isFirst">
            <img @click="changeShow(1)" src="../assets/lucky.svg" alt="">
            <img @click="changeShow(2)" src="../assets/film.svg" alt="">
            <img @click="changeShow(3)" src="../assets/allGalleries.svg" alt="">
            <i></i>
            <img class="active" @click="start" src="../assets/Rephoto.svg" alt="">
        </div>
        <!-- 胶卷 -->
        <FilmModule v-if="show === 2" v-on:changeURL="changeURL" v-on:changeLabel="changeLabel" />
        <!-- 全部图库 -->
        <AllGalleriesModule v-if="show === 3" v-on:close="show = 1" v-on:changeURL="changeURL" v-on:changeLabel="changeLabel" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, setValue, getValue, createMsg, Base642Blob, getBase64ImgSize } from '../util/ADS';
import { background } from '../util/api';
import FilmModule from '../components/FilmModule.vue';
import AllGalleriesModule from '../components/AllGalleriesModule.vue';

export default {
    components: {
        FilmModule, AllGalleriesModule, 
    },
    name: 'home',
    props: ['id'],
    setup(props, context) {
        const { token, origin, userKey, qiniuURL, siteKey, sourceDataBlob, bgImg, photoImg, socket, socketMessageEvent, pc, videoPlayer, sourceData, sourceDataURL, } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const timer = ref('');
        const isFirst = ref(true);
        const countdown = ref(-1);
        const isPlay = ref(true);

        const countdownfn = () => {
            isPlay.value = true;
            countdown.value = 4;
            document.querySelector('#di').play();
            timer.value = setInterval(() => {
                if(countdown.value > 0){
                    countdown.value = countdown.value - 1;
                    if(countdown.value >= 1){
                        document.querySelector('#di').play();
                    }else{
                        document.querySelector('#kacha').play();
                    }
                }else{
                    clearInterval(timer.value);
                    timer.value = '';
                    // display_context.value.drawImage(v, 0, 0, innerHeight.value*w.value/h.value, innerHeight.value);
                    TakePhoto();
                    show.value = 1;
                }
            }, 1000);
        }

        const goBack = () => {
            router.push('/');
        }

        const closeCamera = () =>{
            if(!document.querySelector('.video').srcObject){
                return;
            } 
            let stream = document.querySelector('.video').srcObject;
            let tracks = stream.getTracks();
            tracks.forEach(track => {
                track.stop();
            })
            document.querySelector('.video').srcObject = null;
        };

        const complateVideo = (e) => {
            w.value = e.target.videoWidth;
            h.value = e.target.videoHeight;
            changePropertyValue('photoImg', {'w': w.value, 'h': h.value});

            // initCanvas();
        };

        const display_canvas = ref('');
        const display_context = ref('');
        const w = ref(1920);
        const h = ref(1080);
        const innerHeight = ref(window.innerHeight);
        const initCanvas = () => {//初始化canvas
            display_canvas.value = document.querySelector('.display_canvas');
            display_context.value = display_canvas.value.getContext('2d');
            display_canvas.value.width = innerHeight.value*w.value/h.value;
            display_canvas.value.height = innerHeight.value;
        };

        const start = () => {
            if(isFirst.value){
                isFirst.value = false;
            }
            if(timer.value){
                clearInterval(timer.value);
                timer.value = '';
            }
            if(timeouter.value){
                clearInterval(timeouter.value); 
                timeouter.value = '';
            }

            x.value = 0;
            y.value = 0;
            photoH.value = 1080;
            photoW.value = 1920;
            zoom.value = 1;

            outtime.value = 0;
            show.value = 0;
            countdownfn();
            changePropertyValue('sourceData', '');
        }

        // 手气不错
        const show = ref(0);
        const isActive = ref(false);
        const changeShow = (i) => {
            isActive.value = false;
            if(i === 1){
                document.querySelector('#weng').play();
                getBackgroundRandom(false);
            }
            if(i == 2 && show.value == 2){
                show.value = 1;
            }else{
                show.value = i;
            }
            
            outtime.value = 0;
        };

        // 分享
        const share = () => {
            router.push('/Share?background='+backgroundURL.value+'&bgKey='+bgKey.value+'&photo='+sourceDataURL.value+'&x='+x.value+'&y='+y.value+'&zoom='+zoom.value+'&w='+photoW.value+'&h='+photoH.value);
        }

        // 随机背景
        const backgroundURL = ref('');
        const prevURL = ref('');
        const bgKey = ref('');
        const getBackgroundRandom = async (f = true) => {
            // changePropertyValue('isLoading', true);
            const result = await background.getBackgroundRandom(siteKey.value);
            // changePropertyValue('isLoading', false);
            if(result.status == 200){
                prevURL.value = backgroundURL.value;
                backgroundURL.value = result.data.url;
                bgKey.value = result.data._key;
                isActive.value = true;  
                initAnimate();

                if(f){
                    if(socket.value){
                        StartRTC();
                        socket.value.send(`{'id':'reqLoadBgImage', 'url': '${backgroundURL.value}'}`); // 发送背景图
                    }else{
                        initSocket();
                    }
                }else{
                    socket.value.send(`{'id':'reqLoadBgImage', 'url': '${backgroundURL.value}'}`); // 发送背景图
                }
            }else{
                createMsg(result.msg);
            }
        }

        // 动画
        const loaded = ref(false);
        const initAnimate = () => {
            loaded.value = false;
            let timer = setTimeout(() => {
                loaded.value = true;
                clearTimeout(timer);
                timer = null;
            }, 300);
        }

        // 切换背景
        const changeURL = (data) => {
            outtime.value = 0;
            prevURL.value = backgroundURL.value;
            backgroundURL.value = data.url;
            bgKey.value = data._key;
            socket.value.send(`{'id':'reqLoadBgImage', 'url': '${backgroundURL.value}'}`); // 发送背景图
            document.querySelector('#weng').play();
            isActive.value = true;

            initAnimate();
        }

        // 切换标签
        const changeLabel = (data) => {
            outtime.value = 0;
        }

        // 背景图加载
        const bgLoad = (e) => {
            // console.log(e.target.naturalWidth, e.target.naturalHeight);
            changePropertyValue('bgImg', {'w': e.target.naturalWidth, 'h': e.target.naturalHeight});
        }

        // 和抠图程序通讯
        let Candidates = [];
	    let isRemoteSdpHasbeenSet = false;

        function StartRTC(){
            Candidates = [];
            changePropertyValue('pc', new RTCPeerConnection());
            pc.value.ontrack = (event)=>{ OnMediaTrack(event); }
            pc.value.onicecandidate = (event)=>{ OnIceCandidate(event); }
            socket.value.send(`{'id':'reqRtcStart'}`); // 发送协议开始RTC
        }

        const OnMediaTrack = (event)=>{
            // 旧的浏览器可能没有srcObject
            // console.log(event);
            // if(!videoPlayer.value){
            //     return;
            // }
            if("srcObject" in videoPlayer.value){
                videoPlayer.value.srcObject = event.streams[0];
            } else {
                // 防止再新的浏览器里使用它，应为它已经不再支持了
                videoPlayer.value.src = window.URL.createObjectURL(event.streams[0]);
            }
            videoPlayer.value.onloadedmetadata =  (e) => {
                videoPlayer.value.play();
            };
        }

        const OnIceCandidate = (event)=>{
            if(event.candidate !== null)
                Candidates.push(event.candidate);
            SendIceCandidatesToRemotePeer();
        }

        // 将本地ICE发送给远端程序
        const SendIceCandidatesToRemotePeer = ()=>{
            if(!isRemoteSdpHasbeenSet) return;

            for(let i=0; i<Candidates.length; i++){
                let candidate = Candidates[i];
                socket.value.send(`{"id":"reqRtcIceCandidate2", "candidate":"${candidate.candidate}", "sdpMLineIndex":"${candidate.sdpMLineIndex}", "sdpMid":"${candidate.sdpMid}"}`);
            }
            Candidates = []; // 清空JS数组
        }

        // 接收远端SDP并设置给本地
        const RecvSdpToLocalPeer = (type, sdp)=>{
            let offerDesc = new RTCSessionDescription({ type: type, sdp:sdp});
            pc.value.setRemoteDescription(offerDesc).then(()=>{
                isRemoteSdpHasbeenSet = true;
                pc.value.createAnswer().then((answer) =>{
                    pc.value.setLocalDescription(answer).then(()=>{
                        SendSdpToRemotePeer(answer);
                    });
                });
            });
        }

        // 将本地SDP发送给远端程序
        const SendSdpToRemotePeer = (answer) =>{
            socket.value.send(`{"id":"reqRtcSdp2", "type":"${answer.type}", "sdp":"${answer.sdp}"}`);
        }

        // 接收远端ICE并设置给本地
        const RecvIceCandidateToLocalPeer = (candidate) =>{
            pc.value.addIceCandidate(candidate);

            SendIceCandidatesToRemotePeer();
        }

        function HangupRTC(){
            Hangup();
            socket.value.send(`{"id":"reqRtcHangup"}`);
        }

        function Hangup(){
            pc.value.close();
            changePropertyValue('pc', '');
            Candidates = [];
            isRemoteSdpHasbeenSet = false;
        }

        function TakePhoto(){
            socket.value.send(`{"id":"reqTakePhoto"}`)
        }

        function reqPageDrag(state){
            // state 0 => 开始; 1 => 离开; 2 => 进行;
            console.log(`{"id": "reqPageDrag", "token": "", "state": ${state}}`);
            socket.value.send(`{"id": "reqPageDrag", "token": "", "state": ${state}}`);
        }

        const initSocket = () => {
            // 创建 WebSocket 对象
            changePropertyValue('socket', new WebSocket("ws://127.0.0.1:4649/jscall"));

            // 连接成功时的回调函数
            socket.value.onopen = (event) => {
                console.log("WebSocket connected!");
                StartRTC();
                socket.value.send(`{'id':'reqLoadBgImage', 'url': '${backgroundURL.value}'}`); // 发送背景图
                console.log(`{'id':'reqLoadBgImage', 'url': '${backgroundURL.value}'}`);
            };

            // 接收消息时的回调函数
            socket.value.onmessage = (event) => {
                changePropertyValue('socketMessageEvent', event);
            };

            // 连接关闭时的回调函数
            socket.value.onclose = (event) => {
                console.log("WebSocket closed: " + event.code + ", " + event.reason);
            };

            // 发送消息
            //socket.send("Hello, WebSocket!");
        }

        watch(socketMessageEvent, (event, ov) => {
            console.log("Received message: " + event.data);
            let json = JSON.parse(event.data);
            
            switch(json.id){
                case "resRtcSdp1":
                    RecvSdpToLocalPeer(json.type, json.sdp);
                    break;
                case "resRtcIceCandidate1":
                    {
                        let candidate = new RTCIceCandidate(
                        {
                            candidate : json.candidate,
                            sdpMLineIndex : json.sdpMLineIndex,
                            sdpMid : json.sdpMid,
                        });
                        RecvIceCandidateToLocalPeer(candidate);
                    }
                    break;
                case "resTakePhoto":
                    // 裁剪位置和图片长宽
                    if(json.crop && json.crop.enable){
                        x.value = json.crop.left;
                        y.value = json.crop.top;
                        photoH.value = json.crop.height;
                        photoW.value = json.crop.width;
                    }
                    changePropertyValue('sourceData', "data:image/png;base64," + json.rawData);
                    isPlay.value = false;
                    changePropertyValue('photoSize', getBase64ImgSize(sourceData.value));
                    changePropertyValue('sourceDataBlob', Base642Blob(sourceData.value));
                    changePropertyValue('sourceDataURL', URL.createObjectURL(sourceDataBlob.value));
                    break;
                default:
                    throw "未知消息!";
            }
        });

        // 超时一分钟无操作跳转首页
        const outtime = ref(0);
        const timeouter = ref('');
        const handleTimeout = () =>{
            timeouter.value = setInterval(() => {
                if(outtime.value < 60){
                    outtime.value = outtime.value +1;
                }else{
                    goBack();
                }
            }, 1000);
        }

        // 初始化鼠标拖动
        const x = ref(0);
        const y = ref(0);
        const zoom = ref(1);
        const photoH = ref(1080);
        const photoW = ref(1920);

        const Draggable = {
            isDragging: false,
            offsetX: 0,
            offsetY: 0,
            ele: '',
            init: function(id){
                this.ele = document.getElementById(id);
            },
            onMouseDown: function(e){
                e.preventDefault();
                this.isDragging = true;
                this.offsetX = e.offsetX;
                this.offsetY = e.offsetY;
            },
            onMouseMove: function(e){
                e.preventDefault();
                if (this.isDragging) {
                    outtime.value = 0;
                    x.value = e.clientX - this.offsetX;
                    y.value = e.clientY - this.offsetY;
                }
            },
            onMouseUp: function(e){
                e.preventDefault();
                this.isDragging = false;
            },
            addEventListener: function(){
                this.ele.addEventListener('mousedown', this.onMouseDown);
                this.ele.addEventListener('mousemove', this.onMouseMove);
                this.ele.addEventListener('mouseup', this.onMouseUp);
            },
            removeEventListener: function(){
                this.ele.removeEventListener('mousemove', this.onMouseDown);
                this.ele.removeEventListener('mousemove', this.onMouseMove);
                this.ele.removeEventListener('mouseup', this.onMouseUp);
            }
        }

        // 触摸屏 拖动 缩放
        function getDistance(touch1, touch2){// 计算两个触点之间的距离
            let deltaX = touch1.clientX - touch2.clientX;
            let deltaY = touch1.clientY - touch2.clientY;
            return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        }

        const Touchable = {
            isDragging: false,
            isTouch: false,
            touchX: 0,
            touchY: 0,
            initialDistance: 0,
            currentDistance: 0,
            ele: '',
            init: function(id){
                this.ele = document.getElementById(id);
            },
            onTouchStart: function(e){
                e.preventDefault();
                if (e.touches.length == 1) {
                    reqPageDrag(0);
                    this.isDragging = true;
                    this.touchX = e.touches[0].clientX;
                    this.touchY = e.touches[0].clientY;
                }else if(e.touches.length == 2){
                    reqPageDrag(0);
                    this.isTouch = true;
                    this.initialDistance = getDistance(e.touches[0], e.touches[1]);
                }
            },
            onTouchMove: function(e){
                e.preventDefault();
                outtime.value = 0;
                if (e.touches.length == 1) {
                    if(this.isDragging){
                        reqPageDrag(2);
                        x.value = x.value+e.touches[0].clientX - this.touchX;
                        y.value = y.value+e.touches[0].clientY - this.touchY;

                        this.touchX = e.touches[0].clientX;
                        this.touchY = e.touches[0].clientY;
                    }
                }else if(e.touches.length == 2){
                    this.isDragging = false;
                    if(this.isTouch){
                        reqPageDrag(2);
                        this.currentDistance = getDistance(e.touches[0], e.touches[1]);
                        if(this.currentDistance >= this.initialDistance){
                            zoom.value = zoom.value + 0.008;
                            if(zoom.value >= 3){

                            }else{
                                x.value = x.value - photoW.value*0.008/2;
                                y.value = y.value - photoH.value*0.008/2;
                            }
                        }else{
                            zoom.value = zoom.value - 0.008;
                            if(zoom.value <= 0.55){
                                
                            }else{
                                x.value = x.value + photoW.value*0.008/2;
                                y.value = y.value + photoH.value*0.008/2;
                            }
                        }

                        if (zoom.value >= 3) {
                            zoom.value = 3;
                        }
                        if(zoom.value <= 0.5){
                            zoom.value = 0.5;
                        }

                        this.initialDistance = this.currentDistance;
                    }
                }
            },
            onTouchUp: function(e){
                e.preventDefault();
                this.isDragging = false;
                this.isTouch = false;
                this.touchX = 0; 
                this.touchY = 0;
                this.initialDistance = 0;
                this.currentDistance = 0;
                reqPageDrag(1);
            },
            addEventListener: function(){// 添加事件监听器
                this.ele.addEventListener('touchstart', this.onTouchStart);
                this.ele.addEventListener('touchmove', this.onTouchMove);
                this.ele.addEventListener('touchend', this.onTouchUp);
            },
            removeEventListener: function(){// 移除事件监听器
                this.ele.removeEventListener('touchstart', this.onTouchStart);
                this.ele.removeEventListener('touchmove', this.onTouchMove);
                this.ele.removeEventListener('touchend', this.onTouchUp);
            }
        }

        // 鼠标缩放
        const Zoomable = {
            ele: '',
            scale: 1,
            speed: 0.1,
            init: function(id){
                this.ele = document.getElementById(id);
            },
            onWheel: function(e){
                e.preventDefault();
                // console.log(this);
                // 通过调整缩放比例来实现缩放
                if(e.deltaY > 0){
                    if(Zoomable.scale >= 3){

                    }else{
                        Zoomable.scale = Math.min(3, Zoomable.scale + 0.1);
                        x.value = x.value - photoW.value*0.1/2;
                        y.value = y.value - photoH.value*0.1/2;
                    }
                }else{
                    console.log(Zoomable.scale);
                    if(Zoomable.scale <= 0.55){

                    }else{
                        Zoomable.scale = Math.max(0.5, Zoomable.scale - 0.1);
                        x.value = x.value + photoW.value*0.1/2;
                        y.value = y.value + photoH.value*0.1/2;
                    }
                }
                // 设置最小缩放比例为 0.1
                outtime.value = 0;
                zoom.value = Zoomable.scale;
            },
            addEventListener: function(){
                this.ele.addEventListener('wheel', this.onWheel);
            },
            removeEventListener: function(){
                this.ele.removeEventListener('wheel', this.onWheel);
            }
        }

        onMounted(() => {
            changePropertyValue('videoPlayer', document.querySelector('.video'));
            handleTimeout();
            // changePropertyValue('sourceData', 'https://cdn-skcy.qingtime.cn/1679462609835.png');
            // changePropertyValue('sourceDataURL', 'https://cdn-skcy.qingtime.cn/1679462609835.png');

            let bgURL = getQueryVariable('bgURL');
            let bgId = getQueryVariable('bgKey');
            let photoURL = getQueryVariable('photoURL');

            if(bgURL && bgId){
                prevURL.value = bgURL;
                backgroundURL.value = bgURL;
                bgKey.value = bgId;

                x.value = getQueryVariable('x') || 0;
                y.value = getQueryVariable('y') || 0;
                zoom.value = getQueryVariable('zoom') || 1;
                photoH.value = getQueryVariable('h') || 1080;
                photoW.value = getQueryVariable('w') || 1920;

                countdown.value = -1;
                isFirst.value = false;
                isPlay.value = false;
                show.value = 1;
                changePropertyValue('sourceData', photoURL);
                changePropertyValue('sourceDataURL', photoURL);
                StartRTC();
                socket.value.send(`{'id':'reqLoadBgImage', 'url': '${backgroundURL.value}'}`); // 发送背景图
            }else{
                getBackgroundRandom();
            }

            Draggable.init('draggable');
            Draggable.addEventListener();

            Zoomable.init('draggable');
            Zoomable.addEventListener();

            Touchable.init('draggable');
            Touchable.addEventListener();
        });

        onBeforeUnmount(() => {
            changePropertyValue('sourceData', "");
            changePropertyValue('videoPlayer', '');
            if(timer.value){
                clearInterval(timer.value);
                timer.value = '';
            }
            if(timeouter.value){
                clearInterval(timeouter.value); 
                timeouter.value = '';
            }
             
            closeCamera();

            Draggable.removeEventListener();
            Zoomable.removeEventListener();
            Touchable.removeEventListener();
        });

        return {
            countdown, goBack, complateVideo, start, sourceData, changeLabel, 
            changeShow, show, timer, share, backgroundURL, changeURL, bgLoad, sourceDataURL,
            x, y, zoom, isFirst, photoH, isPlay, isActive, prevURL, loaded,
        }
    }
}
</script>

<style lang="scss" scoped>
.camera-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    color: #fff;
    font-size: 24px;
    text-align: center;
    background: #999;
    background-size: cover;
    overflow: hidden;
}
.source-box{
    position: relative;
    width: 100%;
    height: 100%;
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    .audio{
        display: none;
    }
    .bg{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 100%;
    }
    .video{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        // transform: translate(-50%, -50%) rotateY(180deg);
        height: 100%;
    }
    .display_canvas{
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        // transform: translateX(-50%) rotateY(180deg);
        background-position: 50% 50%;
        background-repeat: no-repeat;
        background-size: auto 100%;
    }
    .photo{
        position: absolute;
        // height: 100%;
        top: 0;
        left: 0;
        cursor: pointer;
        transform-origin: 0 0;
        // transform: translateX(-50%);
        // transform: translateX(-50%) rotateY(180deg);
    }
}
.currentBG{
    transition: opacity 1s linear; 
}
.head-wrap{
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - 108px);
    height: 105px;
    padding: 0 54px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .head-left{
        display: flex;
        align-items: center;
        cursor: pointer;
        .camera{
            display: inline-block;
            height: 30px;
            margin-right: 16px;
        }
        .title{
            font-size: 32px;
            color: #89BA43;
            font-weight: 600;
        }
    }
}
.countdown{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 300px;
}
.foot-wrap{
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 230px;
    display: flex;
    justify-content: center;
    align-items: center;
    .btn-box{
        position: relative;
        width: 230px;
        height: 100%;
        display: flex;
        justify-items: center;
        align-items: center;
        cursor: pointer;
        .btn-img{
            height: 100%;
        }
        .btn-i{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, 15px);
            font-size: 16px;
            color: #fff;
        }
    }
}
.share-box{
    position: absolute;
    right: 54px;
    top: 52px;
    width: 94px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    img{
        display: block;
        cursor: pointer;
        margin-bottom: 20px;
    }
}
.save-image{
    position: absolute;
    right: -30px;
    top: 52px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    height: 60px;
    width: 240px;
    border-radius: 30px;
    background: #89BA43;
    color: #fff;
    .i{
        margin-left: 10px;
    }
}
.galleries-box{
    position: absolute;
    right: 54px;
    bottom: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    img{
        display: block;
        margin-left: 20px;
        cursor: pointer;
        height: 108px;
        opacity: 0.8;
        &.active{
            margin-left: 10px;
        }
    }
    &.active{
        bottom: 250px;
    }
    i{
        margin-left: 10px;
        width: 1px;
        height: 94px;
        background: #89BA43;
    }
}
</style>