<template>
    <div class="card-wrap">
        <div class="content-wrap">
            <div class="merge-wrap" v-if="base64">
                <img class="bg" :src="base64" alt="合成图" />
            </div>
            <div class="merge-wrap" v-else>
                <div class="merge-box">
                    <img class="bg" :src="bgUrl" alt="背景" />
                    <img class="photo" @load="photoLoad" :style="{transform: 'translate('+x*(windowWidth - 60)/1920+'px, '+y*(windowWidth - 60)/1920+'px)', height: (photoH*zoom*(windowWidth - 60)/1920)+'px'}" :src="photoUrl" alt="抠图" />
                </div>
            </div>
        </div>
        <div class="desc-wrap">
            <p class="desc">恭喜完成一次时空的穿越，欢迎再来哦。</p>
            <p class="download">长按图片保存</p>
        </div>
        <div class="foot-wrap">
            <i class="beian">©{{year}} 江苏时光信息科技有限公司</i>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, setValue, getValue, createMsg, qrcode, initWechat } from '../util/ADS';
import { background } from '../util/api';

export default {
    components: {
        
    },
    name: 'card',
    props: ['id'],
    setup(props, context) {
        const { origin, qiniuURL } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const bgUrl = ref('');
        const photoUrl = ref('');
        const year = ref(new Date().getFullYear());

        const goBack = (t = '') => {
            router.push('/'+t);
        }

        // 合成图详情
        const getMergeDetail = async (mergeKey, token) => {
            const result = await background.getMergeDetail(token, mergeKey);
            if(result.status == 200){
                bgUrl.value = result.data.bgUrl;
                photoUrl.value = result.data.photoUrl;

                x.value = result.data.mergeX || 0;
                y.value = result.data.mergeY || 0;
                zoom.value = result.data.zoom || 1;

                mergeImage(bgUrl.value, photoUrl.value);
            }else{
                createMsg(result.msg);
            }
        }

        // 合成
        const base64 = ref('');
        const mergeImage = (bgUrl, photoUrl) => {
            let display_canvas = document.createElement('canvas');
            let display_context = display_canvas.getContext('2d');
            
            let bg = new Image();
            bg.setAttribute("crossOrigin", 'Anonymous');
            bg.src = bgUrl;
            bg.onload = () => {
                display_canvas.width = bg.width;
                display_canvas.height = bg.height;
                display_context.imageSmoothingEnabled = false; // 关闭双线性插值算法

                display_context.drawImage(bg, 0, 0, bg.width, bg.height, 0, 0, display_canvas.width, display_canvas.height);
                bg = null;

                let photo = new Image();
                photo.setAttribute("crossOrigin", 'Anonymous');
                photo.src = photoUrl;
                photo.onload = () => {
                    display_context.drawImage(photo, x.value, y.value, photo.width*zoom.value, photo.height*zoom.value);
                    photo = null;
                    base64.value = display_canvas.toDataURL('image/png', 1);
                }
            }
        }

        // 缩放和移动
        const x = ref(0);
        const y = ref(0);
        const zoom = ref(1);
        const windowWidth = ref(1920);
        const photoH = ref(1080);
        const photoW = ref(1920);

        const photoLoad = (e) => {
            console.log(e.target.naturalWidth, e.target.naturalHeight);
            photoH.value = e.target.naturalHeight;
            photoW.value = e.target.naturalWidth;
        }

        onMounted(() => {
            let mergeKey = getQueryVariable('k');
            let token = getQueryVariable('token');
            windowWidth.value = window.innerWidth;

            getMergeDetail(mergeKey, token);

            initWechat(
                `${window.location.href}`,
                '时空穿越-绿屏',
                "时空穿越 打卡万安",
                "https://skcysass.qingtime.cn/128.png"
            );
        });


        return {
            goBack, qiniuURL, photoUrl, year, bgUrl, base64, x, y, zoom, windowWidth, photoLoad, photoH, 
        }
    }
}
</script>

<style lang="scss" scoped>
.card-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    color: #666;
    font-size: 24px;
    text-align: center;
    background: url('../assets/bg.png') 50% 50% no-repeat;
    background-size: cover;
}
.content-wrap{
    position: relative;
    width: calc(100% - 40px);
    padding: 50px 20px 0 20px;
    .merge-wrap{
        position: relative;
        width: calc(100% - 20px);
        padding: 10px;
        background: #fff;
        overflow: hidden;
        .merge-box{
            position: relative;
            height: 100%;
            overflow: hidden;
        }
        .bg{
            display: block;
            width: 100%;
        }
        .photo{
            position: absolute;
            top: 0;
            left: 0;
            // left: 50%;
            // top: 50%;
            // transform: translate(-50%, -50%);
            height: calc(100% - 20px);
        }
    }
}
.desc-wrap{
    .download{
        font-size: 20px;
    }
    .desc{
        font-size: 14px;
        margin: 30px 0 40px 0;
    }
}
.foot-wrap{
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding-bottom: 30px;
    .btn{
        font-size: 30px;
        border-radius: 3px;
        display: block;
        margin: 0 auto;
    }
    .beian{
        font-size: 10px;
        color: #999;
    }
}
.base64{
    width: calc(100% - 20px);
}
</style>