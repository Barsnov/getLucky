<script setup>
import {computed, ref} from "vue";

const emit = defineEmits(['closeRight'])

const props = defineProps({
    card: Object,
    activeCard: String
});

const active = ref(false);
const update = ref(false);
const content = ref(null);
const timer = ref(null);

const activeRight = () => {
    active.value = true
    timer.value = setTimeout(()=>{
        content.value = props.card;
        update.value = true;
    }, 500)
}

const closeRight = () => {
    active.value = false
    update.value = false
    content.value = null;
    emit('closeRight')
}

const updateRight = () => {
    update.value = false;
    clearTimeout(timer.value);
    timer.value = setTimeout(()=>{
        content.value = props.card;
        update.value = true;
    }, 800)
}

defineExpose({
    activeRight,
    updateRight,
    closeRight
});
</script>

<template>
    <div :class="[active ? 'right-0' : activeCard === 'Lucky' ? '-right-[56rem]' : activeCard === 'Action' ? '-right-[46rem]' : '-right-[34rem]',
        activeCard === 'Lucky' ? 'w-5/12' : activeCard === 'Action' ? 'w-4/12' : 'w-3/12']"
         class="bg-white scroll-container scroll-smooth py-8 shadow-lg transition-all duration-500 z-10 overflow-hidden fixed top-0 h-full">
        <div :class="['z-10 absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out transform', update ? 'opacity-0 scale-0' : 'opacity-100 scale-100']">
            <svg class="animate-spin h-8 w-8 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z" />
            </svg>
        </div>

        <div :class="active && update ? 'opacity-100 flex flex-col gap-8' : 'hidden opacity-0'" class="transition-all duration-500">
            <div class="border-b-2 border-gray-400 pb-4 px-4">
                <div @click="closeRight" class="cursor-pointer">
                    <img alt="" class="w-8 h-8 -scale-x-100" :src="'/images/Back_arrow.png'">
                    {{ activeCard }}
                </div>
            </div>

            <div class="px-4">
                <div class="">
                    <h2 v-if="activeCard === 'Specialization'" class="text-2xl font-bold text-gray-800 mb-2">Специальность: {{ content?.name }}</h2>
                    <h2 v-if="activeCard === 'Lucky'" class="text-2xl font-bold text-gray-800 mb-2">Карточка "Удачи"</h2>
                    <h2 v-if="activeCard === 'Action'" class="text-2xl font-bold text-gray-800 mb-2">Карточка "Действия"</h2>
                    <h2 v-if="activeCard === 'TF'" class="text-2xl font-bold text-gray-800 mb-2">Карточка "Правда или Ложь"</h2>
                    <h2 v-if="activeCard === 'Decide'" class="text-2xl font-bold text-gray-800 mb-2">Карточка "Решай-ка"</h2>
                    <p v-if="activeCard === 'Specialization'" class="text-gray-600 text-sm">
                        Тип генерации: {{ content?.method === 0 ? 'Из базы' : 'Генеративный' }}
                    </p>
                    <p v-if="activeCard === 'Lucky'" class="text-gray-600 text-sm">
                        Количество очков: {{ content?.points }}
                    </p>
                </div>

                <div class="mt-4">
                    {{ content }}
                </div>
            </div>
        </div>
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
