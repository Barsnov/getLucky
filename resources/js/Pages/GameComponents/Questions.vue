<script setup>
import MarkdownIt from "markdown-it";
import markdownItMark from "markdown-it-mark";
import {ref} from "vue";

import Action from "./QuestionComponents/Action.vue";
import Decide from "./QuestionComponents/Decide.vue";
import Found from "./QuestionComponents/Found.vue";
import Lucky from "./QuestionComponents/Lucky.vue";
import Question from "./QuestionComponents/Question.vue";
import Specialization from "./QuestionComponents/Specialization.vue";
import TF from "./QuestionComponents/TF.vue";
import Word from "./QuestionComponents/Word.vue";
import {computed} from "vue";

const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: true
}).use(markdownItMark)
const renderMarkdown = (text) => {
    return typeof text === 'string' ? md.render(text) : '';
}

const componentsMap = {
    action: Action,
    decide: Decide,
    found: Found,
    lucky: Lucky,
    cardQuestion: Question,
    TF: TF,
    Word: Word,
    Specialization: Specialization
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
    }
})

const activeComponent = computed(()=> componentsMap[props.question?.category] || null)
</script>

<template>
    <component :is="activeComponent"></component>
</template>

<style scoped>
::v-deep(.prose del),
::v-deep(.prose s){
    text-decoration: line-through;
}

.prose *{
    font-family: 'RobotoCondensed', sans-serif;
    font-size: 1.9rem;
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
