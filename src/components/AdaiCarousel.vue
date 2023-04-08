<template>
    <div class="adaiCarousel-wrap">
        <i class="i" :class="{active: i === current}" v-for="(item, i) in len" :key="i"></i>
    </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { getQueryVariable, setValue, getValue, createMsg, qrcode } from '../util/ADS';
import {  } from '../util/api';

export default {
    components: {
        
    },
    name: 'adaiCarousel',
    props: ['id'],
    setup(props, context) {
        const { token, origin, qiniuURL } = toRefs(useState());
        const router = useRouter();
        const id = props.id;

        const current = ref(0);
        const timer = ref('');
        const len = ref(3);

        const init = () => {
            timer.value = setInterval(() => {
                animate()
            }, 5000);
        }

        const animate = () => {
            current.value = current.value + 1;
            if(current.value >= len.value){
                current.value = 0;
            } 
            // console.log(current.value);
        }

        const clear = () => {
            timer.value ? clearInterval(timer.value) : null;
        }

        onMounted(() => {
            init();
        });

        onBeforeUnmount(() => {
            clear();
        });


        return {
            len, clear, current,
        }
    }
}
</script>

<style lang="scss" scoped>
.adaiCarousel-wrap{
    position: relative;
    width: 100%;
    height: 100%;
    .i{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        opacity: 0; 
        transition: opacity 1s linear; 
        background: url('../assets/0.png') 50% 50% no-repeat;
        background-size: cover;
        &:nth-of-type(1){
            background-image: url('../assets/1.png');
        }
        &:nth-of-type(2){
            background-image: url('../assets/2.png');
        }
        &.active{
            z-index: 1;
            opacity: 1;
        }
    }
}
</style>