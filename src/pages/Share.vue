<template>
    <div class="share-wrap">
        <!-- 导航 -->
        <div class="head-wrap">
            <div class="head-left" @click="goBack('TakeCamera?bgURL='+bgURL+'&bgKey='+bgKey+'&photoURL='+photoURL+'&x='+x+'&y='+y+'&zoom='+zoom+'&w='+photoW+'&h='+photoH)">
                <img class="icon" src="../assets/back.svg" alt="">
                <i class="title">返回重选背景</i>
            </div>
        </div>
        <div class="content-wrap">
            <div class="content-left">
                <h3 class="title">时空穿越</h3>
                <div class="merge-wrap">
                    <div class="merge-box">
                        <img class="bg" :src="bgURL" alt="背景" />
                        <img class="photo" :src="photo" :style="{transform: 'translate('+x*720/1080+'px, '+y*720/1080+'px)', height: (photoH*zoom*720/1080)+'px'}" alt="抠图" />
                    </div>
                </div>
            </div>
            <div class="content-right">
                <div class="qrcode-wrap">
                    <div class="qrcode-box" id="qrcode"></div>
                    <i class="qrcode-i">扫码下载</i>
                </div>
                <button  class="btn again" @click="goBack('')">再玩一次</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, setValue, getValue, createMsg, qrcode } from '../util/ADS';
import { user, background } from '../util/api';
import { uploadFile } from '../util/qiniu';

export default {
    components: {
        
    },
    name: 'share',
    props: ['id'],
    setup(props, context) {
        const { token, siteKey, origin, qiniuURL, sourceDataBlob, qiniuToken, photoSize, photoURL, photoImg, bgImg } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const bgURL = ref('');
        const bgKey = ref('');
        const photo = ref('');

        const goBack = (t = '') => {
            router.push('/'+t);
        }

        const getUptoken = async (t) => {
            const result = await user.getUptoken(t);
            if(result.statusCode == 200){
                changePropertyValue('qiniuToken', result.result);
                setValue('qiniuToken', result.result);

                init();
            }else{
                createMsg(result.msg);
            }
        }

        const addMergeImage = async () => {
            const result = await background.addMergeImage({
                token: token.value, 
                siteKey: siteKey.value, 
                bgKey: bgKey.value, 
                photoUrl: photoURL.value, 
                photoSize: photoSize.value,
                mergeX: x.value, 
                mergeY: y.value,
                zoom: zoom.value,
            });
            if(result.status == 200){
                // +'&token='+token.value
                qrcode(origin.value+'/Card?k='+result.data, 'qrcode', 252);
            }else{
                createMsg(result.msg);
            }
        }

        const init = () => {
            uploadFile(sourceDataBlob.value, (e) => {
                changePropertyValue('photoURL', e);
                addMergeImage();
            }, qiniuToken.value);
        }

        // 超时一分钟无操作跳转首页
        const outtime = ref(0);
        const timeouter = ref('');
        const handleTimeout = () =>{
            timeouter.value = setInterval(() => {
                if(outtime.value < 60){
                    outtime.value = outtime.value + 1;
                }else{
                    goBack();
                }
            }, 1000);
        }

        // 缩放和移动
        const x = ref(0);
        const y = ref(0);
        const zoom = ref(1);
        const photoH = ref(1080);
        const photoW = ref(1920);

        onMounted(() => {
            bgURL.value = getQueryVariable('background');
            bgKey.value = getQueryVariable('bgKey');
            photo.value = getQueryVariable('photo');

            x.value = getQueryVariable('x') || 0;
            y.value = getQueryVariable('y') || 0;
            zoom.value = getQueryVariable('zoom') || 1;
            photoH.value = getQueryVariable('h') || 1080;
            photoW.value = getQueryVariable('w') || 1920;

            handleTimeout();

            if(photo.value.indexOf('https://cdn-skcy.qingtime.cn') > -1){
                changePropertyValue('photoURL', photo.value);
                addMergeImage();
            }

            photoURL.value ? null : getUptoken(token.value);
        });

        onBeforeUnmount(() => {
            changePropertyValue('photoURL', '');
            changePropertyValue('sourceDataBlob', '');

            if(photo.value.indexOf('https://cdn-skcy.qingtime.cn') > -1){

            }else{
                URL.revokeObjectURL(photo.value);
            }

            if(timeouter.value){
                clearInterval(timeouter.value); 
                timeouter.value = '';
            }
        });

        return {
            goBack, qiniuURL, bgURL, photo, bgKey, photoURL, x, y, zoom, photoH, photoW, 
        }
    }
}
</script>

<style lang="scss" scoped>
.share-wrap{
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
        .icon{
            display: inline-block;
            height: 30px;
            margin-right: 16px;
        }
        .title{
            font-size: 32px;
            color: #686868;
            font-weight: 600;
        }
    }
}
.content-wrap{
    position: relative;
    width: calc(100% - 230px);
    height: calc(100% - 105px);
    padding: 0 115px;
    display: flex;
    justify-content: space-between;
    .content-left{
        position: relative;
        .title{
            font-size: 54px;
            color: #89BA43;
            text-align: left;
            margin-bottom: 20px;
        }
        .merge-wrap{
            position: relative;
            max-width: 1280px;
            height: 720px;
            padding: 10px;
            background: #fff;
            box-shadow: 9px 21px 29px -3px rgba(0,0,0,0.20);
            overflow: hidden; 
            .merge-box{
                position: relative;
                height: 100%;
                overflow: hidden;
            }
            .bg{
                display: block;
                height: 100%;
            }
            .photo{
                position: absolute;
                top: 0;
                left: 0;
                // left: 50%;
                // top: 50%;
                // transform: translate(-50%, -50%);
                display: block;
                height: calc(100% - 20px);
            }
        }
    }
    .content-right{
        position: relative;
        margin: 160px 0 0 130px;
        width: 280px;
        .qrcode-wrap{
            position: relative;
            width: 280px;
            height: 351px;
            opacity: 0.7;
            background: #89ba43;
            border-radius: 10px;
            padding-top: 1px;
            .qrcode-box{
                position: relative;
                width: 252px;
                height: 252px;
                background: #ffffff;
                border-radius: 7px;
                margin: 15px auto;
            }
            .qrcode-i{
                font-size: 36px;
                color: #fff;
            }
        }
        .again{
            width: 280px;
            margin-top: 140px;
            height: 66px;
            line-height: 66px;
            border-radius: 33px;
            font-size: 36px;
        }
    }
}
</style>