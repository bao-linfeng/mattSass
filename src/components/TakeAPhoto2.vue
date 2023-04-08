<template>
    <div class="selectGender_wrap">
        <div class="takeAPhoto_content_wrap">
            <div class="bg_wrap">
                <video class="v" id="v" autoplay v-show="!photographData"></video>
                <img class="lvpin" v-show="photographData" :src="photographData" alt="" />
            </div>
        </div>
        <AdaiTitle v-show="!mergeURL" :path="'/SelectTemplate?dynastyIndex='+dynastyIndex+'&bgPlace='+bgPlace+'&tagKey='+tagKey" :title="'拍照'" :titleE="'Take a photo'" :theme="'theme'" :style="{position:'fixed',top:0,left:0,Zindex:10000}" />
        <div class="countdown_wrap PingFang_Bold" v-show="iScountdown">{{countdown}}</div>
        <div class="foot_wrap" v-show="mergeURL">
            <span class="a_button fontSize48 PingFangSC_Medium" @click="reShooting">重新拍摄</span>
            <router-link class="a_button fontSize48 PingFangSC_Medium" :to="'/SelectTemplate?dynastyIndex='+dynastyIndex+'&bgPlace='+bgPlace+'&tagKey='+tagKey">再玩一次</router-link>
        </div>
        <div class="qrcode_wrap fontSize30" v-show="isQrcode">
            <div class="qrcode" id="qrcode"></div>
            <p class="PingFang_Regular">扫码下载</p>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import ADS from "../utils/ADS.js";
import AdaiTitle from "../components/adai/AdaiTitle";
import uploadFile from "../components/upload/upload.js";
export default {
    name: "takeAPhoto",
    components: {
        AdaiTitle,
    },
    data: () => {
        return {
            url:'',
            bgKey:'',
            bgPlace:'',
            dynastyIndex:'',
            tagKey:'',
            photographData:'',
            countdown:10,
            mergeURL:'',
            AdaiQrcode:'',
            isQrcode:false,
            adjustRate:270,
            max:24,
            min:90,
            transparent:599,
            iScountdown:false,
            time:0,
            currentStream: '',
        };
    },
    created:function(){
        let search = window.location.search,param=ADS.params(search),url=param['url'] ? decodeURIComponent(param['url']).replace(/\s+/g,'%20') : '',bgKey=param['bgKey'] || '',bgPlace=param['bgPlace']  || '',dynastyIndex=param['dynastyIndex'] || '',tagKey = param['tagKey'] || '';
        this.url = decodeURIComponent(url);
        this.bgKey = bgKey;
        this.bgPlace = bgPlace;
        this.dynastyIndex = dynastyIndex;
        this.tagKey = tagKey;
        this.$store.dispatch('getConfig',{url:'/config',body:{}});
        this.$store.dispatch('getQiniuToken',{url:'https://baokudata.qingtime.cn/upload/getUptoken',body:{token:'W8POZN8LC4CDQ9IUC555J8VT25DBMBX4SVLF98Q8H1K3APRQ1575861021833'}});
    },
    mounted:function(){
        this.time = Date.now();
        console.log(this.url);
        // this.$store.dispatch('getConfig',{url:'/config',body:{}});
        this.v = document.getElementById('v');
        this.initMediaDevices();
        this.initWebSocket();
    },
    beforeDestroy:function(){
        this.closeCamera();
        this.timer ? clearInterval(this.timer) : null;
    },
    methods:{
        drawImage(){
            let v = document.getElementById('v');
            let w = 1920;
            let h = 1080;
            let merge_canvas = document.createElement('canvas');
            let merge_context = merge_canvas.getContext('2d');
            merge_canvas.width = w;
            merge_canvas.height = h;
            merge_context.drawImage(v, 0, 0, w, h);
            this.photographData = merge_canvas.toDataURL('image/png',1);
        },
        initMediaDevices(){
            navigator.mediaDevices.enumerateDevices().then((deviceInfos) =>{
                deviceInfos.map((item)=>{
                    console.log(item);
                    if(item.kind == 'videoinput' && item.label.indexOf('OBS-Camera') > -1){
                        this.initUserMedia(item.deviceId)
                    }
                });
            });
        },
        initUserMedia(deviceId){
            if (this.currentStream) {
                this.stopMediaTracks(this.currentStream);
            }
            const videoConstraints = {width: {ideal: 1920}, height: {ideal: 1080}};
            if (deviceId) {
                videoConstraints.deviceId = { exact: deviceId };
            } else {
                videoConstraints.facingMode = 'environment';
            }

            const constraints = {
                video: videoConstraints,
                audio: false
            };
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {
                this.currentStream = stream;
                this.v.srcObject = stream;
            }).catch(err => {
                console.log(err);
            });
        },
        stopMediaTracks(stream){
            stream.getTracks().forEach(track => {
                track.stop();
            });
        },
        closeCamera(){
            this.ws.send('stopSendImage');
        },
        initWebSocket() {
            let isImage = this.url.indexOf('https://cdn-icare.qingtime.cn') > -1 ? true : false;
            let ws = this.ws;
            var base = new ADS.Base64;  
            let setBackgroundVideo = 'setBackgroundVideo:'+base.encode(this.url);
            let setBackGroundImage = 'setBackGroundImage:'+base.encode(this.url.replace('https://cdn-icare.qingtime.cn/',''));
            let setMaxFore = 'setMaxFore:'+this.max;// 人物透明度
            let setBackRange = 'setBackRange:'+this.min;// 人物完整度
            let setAdjustRate = 'setAdjustRate:'+this.adjustRate;
            let setTransparentRate = 'setTransparentRate:'+this.transparent;

            ws.addEventListener('open', (event) => {
                console.log('Connection opened.');
                ws.send('getImage');
                ws.send('startSendImage');
                ws.send(isImage ? setBackGroundImage : setBackgroundVideo);
            });
            if(ws.readyState === 1){
                console.log('Connection opened.');
                ws.send('getImage');
                ws.send('startSendImage');
                ws.send(isImage ? setBackGroundImage : setBackgroundVideo);
                this.initCountdown();
                // ws.send(setMaxFore);
                // ws.send(setBackRange);
                // ws.send(setAdjustRate);
                // ws.send(setTransparentRate);
            }
			ws.onmessage = (e) => {
                this.cacheImage(e.data);
            };
            ws.onclose = function(evt) {
                console.log("Connection closed.");
            }; 
        },
        cacheImage(data){
            // console.log(data);
            if(!window.bg){
                window.bg = new Image();
                window.bg.setAttribute("crossOrigin",'Anonymous');
            }
            window.bg.src = data;
            window.bg.onload = () => {
                this.photographData = data;
            }
        },
        reShooting(){
            this.photographData = '';
            this.ws.send('startSendImage');
            this.countdown = 10;
            this.mergeURL = '';
            this.isQrcode = false;
            this.initCountdown();
            this.initMediaDevices();
        },
        changeAdjustRate(page){
            let setAdjustRate = 'setAdjustRate:'+page;
            this.ws.send(setAdjustRate);
            this.adjustRate = page;
        },
        changeMax(page){
            let setMaxFore = 'setMaxFore:'+page;
            this.ws.send(setMaxFore);
            this.max = page;
        },
        changeMin(page){
            let setBackRange = 'setBackRange:'+page;
            this.ws.send(setBackRange);
            this.min = page;
        },
        changeTransparent(page){
            let setTransparentRate = 'setTransparentRate:'+page;
            this.ws.send(setTransparentRate);
            this.transparent = page;
        },
        qrcode(url){
            let path = (this.origin+'/c?u='+url.replace('https://cdn-icare.qingtime.cn/','').replace('https:/cdn-icare.qingtime.cn/','')+'&bp='+this.bgPlace);
            if(this.AdaiQrcode){
                this.AdaiQrcode.clear ? this.AdaiQrcode.clear() : null; // 清除代码
                this.AdaiQrcode.makeCode ? this.AdaiQrcode.makeCode(path) : null; // 生成另外一个二维码
            }else{ 
                this.AdaiQrcode = new QRCode('qrcode',{
                    text: path,
                    width: 200,
                    height: 200,
                    colorDark : '#000000',
                    colorLight : '#ffffff',
                    correctLevel : QRCode.CorrectLevel.H
                });
            }
        },
        addGreenMerge(mergeUrl){
            this.$store.dispatch('addGreenMerge',{url:'/merge',body:{'bgKey':this.bgKey, 'mergeUrl':mergeUrl}});
        },
        uploadImg: async function(base64) {
            console.log(base64);
            base64 = ADS.dataURLtoBlob(base64);
            let callback = str => {
                console.log(str);
                this.mergeURL = true;
                this.isQrcode = true;
                this.qrcode(str);
                this.addGreenMerge(str);
            };
            uploadFile.uploadImg(base64, callback,this.qiniuToken);
        },
        
        initCountdown(){//定时
            this.iScountdown = true;
            this.timer = setInterval(() => {
                this.countdown = this.countdown - 1;
                if(this.countdown < 0){
                    clearInterval(this.timer);
                    this.timer = null;
                    this.iScountdown = false;
                    this.closeCamera();
                    this.drawImage();
                    this.uploadImg(this.photographData);
                }
            }, 1000);
        },
    },
    computed:{
        ...mapState({
            qiniuToken:state => state.common.qiniuToken,
            origin: state => state.common.origin,
            windowH:state => state.common.windowH,
            config:state => state.common.config,
            ws:state => state.common.ws,
        })
    },
    watch:{
        'config':function(newV,oldV){
            let code = ADS.getLocalStorage('code') || window.location.origin;
            console.log(code);
            if(newV && newV.length){
                newV.map((item)=>{
                    if(item.code == code){
                        this.changeAdjustRate(item.adjustRate);
                        this.changeMax(item.max);
                        this.changeMin(item.min);
                        this.changeTransparent(item.transparent);
                    }
                });
            }
        },
    },
};
</script>
<style scoped lang="scss">
.selectGender_wrap{
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    color: var(--gray999-color);
    background-color: #000;
}
.takeAPhoto_content_wrap{
    position: relative;
    width: 100%;
    height: 100%;
}
.bg_wrap{
    width: 100%;
    height: 100%;
    position: relative;
    display: inline-block;
    overflow: hidden;
    .bg{
        height: 100%;
        display: inline-block;
    }
    .v{
        position: absolute;
        top: 0;
        left: 0;
    }
    .lvpin{
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        height: 100%;
    }
}
.countdown_wrap{
    position: fixed;
    top: 40px;
    right: 40px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    color: #fff;
    line-height: 260px;
    font-size: 20rem;
}
.foot_wrap{
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10px 0;
    span{
        margin-right: 40px;
    }
}
.qrcode_wrap{
    position: fixed;
    width: 200px;
    padding: 10px;
    top: 0;
    right: 60px;
    color: var(--gray666-color);
    background: rgba(255,255,255,0.90);
    filter: drop-shadow(4px 4px 8px rgba(203,203,203,1));
    .qrcode{
        width: 200px;
        height: 200px;
    }
    p{
        position: absolute;
        left: 50%;
        width: 100%;
        transform: translateX(-50%);
        bottom: -40px;
        z-index: 10000;
    }
    &::after{
        position: absolute;
        top: 100%;
        left: 0;
        content: '';
        width: 0;
        height: 0;
        border-top: 110px solid rgba(255,255,255,0.90);
        border-right: 110px solid transparent;
        border-bottom: 110px solid transparent;
        border-left: 110px solid transparent;
    }
}
</style>