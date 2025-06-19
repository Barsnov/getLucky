<template>
    <Head title="Начальная"/>
    <div ref="background" @click="next === true ? swiperNext() : ''" class="relative w-screen h-screen"
         :class="opacityGame ? 'opacity-100' : 'opacity-0'"
         style="transition: 2s; cursor: url('/icons/Default.png') 0 0, auto">
        <div class="h-screen w-screen backdrop-blur overflow-hidden">
            <BackScene/>
        </div>

        <h2 v-if="spaOne" class="absolute z-50 bottom-10 left-1/2 text-white underline text-3xl tracking-wider"
            ref="continueGame" style="transform: translate(-50%, 50%); opacity: 0; font-family: 'Barboskin', sans-serif; text-shadow: 0 0 .2rem #fff">
            Нажмите, чтобы продолжить</h2>
        <swiper
            direction="vertical"
            :mousewheel="false"
            :speed="2000"
            :allowTouchMove="false"
            class="w-screen left-0 top-0 h-screen absolute z-20"
            @swiper="onSwiperOne">
            <swiper-slide>
                <OneSlider/>
            </swiper-slide>
            <swiper-slide>
                <TwoSlider @startGame="startGame" :specializations="specializations"/>
            </swiper-slide>
            <swiper-slide>
                <ThreeSlider @nextPage="nextPage" v-if="threeSlide" :players="players" :specialization="specialization" />
            </swiper-slide>
        </swiper>
    </div>
</template>

<script setup>
    import OneSlider from './WelcomeComponents/OneSlider.vue';
    import TwoSlider from './WelcomeComponents/TwoSlider.vue';
    import ThreeSlider from './WelcomeComponents/ThreeSlider.vue';
    import BackScene from "./WelcomeComponents/BackScene.vue";
    import {Head} from '@inertiajs/vue3'
    import { Swiper, SwiperSlide } from 'swiper/vue';
    import 'swiper/css';
    import 'swiper/css/navigation';
    import 'swiper/css/pagination';
    import 'swiper/css/a11y';
</script>

<script>
    import {Howl} from "howler";

    export default{
        props:{
            specializations:{
                type: Object,
                required: true,
            }
        },
        data(){
            return{
                opacityGame: false,
                swiperOne: '',
                next: false,
                spaOne: true,

                //Третий слайдер
                threeSlide: false,
                players: 0,
                specialization: null,

                volumeSound: 0.02,
                currentSound: null,
                playList: null,
                timer: null,
            }
        },
        methods:{
            onSwiperOne(swiper){
                this.swiperOne = swiper;
            },

            swiperNext(){
                this.next = false;
                this.swiperOne.slideNext()
                setTimeout(()=>{this.spaOne = false}, 700)
                this.$refs.background.classList.remove('point')
                this.playWhoosh()
            },

            startGame(players, specialization){
                clearInterval(this.timer)
                this.timer = setInterval(()=>{
                    if(this.volumeSound > 0.02){
                      this.volumeSound -= .01
                    }else{
                        clearInterval(this.timer)
                    }
                    this.playList.volume(this.volumeSound)
                }, 1000)
                this.playWhoosh()
                this.swiperOne.slideNext();
                this.players = players
                this.specialization = specialization
                this.threeSlide = true
            },

            nextPage(){
                this.playList.volume(0)
                this.playList.stop() // полная остановка
            },

            playPlaylist () {
                this.playList = new Howl({
                    src: ['/sounds/Elevator-music.mp3'],
                    volume: this.volumeSound,
                    loop: true
                })

                this.playList.play()
                this.timer = setInterval(()=>{
                    if(this.volumeSound < 0.2){
                      this.volumeSound += .01
                    }else{
                        clearInterval(this.timer)
                    }
                    this.playList.volume(this.volumeSound)
                }, 500)
            },

            stopPlaylist() {
                if (this.playList) {
                    this.playList.stop()
                    clearInterval(this.timer) // если нужно остановить и плавное увеличение громкости
                }
            },

            playWhoosh(){
                this.currentSound = new Howl({
                    src: ['/sounds/WhooshCamera.mp3'],
                    volume: 0.3,
                })

                this.currentSound.play()
            }
        },
        mounted() {
            setTimeout(()=>{
                this.opacityGame = !this.opacityGame
                setTimeout(()=>{
                    this.$refs.continueGame.style.transition = '1s'
                    this.$refs.continueGame.style.opacity = '1'
                    this.$refs.background.classList.add('point')
                    this.playPlaylist()
                    setTimeout(()=>{
                        this.$refs.continueGame?.classList.add('continueGame')
                    }, 1000)
                    this.next = !this.next
                }, 2000);
            }, 2000);
        }
    }
</script>

<style>
    .continueGame{
        animation: animateContinue 1.5s alternate infinite ease-in-out;
    }
    .point{
        cursor: url('/icons/Point.png') 5 0, auto !important;
    }
    @keyframes animateContinue{
        0%{
            opacity: 1;
        }

        100%{
            opacity: 0.2;
        }
    }
</style>
