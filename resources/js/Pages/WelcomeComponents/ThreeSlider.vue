<template>
    <Head title="Название игрушки (либо мб ход команд описывать?)"/>
    <!--Нужно описать загрузку самой карты в случае если я буду генерировать вопросы-->
    <div ref="load" class="w-screen h-screen" style="opacity: 0; transition: 1s">
        <loading :questions="questions" @nextPage="nextPage" :players="players" :specialization="specialization" :progress="progress"></loading>
    </div>
</template>

<script>
import {Head} from "@inertiajs/vue3";
import Loading from "./Loading.vue";
import axios from 'axios'

export default {
    components: {Loading, Head},
    emits: ['nextPage'],
    name: "Game",
    props:{
        players:{
            type: Number,
            default: 2,
            required: true
        },
        specialization:{
            type: Object,
            default: ()=>({}),
            required: true
        }
    },

    data() {
        return {
            isLoading: true,
            progress: 0,
            questions: null,
            generatedQuestions: []
        }
    },

    methods: {
        async loadGeneratedQuestions() {
            const minQuestions = 10
            let loaded = 0

            while (this.generatedQuestions.length < minQuestions) {
                try {
                    const res = await axios.get("http://192.168.100.183:8000/generate", {
                        params: { specialization: this.specialization.name }
                    })
                    console.log(res.data.question)
                    res.data.question = res.data.question?.split('```')[1]
                    console.log(res.data.question)
                    const data = JSON.parse(res.data.question)

                    this.generatedQuestions.push(data)
                    loaded++
                    this.progress = Math.floor((loaded / minQuestions) * 100)
                } catch (error) {
                    console.error('Ошибка генерации вопроса:', error)
                    break
                }
            }

            // После загрузки первых вопросов
            this.questions = this.generatedQuestions[0]
            this.isLoading = false
        },

        nextPage(){
            this.$emit('nextPage')
        }
    },


    mounted() {
        setTimeout(()=>{
            this.$refs.load.style.opacity = '1';
            if (this.specialization.method === 0) {
                // Табличные категории — загружаем быстро
                axios.get(`/questions/get/${this.specialization.id}`)
                    .then(res => {
                        this.questions = res.data
                        setInterval(()=>{this.progress < 100 ? this.progress ++ : ''}, 100)
                        this.isLoading = false
                    })
                    .catch(() => {
                        this.isLoading = false
                    })
            } else {
                // Генерация — прогресс загрузки
                this.loadGeneratedQuestions()
            }
        }, 1000)
    },
}
</script>

<style scoped>

</style>
