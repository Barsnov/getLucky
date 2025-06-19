<template>
    <div class="absolute z-40 right-0 top-1/2 -translate-y-1/2 gap-6 pe-3 rounded-s-2xl flex flex-col w-max">
        <transition-group name="player" tag="div" class="flex flex-col gap-6">
            <div class="flex py-3 px-6 w-[13rem] items-center gap-6 bg-gray-950" v-for="player in sortedPlayers"
                :key="player.id" :class="['player-card', 'border border-white']"
            >
                <img :src="player.img" class="max-h-20" alt="">
                <div class="flex items-center gap-4">
                    <h1 style="font-family: 'Barboskin', sans-serif" class="text-center text-white font-medium text-5xl">
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
        placeClass(place) {
            switch (place) {
                case 1: return 'diamond';
                case 2: return 'gold';
                case 3: return 'silver';
                case 4: return 'bronze';
                case 5: return 'copper';
                default: return '';
            }
        },

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

                // ✅ Теперь множитель работает даже с 1 гекса
                const multiplier = stats.normal * 2 + stats.immune * 6;


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
    .player-move {
        transition: all 1s ease;
    }

    .player-card {
        padding: 0.5rem;
        border-radius: 1rem;
        transition: all 0.3s ease;
    }

    .diamond{
        border: 2px solid #9be1fb;
        box-shadow: 0 0 20px #9be1fb;
    }

    .gold {
        border: 2px solid #ffd700;
        box-shadow: 0 0 20px #ffd700;
    }

    .silver {
        border: 2px solid #c0c0c0 ;
        box-shadow: 0 0 20px #c0c0c0 ;
    }

    .bronze {
        border: 2px solid #cd7f32;
        box-shadow: 0 0 20px #cd7f32;
    }

    .copper {
        border: 2px solid #39ff14 ;
        box-shadow: 0 0 20px #39ff14;
    }
</style>
