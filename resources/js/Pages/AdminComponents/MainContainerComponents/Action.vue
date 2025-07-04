<script setup>
import {Head} from "@inertiajs/vue3";
import {computed, onMounted, ref} from "vue";
import { ChevronUpIcon } from '@heroicons/vue/16/solid'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { ChevronUpDownIcon } from '@heroicons/vue/16/solid'
import { CheckIcon } from '@heroicons/vue/20/solid'
import MarkdownIt from "markdown-it";
import markdownItMark from "markdown-it-mark";

const emit = defineEmits(['createNew', 'againGetContent', 'activeRightBar', 'updateRightBar', 'update', 'del'])
const props = defineProps({
    content: Object,
    activeRight: Boolean
})

const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: true
}).use(markdownItMark)

const renderMarkdown = (text) => {
    return typeof text === 'string' ? md.render(text) : '';
}


const openMenuIndex = ref(false);
const visible = ref(false);
const isDropdownOpen = ref(false)
const selectedSpecialization = ref(null)

const typeSort = [
    {id: 1, category:'date', name: 'По дате изменения', type: 2},
    {id: 2, category:'date', name: 'По дате изменения', type: 1},
    {id: 3, category:'action', name: 'По названию действия', type: 2},
    {id: 4, category:'action', name: 'По названию действия', type: 1},
    {id: 5, category:'points', name: 'По очкам', type: 2},
    {id: 6, category:'points', name: 'По очкам', type: 1}
]

const sort = ref(typeSort[0])

const searchInput = ref('');

const activeRightBar = (card) =>{
    openMenuIndex.value !== false ? openMenuIndex.value = false : '';
    if (props.activeRight === true){
        emit('updateRightBar', card.id);
    }else{
        emit('activeRightBar', card.id)
    }
}

const contentComputed = computed(() => {
    let filtered = props.content;

    // Фильтрация
    if (searchInput.value.trim()) {
        filtered = filtered.filter(item =>
            item.action.toLowerCase().includes(searchInput.value.toLowerCase())
        );
    }

    // Сортировка
    if (sort.value.category === 'points') {
        filtered = [...filtered].sort((a, b) => {
            const result = a.points - b.points;
            return sort.value.type === 1 ? result : -result;
        });
    }else if (sort.value.category === 'action') {
        filtered = [...filtered].sort((a, b) => {
            const result = a.action.localeCompare(b.name);
            return sort.value.type === 1 ? result : -result;
        });
    } else if (sort.value.category === 'date') {
        filtered = [...filtered].sort((a, b) => {
            const result = new Date(a.updated_at) - new Date(b.updated_at);
            return sort.value.type === 1 ? result : -result;
        });
    }

    return filtered;
});
const create = () =>{
    emit('createNew', 'Action')
}
const update = (item) =>{
    emit('update', item, 'Action')
    openMenuIndex.value = false;
}
const del = (item) =>{
    emit('del', item, 'Action')
    openMenuIndex.value = false;
}

onMounted(() => {
    setTimeout(() => visible.value = true, 200)
})
</script>


<template>
    <Head title='"Специальности"'/>
    <div class="w-full h-max relative flex flex-col gap-4">
        <h2 class="ms-8 font-bold text-4xl w-full text-gray-800">Карточки "Действия"</h2>
        <div class="w-full h-max bg-white rounded-xl px-8 py-12 mt-10">
            <div class="flex justify-between border-b-2 border-gray-200 pb-6">
                <div class="flex w-max cursor-pointer hover:bg-fuchsia-200 justify-center items-center gap-2 rounded-full px-4 bg-gray-200" @click="create">
                    <svg width="18px" height="18px" class="" viewBox="0 0 24 24" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 6V18" stroke="black" stroke-width="1.6" stroke-linecap="round" class="my-path">
                        </path>
                        <path d="M18 12H6" stroke="black" stroke-width="1.6" stroke-linecap="round" class="my-path">
                        </path>
                    </svg>
                    <p class="text-sm -ms-1 -mb-0.5 font-medium">Добавить карточку "Действия"</p>
                    <ChevronUpIcon class="col-start-1 row-start-1 size-4 mt-0.5 self-center justify-self-end text-gray-500 sm:size-4 rotate-180" aria-hidden="true"/>
                </div>

                <div :class="activeRight ? 'w-3/12 g' : 'w-7/12'" class="flex items-center gap-2 bg-gray-200 px-4 placeholder-gray-600 rounded-full">
                    <img :src="'/images/Search.svg'" class="w-4 h-4" alt="Загрузка">
                    <input v-model="searchInput"
                           class="roboto bg-gray-200 text-base outline-0 focus:outline-0 border-none w-full"
                           placeholder="Искать..."
                           type="text">
                </div>

                <Listbox as="div" class="w-[19.5rem]" v-model="sort">
                    <div class="relative">
                        <ListboxButton class="flex justify-between border border-gray-800 w-full cursor-default rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                            <div class="flex items-center gap-1">
                                <span class="flex items-center">
                                    <span class="roboto block text-base truncate">Сортировка: <span class="roboto ms-1 text-base font-medium">{{ sort.name }}</span></span>
                                </span>
                                <svg v-if="sort.type === 1" width="20px" height="20px" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.93866 9.12287L12 3.06152L18.0613 9.12287" stroke="black" stroke-width="1.6"
                                          stroke-linecap="round" stroke-linejoin="round" class="my-path"></path>
                                    <path d="M12 21.0615L12 3.06152" stroke="black" stroke-width="1.6" stroke-linecap="round"
                                          class="my-path"></path>
                                </svg>
                                <svg v-else width="20px" height="20px" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.0613 15L12 21.0613L5.93866 15" stroke="black" stroke-width="1.6"
                                          stroke-linecap="round" stroke-linejoin="round" class="my-path"></path>
                                    <path d="M12 3.06152L12 21.0615" stroke="black" stroke-width="1.6" stroke-linecap="round"
                                          class="my-path"></path>
                                </svg>
                            </div>
                            <ChevronUpDownIcon class="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4" aria-hidden="true" />
                        </ListboxButton>
                        <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
                            <ListboxOptions class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white text-base ring-1 ring-black/5 focus:outline-hidden sm:text-sm">
                                <ListboxOption as="template" v-for="sorting in typeSort" :key="sorting.id" :value="sorting" v-slot="{ active, selected }">
                                    <li :class="[active ? 'bg-indigo-300 text-white outline-hidden' : 'text-gray-900', 'relative cursor-default py-2 pr-9 pl-3 select-none']">
                                        <div class="flex items-center">
                                            <span :class="[selected ? 'font-semibold' : 'font-normal', 'roboto ml-3 block truncate']">{{ sorting.name }}</span>
                                        </div>
                                        <span v-if="selected" :class="[active ? 'text-white' : 'text-indigo-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                                            <CheckIcon class="size-5" aria-hidden="true" />
                                        </span>
                                    </li>
                                </ListboxOption>
                            </ListboxOptions>
                        </transition>
                    </div>
                </Listbox>
            </div>

            <div class="mt-10">
                <div v-if="content === null" class="inset-0 flex justify-center items-center bg-white bg-opacity-70 z-10">
                    <svg class="animate-spin h-8 w-8 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z" />
                    </svg>
                </div>

                <!-- 🧩 Контент -->
                <div v-else class="w-full">
                    <div v-if="content.length === 0">
                        <h2 class="font-bold text-lg text-gray-600 text-center">В данный момент не создано ни одной карточки "действия"</h2>
                    </div>
                    <div v-else-if="contentComputed.length === 0 && content.length !== 0">
                        <h2 class="font-bold text-lg text-gray-600 text-center">Не найдено ни одного совпадения</h2>
                    </div>
                    <table v-else class="shadow-xl rounded-xl w-full text-left border-gray-800 table-auto border-collapse">
                        <thead>
                        <tr class="bg-gray-700 text-xl">
                            <th class="roboto font-normal w-6/12 text-white rounded-ss-xl px-5 py-4">Действие</th>
                            <th class="roboto font-normal w-2/12 text-white px-5 py-4">Кол-во очков</th>
                            <th class="roboto font-normal w-3/12 text-white px-5 py-4">Последнее изменение</th>
                            <th class="roboto font-normal w-1/12 text-white rounded-se-xl px-5 py-4"></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item, index) in contentComputed" :key="item.id" :class="index % 2 === 1 ? 'bg-gray-200' : 'bg-white'" @click="activeRightBar(item)" class="rounded cursor-pointer hover:bg-fuchsia-300 transition-all duration-300 ease-in-out">
                            <td :class="index + 1 === contentComputed.length ? 'rounded-es-xl' : ''" class="border-gray-800 px-2 py-1">
                                <div class="prose prose-lg scroll-container overflow-y-scroll mt-1 max-h-[8rem] p-2 rounded break-words max-w-none" v-html="renderMarkdown(item.action)"></div>
                            </td>

                            <td class="border-gray-800 px-5 py-1">
                                <h2 class="text-lg font-bold text-gray-800">{{item.points}}</h2>
                            </td>

                            <td class="px-2 py-1">
                                <h2 class="text-lg font-bold text-gray-800">
                                    {{ new Date(item.updated_at).toLocaleString('ru-RU', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'})
                                    }}
                                </h2>
                            </td>

                            <td :class="index + 1 === contentComputed.length ? 'rounded-ee-xl' : ''" class="text-right relative px-3 py-1">
                                <button @click.stop="() => {openMenuIndex !== index ?  openMenuIndex = index: openMenuIndex = null}" class="p-0.5 px-3 rounded hover:bg-gray-100 font-black text-xl">
                                    ⋮
                                </button>

                                <!-- Dropdown -->
                                <div :class="openMenuIndex === index ? 'block' : 'hidden'" class="absolute transition-all duration-500 right-0 border border-gray-800 mt-2 w-40 bg-white rounded-md z-10">
                                    <ul class="">
                                        <!--<li class="px-4 py-2 text-gray-900 text-base font-medium hover:bg-blue-200 cursor-pointer rounded-t-md">Переименовать</li>-->
                                        <li @click.stop="update(item)" class="roboto border-b border-gray-800 px-4 py-2 text-gray-900 text-base font-medium hover:bg-yellow-200 cursor-pointer rounded-t-md">Изменить</li>
                                        <li @click.stop="del(item)" class="roboto border px-4 py-2 text-gray-900 text-base font-medium hover:bg-red-200 cursor-pointer rounded-b-md">Удалить</li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
::v-deep(.prose del),
::v-deep(.prose s){
    text-decoration: line-through;
}

.scroll-container {
    overflow-y: auto;
    scrollbar-width: thin;         /* Firefox */
    scrollbar-color: #1a2738 transparent; /* Firefox */
}

/* WebKit-стилизация (Chrome, Safari, Edge) */
.scroll-container::-webkit-scrollbar {
    width: 4px;
}

.scroll-container::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 2px;
}

.scroll-container::-webkit-scrollbar-thumb {
    background-color: #1f2937;
    border-radius: 4px;
    border: 1px solid #f0f0f0;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
    background-color: #1f2937;
}

.scroll-container::-webkit-scrollbar-thumb {
    transition: background-color 0.3s ease;
}

.roboto{
    font-family: 'RobotoCondensed', sans-serif;
}
</style>
