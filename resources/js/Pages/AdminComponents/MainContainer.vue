<script setup>
import {ref, computed} from "vue";

import Action from "./MainContainerComponents/Action.vue";
import Decide from "./MainContainerComponents/Decide.vue";
import Found from "./MainContainerComponents/Found.vue";
import Lucky from "./MainContainerComponents/Lucky.vue";
import Question from "./MainContainerComponents/Question.vue";
import TF from "./MainContainerComponents/TF.vue";
import Word from "./MainContainerComponents/Word.vue";
import Specialization from "./MainContainerComponents/Specialization.vue";

const component = ref();
const visibleMain = ref(true);
const activeRight = ref(false);

const props = defineProps({
    activeCard: String,
    content: Object
})

const emit = defineEmits([
    'createNew',
    'againGetContent',
    'activeRightBar',
    'updateRightBar',
    'update',
    'del',
])

const createNew = (value) => {
    emit('createNew', value)
}

const closeRight = () => {
    activeRight.value = false;
}

const activeRightBar = (card) => {
    activeRight.value = true;
    emit('activeRightBar', card)
}

const update = (item, value) => {
    emit('update', item, value)
}

const del = (item, value) => {
    emit('del', item, value)
}

const updateRightBar = (card) => {
    emit('updateRightBar', card)
}

const againGetContent = () => {
    emit('againGetContent')
}

const timer = ref();

const componentsMap = {
    Action: Action,
    Decide: Decide,
    Found: Found,
    Lucky: Lucky,
    Question: Question,
    TF: TF,
    Word: Word,
    Specialization: Specialization
}

const closeMain = () => {
    clearTimeout(timer.value);
    visibleMain.value = false;
    timer.value = setTimeout(() => {visibleMain.value = true;}, 500)
}

defineExpose({
    closeRight,
    closeMain
})

const activeComponent = computed(()=> componentsMap[props.activeCard] || null)
</script>

<template>
    <div :class="[
    activeRight ? '' : 'w-full',
    activeCard === 'TF' ? 'w-8/12' :
    activeCard === 'Lucky' ? 'w-6/12' :
    activeCard === 'Action' ? 'w-7/12' : 'w-8/12',
    visibleMain ? 'opacity-100' : 'opacity-0',
    'transition-all duration-500 overflow-x-hidden scroll-container p-8'
  ]"
         class="transition-all duration-500 overflow-x-hidden scroll-container p-8">
        <component ref="component" :activeRight="activeRight" :is="activeComponent"
                   @updateRightBar="updateRightBar" @activeRightBar="activeRightBar"
                   @againGetContent="againGetContent" :content="content" @createNew="createNew"
                   @update="update"
                   @del="del"
        ></component>
    </div>
</template>

<style scoped>
.scroll-container {
    overflow-y: auto;
    scrollbar-width: thin;         /* Firefox */
    scrollbar-color: #1f2937 #f0f0f0; /* Firefox */
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
    background-color: #1f2937;
    border-radius: 8px;
    border: 2px solid #f0f0f0;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
    background-color: #1f2937;
}

.scroll-container::-webkit-scrollbar-thumb {
    transition: background-color 0.3s ease;
}
</style>
