<template>
    <div class="absolute z-40 right-[1rem] top-[7rem] shadow shadow-gray-800 bg-gray-950/50 rounded-xl backdrop-blur-md">
        <transition-group name="player" tag="div" class="flex p-4 flex-col gap-2">
            <div class="flex py-3 px-6 items-center rounded-lg gap-4 transition-all border-gray-950 border-2 duration-300"
                v-for="(player, index) in sortedPlayers" :key="player.id"
                 :class="{
                    'bg-gradient-to-r from-red-500 to-red-300': player.name === 'Красные',
                    'bg-gradient-to-r from-blue-500 to-blue-300': player.name === 'Синие',
                    'bg-gradient-to-r from-green-500 to-green-300': player.name === 'Зелёные',
                    'bg-gradient-to-r from-yellow-500 to-yellow-200': player.name === 'Жёлтые',
                    'bg-gradient-to-r from-violet-500 to-violet-300': player.name === 'Фиолетовые',
                }">

                <div class="bg-black ring-4 w-14 h-14 flex items-end justify-center ring-white/85 shadow rounded-full overflow-hidden">
                    <img :src="player.img" class="h-12 w-10 object-cover object-top" alt="">
                </div>
                <div class="flex justify-between w-[10rem] items-center">
                    <h2 class="text-gray-800 barboskin text-2xl">{{ player.name }}</h2>
                    <h1 class="text-gray-800 barboskin text-3xl" style="font-family: 'Barboskin', sans-serif;">
                        {{ player.calculatedScore }}
                    </h1>
                </div>
            </div>
        </transition-group>
    </div>

</template>

<script>
export default {
    props: {
        players: {
            type: Number,
            required: true
        },
        pointsPayload: {
            type: [Object, null],
            required: true,
            default: null
        },
        hexStatsByPlayer: {
            type: Object,
            required: true,
            default: () => ({})
        }
    },
    data() {
        return {
            cardsPlayers: [
                {id: 1, name: 'Красные', img: '/images/Red_chip.svg', score: 0, place: 0},
                {id: 2, name: 'Синие', img: '/images/Blue_chip.svg', score: 0, place: 0},
                {id: 3, name: 'Зелёные', img: '/images/Green_chip.svg', score: 0, place: 0},
                {id: 4, name: 'Жёлтые', img: '/images/Yellow_chip.svg', score: 0, place: 0},
                {id: 5, name: 'Фиолетовые', img: '/images/Purple_chip.svg', score: 0, place: 0}
            ]
        };
    },

    methods:{
        getPLayers(){
            setTimeout(()=>{
                console.log(this.sortedPlayers)
                this.$inertia.post('/game/end', { players: this.sortedPlayers })
            }, 3000)
        }
    },

    watch: {
        pointsPayload(newVal) {
            if (!newVal) return;

            const { playerId, points } = newVal;

            const player = this.cardsPlayers[playerId]
            if (player) {
                player.score += points;
            }
        }
    },

    computed: {
        // Отсортированные активные игроки с местами
        sortedPlayers() {
            // Фильтруем только активных игроков
            const active = this.cardsPlayers.filter(player => player.id <= this.players);

            // Добавим расчётные очки каждому активному игроку
            const calculated = active.map(player => {
                const stats = this.hexStatsByPlayer[player.id-1] || { normal: 0, immune: 0, total: 0 };

                // Теперь множитель работает даже с 1 гекса
                const multiplier = stats.normal * 3 + stats.immune * 10;

                const calculatedScore = Math.round(player.score * (1 + multiplier * 0.02));

                return {
                    ...player,
                    calculatedScore
                };
            });

            // Сортируем по убыванию очков
            calculated.sort((a, b) => b.calculatedScore - a.calculatedScore);

            // Присваиваем места
            calculated.forEach((player, index) => {
                player.place = index + 1;
            });

            return calculated;
        }
    }
};
</script>

<style>
    .barboskin{
        font-family: Barboskin, sans-serif;
    }

    .player-card {
        padding: 0.5rem;
        border-radius: 1rem;
        transition: all 0.3s ease;
    }
</style>
