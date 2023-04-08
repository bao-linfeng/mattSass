<template>
    <div class="galleries-wrap">
        <div class="head-wrap">
            <div class="head-left">
                <img class="block" src="../assets/block.svg" alt="">
                <h3 class="title">全部图片</h3>
            </div>
            <div class="head-right">
                <img class="close" @click.stop="close" src="../assets/close.svg" alt="">
            </div>
        </div>
        <div class="label-wrap">
            <i class="label" :class="{active: tagKey === item._key}" v-for="(item, index) in tagList" :key="index" @click="changeLabel(item._key)">{{item.name}}</i>
        </div>
        <div class="images-wrap style1">
            <div class="image-box" :class="{active: imageURL === item.url}" v-for="(item, index) in imagesList" :key="index" @click="changeURL(item)">
                <img :src="item.url" alt="">
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
    name: 'allGalleries',
    emits: ['close', 'changeURL', 'changeLabel'],
    setup(props, context) {
        const { token, origin, userKey, qiniuURL, siteKey } = toRefs(useState());
        const router = useRouter();

        const tagList = ref([]);
        const tagKey = ref('');
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
                tagList.value = result.data;
                tagList.value.unshift({'_key': '', 'name': '全部图片'});
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
            close();
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

        const close = () => {
            context.emit('close', 0);
        }

        onMounted(() => {
            getTagFront();
            getBackgroundFront();
        });

        onBeforeUnmount(() => {
            
        });
        
        return {
            tagList, tagKey, changeLabel, changeURL, imageURL, imagesList, close,
        }
    }
}
</script>
<style lang="scss" scoped>
.galleries-wrap{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    font-size: 22px;
    color: #333;
    background: #fff;
    .head-wrap{
        position: relative;
        width: calc(100% - 128px);
        height: 120px;
        padding: 0 64px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0px 2px 12px 0px rgba(235,235,235,0.50); 
        .head-left{
            display: flex;
            align-items: center;
            cursor: pointer;
            .block{
                margin-right: 20px;
            }
            .title{
                font-size: 36px;
            }
        }
        .head-right{
            display: flex;
            align-items: center;
            cursor: pointer;
        }
    }
    
    .label-wrap{
        position: relative;
        width: calc(100% - 128px);
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        padding: 40px 64px 28px 64px;
        .label{
            position: relative;
            padding: 0 45px;
            height: 52px;
            line-height: 52px;
            background: #f0f0f0;
            border-radius: 4px;
            margin: 0 12px 12px 0;
            cursor: pointer;
            &.active{
                background: #88BA44;
                color: #fff;
            }
        }
    }
    .images-wrap{
        position: relative;
        width: calc(100% - 128px);
        height: calc(100% - 328px);
        display: flex;
        align-content: flex-start;
        flex-wrap: wrap;
        padding: 0 64px;
        overflow-y: auto;
        .image-box{
            position: relative;
            display: inline-block;
            width: 420px;
            height: 240px;
            background: #e5e5e5;
            border-radius: 10px;
            cursor: pointer;
            margin: 0 24px 24px 0;
            overflow: hidden;
            &.active{
                position: relative;
                border: 2px solid #89BA43;
                height: 236px;
            }
            img{
                height: 100%;
                width: 100%;
                background: #ddd;
            }
        }
    }
}
</style>