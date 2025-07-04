<script setup>
import MarkdownIt from "markdown-it";
import markdownItMark from "markdown-it-mark";
import {ref} from "vue";

const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: true
}).use(markdownItMark)
const renderMarkdown = (text) => {
    return typeof text === 'string' ? md.render(text) : '';
}

const props = defineProps({
    question:{
        type: Object,
        required: true,
        default: []
    },

    visibleQuestion:{
        type: Boolean,
        required: true
    },

    forUpHex: Boolean
})

const emit = defineEmits([
    'closeQuestion',
    'closeQuestionForUpHex'
])

const flagButton = ref(false);

const closeQuestion = (bool) =>{
    if (flagButton.value) return;
    flagButton.value = true

    if(props.forUpHex === false){
        emit('closeQuestion', bool, props.question?.points)
    }else{
        emit('closeQuestionForUpHex', bool, props.question?.points)
    }
}
</script>

<template>
    <div class="absolute bg-[#F5F5F5] w-full h-full flex flex-col items-start justify-center gap-10 transition-all duration-300" :class="visibleQuestion ? 'opacity-100 z-30' : 'opacity-0 -z-10'">
        <!--Тип вопроса-->
        <h1 class="absolute text-gray-800 left-7 top-8 text-3xl text-center font-medium" style="font-family: 'Barboskin', serif">
            Категория:
            <span style="font-family: 'Barboskin', serif" class="text-gray-900 font-bold text-4xl underline-offset-4 underline uppercase">Карточка "Действия"</span>
        </h1>

        <div class="w-10/12 flex flex-col items-center justify-center gap-1">
            <div class="prose prose-lg border-black/80 bg-gray-100 border-[.2rem] px-5 py-3 rounded-sm break-words max-w-none" v-html="renderMarkdown(question.action)"></div>
            <div style="font-family: 'Barboskin', sans-serif" class="w-max rounded-sm py-1 px-4 text-white text-2xl font-medium bg-black/80 prose break-words text-center">
                {{question.points}} очков
            </div>
        </div>

        <div class="flex w-10/12 justify-center">
            <transition name="fade">
                <div class="absolute flex items-center gap-16" style="bottom: 2rem;">
                    <!-- После проверки: "Пропустить" и "+ Очки" -->
                    <div class="flex items-center gap-16">
                        <div class="bg-gray-600 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4"
                             @click="closeQuestion(false)"
                             style="cursor: url('/icons/Point.png') 0 0, auto">
                            <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-white">Команда не выполнила действие</h1>
                        </div>
                        <div class="bg-pink-500 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4"
                             @click="closeQuestion(true)"
                             style="cursor: url('/icons/Point.png') 0 0, auto">
                            <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-white">Команда выполнила действие</h1>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<style scoped>
::v-deep(.prose del),
::v-deep(.prose s){
    text-decoration: line-through;
}

.prose *{
    font-family: 'RobotoCondensed', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    text-align: justify;
}

.scroll-container {
    overflow-y: auto;
    scrollbar-width: thin;         /* Firefox */
    scrollbar-color: white transparent; /* Firefox */
}

/* WebKit-стилизация (Chrome, Safari, Edge) */
.scroll-container::-webkit-scrollbar {
    width: 8px;
}

.scroll-container::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 8px;
}

.scroll-container::-webkit-scrollbar-thumb {
    background-color: white;
    border-radius: 8px;
    border: 2px solid #f0f0f0;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
    background-color: white;
}

.scroll-container::-webkit-scrollbar-thumb {
    transition: background-color 0.3s ease;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
.fade-enter-to, .fade-leave-from {
    opacity: 1;
}
</style>
