<template>
    <div class="film-wrap">
        <div class="label-wrap style2">
            <div class="label-box" :style="{width: w+'px'}">
                <i class="label" :class="{active: tagKey === item._key}" v-for="(item, index) in tagList" :key="index" @click="changeLabel(item._key)">{{item.name}}</i>
            </div>
        </div>
        <div class="images-wrap">
            <div class="image-wrap style2">
                <div class="image-box" v-for="(item, index) in imagesList" :key="index" @click="changeURL(item)">
                    <img :class="{active: imageURL === item.url}" :src="item.url" alt="">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted, onBeforeUnmount } from 'vue';
import { background } from '../util/api';
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, setValue, getValue, createMsg } from '../util/ADS';

export default {
    props:{
        
    },
    name: 'film',
    emits: ['close', 'changeURL', 'changeLabel'],
    setup(props, context) {
        const { token, origin, userKey, qiniuURL, siteKey } = toRefs(useState());
        const router = useRouter();

        const tagList = ref([]);
        const tagKey = ref('');
        const w = ref(0);
        const changeLabel = (i) => {
            tagKey.value = i;
            context.emit('changeLabel', i);
            getBackgroundFront();
        }

        const getTagFront = async () => {
            changePropertyValue('isLoading', true);
            const result = await background.getTagFront(siteKey.value, '');
            changePropertyValue('isLoading', false);
            if(result.status == 200){
                let width = 55+50;
                tagList.value = result.data.map((ele) => {
                    width = width + ele.name.length*32+50;
                    return ele;
                });
                w.value = width;
                tagList.value.unshift({'_key': '', 'name': 'ALL'});
            }else{
                createMsg(result.msg);
            }
        }

        const imagesList = ref([]);
        const imageURL = ref('1');
        const page = ref(1);
        const limit = ref(100);
        const pages = ref(0);
        const total = ref(0);
        const changeURL = (data) => {
            imageURL.value = data.url;
            context.emit('changeURL', data);
        }

        // 背景列表
        const getBackgroundFront = async () => {
            changePropertyValue('isLoading', true);
            const result = await background.getBackgroundFront(siteKey.value, tagKey.value, page.value, limit.value);
            changePropertyValue('isLoading', false);
            if(result.status == 200){
                imagesList.value = result.data;
                pages.value = result.pageNum;
                total.value = result.total;
            }else{
                createMsg(result.msg);
            }
        }

        onMounted(() => {
            getTagFront();
            getBackgroundFront();
        });

        onBeforeUnmount(() => {
            
        });
        
        return {
            tagList, tagKey, changeLabel, changeURL, imageURL, imagesList, w,
        }
    }
}
</script>
<style lang="scss" scoped>
.film-wrap{
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    font-size: 20px;
    color: #fff;
    .label-wrap{
        position: relative;
        width: calc(100% - 40px);
        height: 88px;
        // display: flex;
        // align-items: center;
        padding: 0 20px;
        overflow-x: auto;
        .label-box{
            height: 100%;
            width: 100%;
            display: flex;
            align-items: center;
        }
        .label{
            position: relative;
            margin-right: 50px;
            cursor: pointer;
            font-size: 30px;
            font-weight: bold;
            &.active{
                &::after{
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 37px;
                    height: 2px;
                    background: #ffffff;
                    border-radius: 1px;
                }
            }
        }
    }
    .images-wrap{
        position: relative;
        width: 100%;
        height: 162px;
        display: flex;
        align-items: center;
        .image-wrap{
            position: relative;
            width: 100%;
            margin: 0 auto;
            height: 100%;
            display: flex;
            align-items: center;
            overflow-x: auto;
            overflow-y: hidden;
        }
        .image-box{
            display: inline-block;
            padding: 22px 5px;
            height: 118px;
            // min-width: 100px;
            cursor: pointer;
            background: url('../assets/filmBorder.svg') 0 0 repeat-x;
            background-size: auto 100%;
            margin-left: 3px;
            img{
                height: 100%;
                &.active{
                    border: 2px solid #89BA43;
                    height: calc(100% - 4px);
                }
            }
        }
    }
}
</style>