<script setup>
import {computed, ref, toRaw, unref, watch} from "vue";
import MarkdownIt from "markdown-it";
import markdownItMark from "markdown-it-mark";

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
    question: {
        type: Object,
        required: true,
        default: []
    },

    visibleFight: {
        type: Boolean,
        required: true,
        default: false
    },
    attacker: Object,
    defender: Object,
})

const emit = defineEmits([
    'gameOver'
])

const phase = ref('prepare') // prepare | input | bonus | end
const timer = ref(60) // seconds
const interval = ref()

const continueGame = ref(false)
const inputWord = ref('');
const team1Words = ref([]);
const errorMessage = ref('');
const team2Words = ref([]);
const currentTeam = ref(1);

const checkAnswer = ref(false);
const flagButton = ref(false);

const winningTeam = computed(() => {
    if (phase.value !== 'end') return null

    const team1Count = team1Words.value.length
    const team2Count = team2Words.value.length

    if (team1Count > team2Count) return props.attacker
    if (team2Count > team1Count) return props.defender

    return props.defender;
})
const winner = computed(() => {
    if (phase.value !== 'end') return null
    if (team1Words.value.length > team2Words.value.length) return props.attacker.name
    if (team2Words.value.length > team1Words.value.length) return props.defender.name
    return props.defender.name;
})

watch(phase, (newPhase) => {
    if (newPhase === 'end') {
        setTimeout(() => {
            const rawTeam = toRaw(unref(winningTeam))
            emit('gameOver', rawTeam)// объект команды-победителя или null
            clearInterval(interval.value)
            interval.value = null // сбрасываем интервалл
        }, 3000)
    }
})
watch(() => props.visibleFight, (visible) => {
    if (visible === true && props.question.category === 'word') {
        if (interval.value) {
            clearInterval(interval.value)
            interval.value = null
        }
        inputWord.value = ''
        nextPhase('prepare', 60)
        currentTeam.value = 1;
        startTimer()
        team1Words.value = []
        team2Words.value = []
    }
})

const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
}
const phaseLabel = computed(() => {
    switch (phase.value) {
        case 'prepare': return 'Подготовка: думайте над словами!'
        case 'input': return 'Ввод слов по очереди!'
    }
})

const nextPhase = (newPhase, newTime) => {
    phase.value = newPhase
    timer.value = newTime || 0
}
function startTimer() {
    interval.value = setInterval(() => {
        if (timer.value > 0) {
            timer.value--
        } else {
            if (phase.value === 'prepare') {
                nextPhase('input', null)
                clearInterval(interval.value)
            }
        }
    }, 1000)
}
const submitWord = () => {
    const word = inputWord.value.trim().toLowerCase()
    if (!word) return

    const allUsedWords = [...team1Words.value, ...team2Words.value].map(w => w.toLowerCase())
    // Массив допустимых слов из props.question.words (нормализуем в нижний регистр)

    const validWords = props.question.words?.map(w => w.toLowerCase()) || []
    // Проверка: введённое слово есть в списке допустимых?

    if (!validWords.includes(word)) {
        errorMessage.value = 'Такого слова нет в списке допустимых.'
        return
    }
    // Проверка: слово уже использовалось?
    if (allUsedWords.includes(word)) {
        errorMessage.value = 'Это слово уже было использовано.'
        return
    }

    if (currentTeam.value === 1) {
        team1Words.value.push(word)
        currentTeam.value = 2
    }else {
        team2Words.value.push(word)
        currentTeam.value = 1
    }

    inputWord.value = ''
    errorMessage.value = ''
}
const addPoints = () => {
    this.$emit('addPoints', this.question.points)
}
const closeFight = (team) => {
    if (flagButton.value) return;
    flagButton.value = true

    emit('gameOver', team)
    setTimeout(()=>{
        continueGame.value = false;
        checkAnswer.value = false;
        errorMessage.value = '';
    }, 1000)
}

const categoryGame = computed(() => {
    switch (props.question?.category) {
        case 'word':
            return 'Словодел'
        case 'cardFound':
            return 'Найди меня!'
        default:
            return 'Определение категории...'
    }
})
</script>

<template>
    <div class="absolute bg-[#bde0ff] w-full h-full flex flex-col justify-center gap-10 transition-all duration-1000"
         :class="visibleFight  ? 'opacity-100 z-40' : 'opacity-0 -z-10'">
        <!--Тип вопроса-->
        <h1 class="absolute text-white left-7 top-12 text-4xl text-center font-medium"
            style="font-family: 'Barboskin', serif">Категория: <span style="font-family: 'Barboskin', serif" class="text-white text-4xl underline-offset-4 underline uppercase">{{ categoryGame }}</span>
        </h1>
        <div class="flex flex-col w-10/12 items-center">
            <div v-if="question.category === 'cardFound'"
                 class="max-w-[95rem] h-max max-h-[60rem] overflow-hidden rounded-2xl flex flex-col items-center gap-4">
                <div class="w-full flex flex-col justify-center items-center">

                    <div class="flex w-full justify-around bg-gray-800 rounded-t-2xl py-3">
                        <h3 :style="`color: ${attacker.color}`" class="barboskin text-5xl text-center uppercase">
                            Атакуют: {{ attacker.name }}</h3>
                        <h3 :style="`color: ${defender.color}`" class="barboskin text-5xl text-center uppercase">
                            Защищаются: {{ defender.name }}</h3>
                    </div>

                    <div v-if="question?.category === 'word' && question?.explanation !== null && checkAnswer"
                         class="w-full prose break-words max-w-none"
                         v-html="renderMarkdown(checkAnswer && question?.category === 'word' ? question?.explanation : question?.question)">
                    </div>
                    <img v-if="!checkAnswer && question?.category === 'cardFound'"
                         :src="'/storage/' + question.urlQuestion" alt="">
                    <div v-if="checkAnswer" class="w-full flex items-end gap-3">
                        <img v-if="question?.category === 'cardFound'" :src="'/storage/' + question.urlAnswer" alt="">
                    </div>
                </div>
            </div>


            <!--Дуэль со словами-->
            <div v-if="question.category === 'word'"
                 class="p-6 max-w-[95rem] h-[52rem] mb-10 bg-white overflow-hidden rounded-2xl flex flex-row items-center gap-8">
                <!-- Левый столбец — Команда 1 -->
                <div class="w-[30rem] min-h-[50rem] bg-blue-100 p-4 rounded-lg flex flex-col gap-2 overflow-auto">
                    <h3 :style="`color: ${attacker.color}`" class="barboskin text-5xl text-center uppercase">
                        Атакуют:<br> {{ attacker.name }}</h3>
                    <div v-for="(word, index) in team1Words" :key="'t1-' + index"
                         class="barboskin text-center text-3xl p-2 bg-white rounded shadow">
                        {{ word }}
                    </div>
                </div>

                <!-- Центр -->
                <div class="flex py-6 w-[40rem] h-full flex-col justify-between items-center gap-4">
                    <h2 v-if="question?.category === 'word'" class="text-4xl barboskin text-center font-medium">
                        Составьте слова из:<br> <span
                        class="text-7xl tracking-wide font-bold barboskin">{{ question.word }}</span></h2>
                    <div class="flex flex-col items-center gap-10">
                        <div class="flex flex-col items-center gap-4">
                            <div class="text-7xl text-gray-900 barboskin">{{ formatTime(timer) }}</div>
                            <h1 class="text-4xl barboskin text-gray-900 font-bold text-center">{{ phaseLabel }}</h1>
                        </div>
                        <input :class="phase === 'input' ? 'opacity-100' : 'opacity-0'" v-model="inputWord"
                               @keydown.enter.prevent="submitWord" placeholder="Введите слово"
                               class="barboskin border-2 transition-all duration-500 border-gray-900 px-4 py-2 rounded w-[30rem] text-3xl"/>
                        <p v-if="errorMessage" class="text-3xl barboskin text-wrap text-center text-red-500 mt-1">
                            {{ errorMessage }}</p>

                        <template v-if="winner">
                            <h2 class="text-5xl text-center barboskin text-gray-950 mt-10 font-medium">Победили:
                                <span :style="winningTeam !== 'Ничья' ? { color: winningTeam.color } : {}"
                                      :class="[winningTeam === 'Ничья' ? 'text-gray-800' : '', 'barboskin']">{{winner }}</span></h2>
                        </template>
                    </div>
                    <div class="text-gray-500 text-4xl barboskin">
                        Сейчас ходят: {{ currentTeam === 1 ? attacker.name : defender.name }}
                    </div>
                </div>

                <!-- Правый столбец — Команда 2 -->
                <div class="w-[30rem] min-h-[50rem] bg-red-100 p-4 rounded-lg flex flex-col gap-2 overflow-auto">
                    <h3 :style="`color: ${defender.color}`" class="text-center barboskin text-5xl uppercase">
                        Защищают:<br> {{ defender.name }}</h3>
                    <div v-for="(word, index) in team2Words" :key="'t2-' + index"
                         class="barboskin text-center text-3xl p-2 bg-white rounded shadow">
                        {{ word }}
                    </div>
                </div>
            </div>

            <div class="absolute flex items-center gap-16" style="bottom: 2rem;">
                <div :class="!checkAnswer && question.category !== 'word' ? 'opacity-100 relative' : 'opacity-0 absolute -z-10'"
                     class="overflow-hidden bg-gray-600 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                     @click="(() => { checkAnswer = true })" style="cursor: url('/icons/Point.png') 0 0, auto">
                    <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-white">
                        Проверить ответ
                    </h1>
                    <!-- Блик -->
                    <div class="absolute top-0 left-[-50%] w-[100%] h-full bg-white/20 transform rotate-[15deg] scale-150 transition-all blur-sm duration-1000 group-hover:left-[130%] pointer-events-none"></div>
                </div>

                <!-- После проверки: "Пропустить" и "+ Очки" -->
                <template class="flex" v-if="checkAnswer || question.category === 'word'">
                    <div :class="[question.category === 'word' ? (phase === 'input' ? 'opacity-100' : 'opacity-0 absolute -z-10') : 'opacity-100',
                            {
                                'bg-gradient-to-r from-red-500 to-red-300': defender.name === 'Красные',
                                'bg-gradient-to-r from-blue-500 to-blue-300': defender.name === 'Синие',
                                'bg-gradient-to-r from-green-500 to-green-300': defender.name === 'Зелёные',
                                'bg-gradient-to-r from-yellow-500 to-yellow-200': defender.name === 'Жёлтые',
                                'bg-gradient-to-r from-violet-500 to-violet-300': defender.name === 'Фиолетовые',
                            }]"
                         class="relative overflow-hidden bg-pink-500 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                         @click="closeFight(defender)" style="cursor: url('/icons/Point.png') 0 0, auto">
                        <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-gray-950">
                            Победили {{defender.name}}
                        </h1>
                        <!-- Блик -->
                        <div class="absolute top-0 left-[-30%] w-[40%] h-full bg-white/80 transform rotate-[45deg] scale-125 transition-all duration-700 group-hover:left-[90%] pointer-events-none"></div>
                    </div>

                    <div :class="[question.category === 'word' ? (phase === 'input' ? 'opacity-100' : 'opacity-0 absolute -z-10') : 'opacity-100',
                            {
                                'bg-gradient-to-r from-red-500 to-red-300': attacker.name === 'Красные',
                                'bg-gradient-to-r from-blue-500 to-blue-300': attacker.name === 'Синие',
                                'bg-gradient-to-r from-green-500 to-green-300': attacker.name === 'Зелёные',
                                'bg-gradient-to-r from-yellow-500 to-yellow-200': attacker.name === 'Жёлтые',
                                'bg-gradient-to-r from-violet-500 to-violet-300': attacker.name === 'Фиолетовые',
                            }]"
                         class="relative overflow-hidden bg-pink-500 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                         @click="closeFight(attacker)" style="cursor: url('/icons/Point.png') 0 0, auto">
                        <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-gray-950">
                            Победили {{attacker.name}}
                        </h1>
                        <!-- Блик -->
                        <div class="absolute top-0 left-[-30%] w-[40%] h-full bg-white/80 transform rotate-[45deg] scale-125 transition-all duration-700 group-hover:left-[90%] pointer-events-none"></div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
::v-deep(.prose del),
::v-deep(.prose s) {
    text-decoration: line-through;
}

.prose * {
    font-family: 'RobotoCondensed', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    text-align: justify;
}

.scroll-container {
    overflow-y: auto;
    scrollbar-width: thin; /* Firefox */
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
