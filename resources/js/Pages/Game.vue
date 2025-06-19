<template>
    <Head title="Мистерия"/>
    <div ref="game" @click="startGame" class="w-screen h-screen overflow-hidden relative" :style="!selectCard ? `cursor: url('/icons/Point.png') 0 0, auto` : `cursor: url('/icons/Default.png') 0 5, auto`"
         :class="opacityGame ? 'opacity-100' : 'opacity-0'" style="transition: 2s">
        <!--Игровое поле-->
        <game-u-i @hexStatsUpdate="hexStatsUpdate" @getFight="getFight" @getQuestion="getQuestion" ref="gameUI" :highlightedIndex="highlightedIndex"
                  :startGameIf="startGameIf" @update-current-player="updateCurrentPlayer" :players="players"></game-u-i>
        <!--Дуэль-->
        <Fight :attacker="attacker" :defender="defender" @gameOver="FightOver" :question="question" :visibleFight="visibleFight"/>
        <!--Вопросы действия задачки-->
        <Questions ref="questions" @addPoints="addPoints" @closeQuestion="closeQuestion" :question="question" :visibleQuestion="visibleQuestion"/>
        <!--Карточки выбора очерёдности-->
        <div :class="visibleCard ? 'opacity-100 z-50' : 'opacity-0 -z-10'"
             class="w-max absolute flex flex-col items-center gap-20 top-1/2 left-1/2 transition-all duration-1000" style="transform: translate(-50%, -50%)">
            <h1 class="text-center font-black text-5xl uppercase" style="font-family: 'Barboskin', serif; top: -5rem; color: #a6ffed;">
                Игру начинают <span style="font-family: 'Barboskin', serif" :style="startPlayers ? activeCards[highlightedIndex]?.color :
                 'color: #a6ffed'">{{startPlayers === false ? '. . .' : activeCards[highlightedIndex].name}}</span>
            </h1>
            <div class="flex gap-10">
                <div
                    v-for="(player, index) in activeCards"
                    :key="player.id"
                    class="relative transition-all duration-300"
                    :class="{
                    'scale-110 drop-shadow-[0_0_.3rem_#ffffff]': highlightedIndex === index,
                    'opacity-50': finalIndex !== null && finalIndex !== index
                   }"
                >
                    <img :src="player.svg" alt="" class="" style="width: 19rem"/>
                </div>
            </div>
        </div>
        <!--Активная фишка?-->
        <div :class="startGameIf ? 'opacity-100' : 'opacity-0'" class="transition-all text-4xl duration-1000 absolute top-12 left-1/2 text-white z-30"
             style="transform: translate(-50%); font-family: 'Barboskin', serif">
            Ходят:
            <span class="" v-if="currentPlayer" :style="{ color: currentColor }" style="font-family: 'Barboskin', serif">
                {{ currentPlayer.name }}
            </span>
            <span v-else>
                ...
            </span>
        </div>
        <!--Лидер борд-->
        <Leaderboard ref="lead" v-if="startGameIf" :hexStatsByPlayer="hexStatsByPlayer" :pointsPayload="pointsPayload" :players="players"/>
        <!--Лого-->
        <Link class="absolute left-4 top-4 w-[7rem] z-20 ms-3 text-white" href="/"><img class="text-white cursor-pointer" :src="'/images/Logo_project_white_simple.svg'" alt="project_logo"></Link>
        <!--Таймер + чёрный фон-->
        <div :class="['z-50 transition-all duration-1000 ease-in-out flex items-center justify-center',
         timerGameEnd ? 'fixed top-0 left-0 w-screen h-screen bg-black' : 'absolute top-4 right-4 bg-black/70 rounded-xl p-4',
         timerGameEnd ? 'opacity-100' : 'opacity-0 sm:opacity-100']">
            <h2 style="font-family: 'Barboskin', sans-serif" :class="['text-5xl', timerGameEnd ? 'text-9xl text-white' : 'w-[25rem] text-center', isBlinking ? 'animate-pulse text-red-600' : (remainingTime <= 300 ? 'text-red-500' : 'text-white')]">
                {{ timerGameEnd ? 'Игра окончена!' : `Осталось: ${formatTime(remainingTime)}` }}
            </h2>
        </div>
        <!-- Загрузка результатов -->
        <div v-if="timerGameEnd" class="absolute z-50 left-1/2 mt-40 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
            <div class="w-24 h-24 border-8 border-white border-t-transparent rounded-full animate-spin"></div>
            <div class="mt-4 text-4xl text-white">Загрузка результатов, подождите…</div>
        </div>
        <!--Начало игры-->
        <h1 ref="startGameH1" :class="startGameIf === false ? 'opacity-100' : 'opacity-0'" class="absolute z-50 bottom-10 border-b-2 border-white left-1/2 text-4xl text-white font-bold uppercase"
            style="transform: translate(-50%); transition: 2s; font-family: 'Barboskin', serif">Начать игру</h1>
    </div>
</template>

<script>
import {Head, Link} from "@inertiajs/vue3";
import GameUI from "./GameComponents/GameUI.vue";
import Leaderboard from "./GameComponents/Leaderboard.vue";
import Questions from "./GameComponents/Questions.vue";
import Fight from "./GameComponents/Fight.vue";
import {Howl} from "howler";

export default {
    components: {Link, Questions, Leaderboard, GameUI, Head, Fight},
    name: "Game",
    props:{
        gameReloaded: {
            type: Boolean,
            default: false
        },
        players:{
            type: Number,
            default: 2,
            required: true
        },
        questions:{
            type: Object,
            default: ()=>({}),
            required: true
        }
    },

    data() {
        return {
            opacityGame: false,
            currentPlayer: null,
            currentColor: null,
            startGameIf: false,
            gameIf: false,
            selectingCard: false,

            //Выбор карточки
            interval: null,
            highlightedIndex: null,
            finalIndex: null,
            selectCard: false,
            visibleCard: false,
            cardsPlayers: [
                { id: 1, name: 'Красные', svg: '/images/CardRedChip.png', color: 'color: #ff0000;' },
                { id: 2, name: 'Синие', svg: '/images/CardBlueChip.png', color: 'color: #0000ff;' },
                { id: 3, name: 'Зелёные', svg: '/images/CardGreenChip.png', color: 'color: #00ff00;' },
                { id: 4, name: 'Жёлтые', svg: '/images/CardYellowChip.png', color: 'color: #ffff00;' },
                { id: 5, name: 'Фиолетовые', svg: '/images/CardPurpleChip.png', color: 'color: #AA53CF;' },
            ],
            startPlayers: false,

            //Вопросы
            question: ({}),
            visibleQuestion: false,
            action: [],
            cardFound: [],
            cardQuestion: [],
            decide: [],
            lucky: [],
            tf: [],
            word: [],
            visibleFight: false,
            randomCategory: '',

            attacker: {},
            defender: {},

            //Таймер
            gameStartTime: Date.now(),
            gameDuration: 45 * 60 * 1000, // 30 минут в миллисекундах
            remainingTime: 45 * 60, // в секундах
            timerInterval: null,
            gameOver: false,
            //Очки за клетки
            hexStatsByPlayer: ({}),
            pointsPayload: { playerId: 0, points: 0 }, // { playerId: 3, points: 50 }

            //Конец игры
            timerGameEnd: false,
            isBlinking: false,

            //Звук
            playlist: [
                '/sounds/Sneaky-Snitch.mp3',
                '/sounds/Monkeys.mp3',
                '/sounds/Fluffing-a-Duck.mp3',
                '/sounds/Elevator-music.mp3',
            ],

            volumeBack: 0.1,
            currentIndex: 0,
            currentSound: null,
        }
    },

    methods: {
        updateCurrentPlayer(player){
            this.currentPlayer = player
            this.currentColor = player.color
        },
        startGame(){
            if (this.selectCard === false){
                this.selectCard = !this.selectCard
                this.selectingCard = !this.selectingCard
                this.$refs.startGameH1.style.transition = ".5s"
                this.$refs.startGameH1.style.bottom = "5rem"

                setTimeout(()=>{
                    this.$refs.startGameH1.style.bottom = "-10rem"
                    this.visibleCard = !this.visibleCard
                    setTimeout(()=>{
                        this.startSelectionAnimation()
                        this.$refs.startGameH1.classList.remove('animate-blink')
                    }, 500)
                }, 600)
            }
        },
        startSelectionAnimation(){
            let count = 0
            this.interval = setInterval(() => {
                this.highlightedIndex = count % this.players
                count++

                if (count > 20) { // ~20 шагов "рандома"
                    clearInterval(this.interval)
                    // Выбираем финального игрока
                    this.finalIndex = Math.floor(Math.random() * this.players)
                    this.highlightedIndex = this.finalIndex
                    this.startPlayers = !this.startPlayers
                    // Через 1.5с убираем анимацию
                    setTimeout(() => {
                        this.visibleCard = !this.visibleCard
                        this.selectingCard = !this.selectingCard
                        this.startGameIf = true
                    }, 1000)
                }
            }, 200)
        },
        //Логика с вопросами
        getQuestion(){
            this.visibleQuestion = !this.visibleQuestion
            this.getRandomQuestion();
        },
        getRandomQuestion() {
            const categoryWeights = {
                lucky: 0.05,           // 5%
                action: 0.2375,
                questions: 0.2375,
                tf: 0.2375,
                decide: 0.2375
            }

            const categories = ['decide', 'tf', 'questions', 'action', 'lucky']

            // Проверка: остались ли вообще вопросы?
            const availableCategories = categories.filter(cat => this[cat] && this[cat].length > 0)
            if (availableCategories.length === 0) {
                console.warn('Все категории пусты — вопросов больше нет.')
                this.question = null
                return
            }

            // Взвешенный выбор категории
            const filteredWeights = availableCategories.map(cat => categoryWeights[cat] || 0)
            const totalWeight = filteredWeights.reduce((a, b) => a + b, 0)
            let rand = Math.random() * totalWeight

            let selectedCategory = null
            for (let i = 0; i < availableCategories.length; i++) {
                rand -= filteredWeights[i]
                if (rand <= 0) {
                    selectedCategory = availableCategories[i]
                    break
                }
            }

            // Безопасная проверка
            if (!selectedCategory || !this[selectedCategory] || this[selectedCategory].length === 0) {
                console.warn('Не удалось выбрать категорию или она пуста.')
                this.question = null
                return
            }

            const categoryArray = this[selectedCategory]
            const randomIndex = Math.floor(Math.random() * categoryArray.length)

            this.question = categoryArray[randomIndex]
            this.question.category = selectedCategory
            this.randomCategory = selectedCategory

            // Удаляем вопрос
            this[selectedCategory].splice(randomIndex, 1)
        },
        addPoints(playerId, points) {
            this.pointsPayload = { playerId, points };
            setTimeout(() => {
                this.pointsPayload = null; // сброс, чтобы снова сработал watch
            }, 1000);
        },
        closeQuestion(bool, point){
            this.visibleQuestion = !this.visibleQuestion
            if(bool){
                this.addPoints(this.currentPlayer.id, point); // Победителю — очки
            }
            this.$refs.gameUI.nextPlayerTurn();
        },
        splitQuestions(questions){
            this.action = questions.action || [];
            this.cardFound = questions.found || [];
            this.cardQuestion = questions.questions || [];
            this.decide = questions.decide || [];
            this.lucky = questions.lucky || [];
            this.tf = questions.tf || [];
            this.word = questions.word || [];
        },
        //Очки
        hexStatsUpdate(value){
            this.hexStatsByPlayer = value
        },
        //Логика завоевания клеток (дуэль)
        getFight(attacker, defender) {
            this.attacker = {...attacker};
            this.defender = {...defender};
            this.visibleFight = !this.visibleFight
            this.getRandomFight()
        },
        getRandomFight(){
            const categories = ['word', 'cardFound']
            // Проверка: остались ли вообще вопросы?
            const availableCategories = categories.filter(cat => this[cat] && this[cat].length > 0)
            if (availableCategories.length === 0) {
                console.warn('Все категории пусты — вопросов больше нет.')
                this.question = null
                return
            }
            this.randomCategory = categories[Math.floor(Math.random() * categories.length)]
            let categoryArray = this[this.randomCategory]
            const randomIndex = Math.floor(Math.random() * categoryArray.length)
            this.question = categoryArray[randomIndex]
            this.question.category = this.randomCategory
            // Удаляем вопрос из массива выбранной категории
            this[this.randomCategory].splice(randomIndex, 1)
        },
        FightOver(value){
            this.visibleFight = !this.visibleFight
            this.addPoints(value.id, 30); // Победителю — очки
            this.$refs.gameUI.nextPlayerTurn(value);
        },

        //Конец игры + таймер
        startGameTimer() {
            this.gameStartTime = Date.now();
            this.timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
                this.remainingTime = Math.max(this.gameDuration / 1000 - elapsed, 0);

                if (this.remainingTime <= 0 && !this.gameOver) {
                    this.isBlinking = true;
                    this.gameOver = true;
                    setTimeout(() => {
                        this.isBlinking = false;
                        this.endGame();
                    }, 3000); // 3 секунды мигания
                }
            }, 1000);
        },
        endGame() {
            // Экран завершения и т.д.
            this.timerGameEnd = true
            this.$refs.lead.getPLayers()
        },
        formatTime(seconds) {
            const m = String(Math.floor(seconds / 60)).padStart(2, '0');
            const s = String(seconds % 60).padStart(2, '0');
            return `${m}:${s}`;
        },

        //Звук в игре
        playPlaylist () {
            // Стоп старый если был
            if (this.currentSound) {
                this.currentSound.unload()
            }

            this.currentSound = new Howl({
                src: [this.playlist[this.currentIndex]],
                volume: this.volumeBack,
                onend: () => {
                    // Следующий трек
                    this.currentIndex = (this.currentIndex + 1) % this.playlist.length
                    this.playPlaylist()
                },
            })

            this.currentSound.play()
        },
        stopPlaylist (){
            if (this.currentSound) {
                this.currentSound.stop()
                this.currentSound.unload()
                this.currentSound = null
                this.currentIndex = 0
            }
        }
    },

    watch:{
        questions: {
            handler(newVal) {
                this.splitQuestions(newVal);
            },
            immediate: true,
                deep: true
        },

        startGameIf:{
            handler(newVal) {
                if(newVal) this.startGameTimer();
                this.playPlaylist();
            },
            immediate: true,
            deep: true
        }
    },
    mounted(){
        const wasReloaded = sessionStorage.getItem('gameReloaded') === 'true';

        if (!wasReloaded) {
            // Перезагружаем страницу только один раз
            sessionStorage.setItem('gameReloaded', 'true');

            //Проблема со светом решилась на неизвестном этапе разработки поэтому фрагмент кода закомментирован
            // window.location.reload();
        }

        setTimeout(() => {
            this.opacityGame = true;
            this.$refs.startGameH1.classList.add('animate-blink');
        }, 1500);
    },

    computed:{
        activeCards(){
            return this.cardsPlayers.filter(player => player?.id < this.players + 1)
        },

        // Автоматические, рандомные карточки
        autoCards() {
            return [
                ...this.questions.cardFound,
                ...this.questions.lucky,
                ...this.questions.word,
                ...this.questions.tf,
            ];
        },

        // Карточки для захвата клеток
        captureCards() {
            return [
                ...this.questions.cardQuestions,
                ...this.questions.decide,
            ];
        },

        // Карточки дуэли
        duelCards() {
            return [
                ...this.questions.action,
            ];
        }
    }
}
</script>

<style scoped>
@keyframes blink {
    0%, 100% { opacity: 1 }
    50% { opacity: 0.3 }
}

.animate-blink {
    animation: blink 1.5s infinite;
}
</style>
