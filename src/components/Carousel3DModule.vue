<template>
    <div class="carousel-wrap">
        <div class="image-wrap" v-for="(item, index) in imagesList" :key="index">
            <img src="../assets/loading.gif" alt="">
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted, onBeforeUnmount } from 'vue'
export default {
    props:{
        
    },
    name: 'carousel',
    setup(props) {

        const timer = ref('');
        const current = ref(0);
        const len = ref(5);
        const autoPlay = () => {
            timer.value = setInterval(() => {
                if(current.value >= len.value - 1){
                    current.value = 0;
                }else{
                    current.value++;
                }
                console.log(current.value);

                frount();
            }, 2000);
        }

        let imgs = '';
        const imagesList = ref([{}, {}, {}, {}, {}]);

        const frount = () => {
            let mlen = Math.floor(len.value/2);
            let limg, rimg;
            for (var i = 0; i < mlen; i++) {
                limg = len.value + current.value - i - 1;
                rimg = current.value + i + 1;
                if (limg >= len.value) {
                    limg -= len.value;
                }
                if (rimg >= len.value) {
                    rimg -= len.value; 
                }
                imgs[limg].style.transform = `translateX(` + (150) * (i + 1) + `px) translateZ(` + (200 - i * 100) + `px) rotateY(-30deg)`;
                imgs[rimg].style.transform = `translateX(` + (-150) * (i + 1) + `px) translateZ(` + (200 - i * 100) + `px) rotateY(30deg)`;
            }
            imgs[current.value].style.transform = `translateZ(300px)`;
        }

        onMounted(() => {
            imgs = document.querySelectorAll(".image-wrap");
            frount();
            autoPlay();
        });

        onBeforeUnmount(() => {
            if(timer.value){
                clearInterval(timer.value);
            }
        });
        
        return {
            imagesList,
        }
    }
}
</script>
<style lang="scss" scoped>
.carousel-wrap{
    position: absolute;
    width: 100%;
    height: 100%;
    perspective: 800px;
    transform-style: preserve-3d;
    .image-wrap{
        width: 300px;
        height: 200px;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        border-radius: 8px;
        transition: transform 1s ease-in-out;
        background: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        img{
            height: calc(100% - 20px);
        }
    }
}
</style>