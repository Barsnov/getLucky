<script setup>
import Action from "./QuestionComponents/Action.vue";
import Decide from "./QuestionComponents/Decide.vue";
import Lucky from "./QuestionComponents/Lucky.vue";
import Question from "./QuestionComponents/Question.vue";
import TF from "./QuestionComponents/TF.vue";
import {computed} from "vue";

const componentsMap = {
    action: Action,
    decide: Decide,
    lucky: Lucky,
    cardQuestion: Question,
    tf: TF,
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

const closeQuestion = (bool, points) =>{
    emit('closeQuestion', bool, points)
}

const closeQuestionForUpHex = (bool, points) =>{
    emit('closeQuestionForUpHex', bool, points)
}

const questionKey = computed(() => `${props.question?.category}-${props.question?.id || Date.now()}`)

const activeComponent = computed(()=> componentsMap[props.question?.category] || null)
</script>

<template>
    <component :forUpHex="forUpHex" :key="question.id || questionKey" @closeQuestionForUpHex="closeQuestionForUpHex" @closeQuestion="closeQuestion" :question="question" :visibleQuestion="visibleQuestion" :is="activeComponent"></component>
</template>
