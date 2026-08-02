<script setup>
import {ref, shallowRef, onMounted, watch, defineEmits, computed} from 'vue';
import { TresCanvas, extend } from '@tresjs/core';
import { OrbitControls } from '@tresjs/cientos';
import * as THREE from 'three';
import BloomScene from "./BloomScene.vue";
//Импорт моделек
import RedShape from "./Shape/RedShape.vue";
import BlueShape from "./Shape/BlueShape.vue";
import GreenShape from "./Shape/GreenShape.vue";
import PurpleShape from "./Shape/PurpleShape.vue";
import YellowShape from "./Shape/YellowShape.vue";
import CameraAnimation from "./CameraAnimation.vue";
import CrownShape from "./CrownShape.vue";


extend({ OrbitControls });
const emit = defineEmits(['update-current-player', 'getQuestion', 'getFight', 'hexStatsUpdate', 'getQuestionForUpHex'])
const props = defineProps({
    players: Number,
    startGameIf: Boolean,
    highlightedIndex: Number,
})


import { useAudioStore } from '@/Stores/useAudioStore';

const audio = useAudioStore();

// Вызывов Howl методов:
const playPointer = () => audio.playSfx('pointer');
const playWrong = () => audio.playSfx('wrong');
const playWhip = () => audio.playSfx('whip');
const playWhoosh = () => audio.playSfx('hexAction');
const playAttack = () => audio.playSfx('attack');
const playUpgrade = () => audio.playSfx('upgrade');
const playShield = () => audio.playSfx('shield');

// В методе, где камера летит:
watch(() => props.startGameIf, (newVal) => {
    if (newVal) {
        // ...
        audio.playSfx('whoosh'); // Звук камеры
        // ...
    }
});

const hexGrid = ref([]);
const isHexClickable = ref(true)
//Сбор информации по гексам
const hexStatsByPlayer = computed(() => {
    const stats = {};
    hexGrid.value.forEach(hex => {
        const ownerId = hex.ownerId;
        if (ownerId === null || ownerId === undefined) return;

        if (!stats[ownerId]) {
            stats[ownerId] = {
                normal: 0,
                immune: 0,
                total: 0
            };
        }

        if (hex.immune) {
            stats[ownerId].immune++;
        } else {
            stats[ownerId].normal++;
        }

        stats[ownerId].total++;
    });

    return stats;
});

watch(hexGrid, () => {
    emit('hexStatsUpdate', hexStatsByPlayer.value);
}, { deep: true });

//Позиции фишек и логика передвижения
const positionShape = ref([
    [[5, 0.46, 0], [-5, 0.46, 0]],
    [[5, 0.46, 0], [-2.52, 0.46, -4.4], [-2.52, 0.46, 4.4]],
    [[5, 0.46, 0], [-5, 0.46, 0], [0, 0.46, 4.4], [0, 0.46, -4.4]],
    [[2.52, 0.46, -4.4], [-2.52, 0.46, -4.4], [-2.52, 0.46, 4.4], [2.52, 0.46, 4.4], [5, 0.46, 0]],
])

const isMovePhase = ref(false);

const currentPiecePosition = ref(new THREE.Vector3()); // позиция активной фишки
const reachableHexes = ref([]); // массив доступных для хода хексов

//Получение доступных hex для хода (близлежащие)
const getReachableHexes = (fromPos, maxDistance) => {
    return hexGrid.value.filter(hex => {
        const dist = fromPos.distanceTo(hex.position);
        return dist > 0 && dist <= maxDistance;
    });
};

const HexClick = (hex) =>{
    if (!isHexClickable.value) return;
    if (!isMovePhase.value || (!reachableHexes.value.includes(hex) && currentPlayerIndex.value !== hex.ownerId)) return;

    if (hex.occupied){
        if (currentPlayerIndex.value === hex.ownerId){
            if(hex.busy === null){
                //Случай когда фишка просто перемещается по своим клеткам и просто перенимает свою позицию

                reachableHexes.value.forEach(h => !h.occupied ? h.surfaceColor = new THREE.Color('rgb(56, 56, 56)') : '');
                const pos = hex.position;
                positionShape.value[props.players - 2][currentPlayerIndex.value] = [pos.x, pos.y + 0.46, pos.z];

                //Заново проигрываем логику передвижения на доступные клетки
                currentPiecePosition.value = new THREE.Vector3(
                    ...positionShape.value[props.players - 2][currentPlayerIndex.value]
                );
                reachableHexes.value = getReachableHexes(currentPiecePosition.value, 2);
                reachableHexes.value.forEach(hex => {
                    if(!hex.occupied){
                        const dist = currentPiecePosition.value.distanceTo(hex.position);
                        const intensity = 1 - dist / 3;

                        // Клонируем цвет активной фишки
                        const color = new THREE.Color(allPlayers.value[currentPlayerIndex.value].color) // THREE.Color

                        // Получаем HSL
                        const hsl = {};
                        color.getHSL(hsl); // hsl.h, hsl.s, hsl.l

                        // Меняем яркость (lightness): от 0.3 до 0.6, например
                        const newLightness = Math.min(1, Math.max(0, hsl.l + intensity * 0.5));

                        // Применяем новый HSL
                        hex.surfaceColor = new THREE.Color().setHSL(hsl.h, hsl.s, newLightness);
                        beforeColor.value = new THREE.Color().setHSL(hsl.h, hsl.s, newLightness);
                    }
                });


                const prevHex = hexGrid.value.find(h =>
                    h.busy === currentPlayerIndex.value
                );
                if (prevHex) {
                    prevHex.busy = null;
                }
                hex.busy = currentPlayerIndex.value
                // Обновляем визуальные элементы
                resetHex(hex)
                highlightHex(hex)
                playWhip()
            }else{
                //Фишке нет смысла прыгать на своё же место
            }
        }else{
            //Случай, когда клетка занята другой фишкой и проверяется ниже - занята ли она щас в данный момент физическим присутствием этой же фишки
            if(hex.busy !== null){

            }else{
                if (hex.immune) return;
                //Определение защищающейся команды
                isHexClickable.value = false;
                const surfaceHex = `#${hex.surfaceColor.getHexString()}`
                const defenderIndex = playerColors.findIndex(
                    color => color.toLowerCase() === surfaceHex.toLowerCase()
                )

                if (defenderIndex === -1) {
                    console.warn(`Цвет клетки ${surfaceHex} не принадлежит ни одной команде`)
                    isHexClickable.value = true;
                    return
                }

                const attackingPlayer = allPlayers.value[currentPlayerIndex.value]
                const defendingPlayer = allPlayers.value[defenderIndex]

                //Отбирание клетки другой активной фишкой (Дуэль)
                setTimeout(() => {
                    emit('getFight', attackingPlayer, defendingPlayer);
                    hexActiveTurn.value = hex
                }, 400);
            }
        }
    }else{
        //Обычный захват клетки
        isHexClickable.value = false;
        setTimeout(() => {
            emit('getQuestion')
            hexActiveTurn.value = hex
        }, 400);
    }
}
const updateHex = (hex) =>{
    if (!isHexClickable.value) return;
    if (hex.occupied){
        if (currentPlayerIndex.value === hex.ownerId){
            if(hex.busy !== null && !hex.immune){
                setTimeout(() => {
                    emit('getQuestionForUpHex')
                    hexActiveTurn.value = hex
                }, 400);
            }
        }
    }
}
const hexActiveTurn = ref(null)
const beamGeometry = new THREE.CylinderGeometry(.7, .7, .2, 6, 1,true);
const beamMaterial = (color) => new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    })

const nextPlayerTurn = (duelWinner = null) =>{
    isHexClickable.value = true;
    const hex = hexActiveTurn.value
    if (duelWinner){
        if (duelWinner?.name?.includes('Ничья')){
            resetHex(hex)
            reachableHexes.value.forEach(h => !h.occupied ? h.surfaceColor = new THREE.Color('rgb(56,56,56)') : '');
            reachableHexes.value = []
            isMovePhase.value = false
            setTimeout(() => {
                nextTurn()
            }, 400)
            return;
        }

        // Ищем победителя по названию
        const winnerIndex = playerNamesColors.findIndex(p =>
            duelWinner?.name?.includes(p)
        );

        if (winnerIndex === -1) {
            console.warn('Победитель не найден по имени:', duelWinner);
            return;
        }

        // Победитель определён
        const winnerColor = new THREE.Color(allPlayers.value[winnerIndex].color)

        // Назначаем победителя владельцем
        hex.ownerId = winnerIndex
        hex.surfaceColor = winnerColor
        hex.immune = true // 🛡️ Добавляем иммунитет к атаке после победы

        hex.beamColor = winnerColor

        // Обновляем визуальные элементы
        resetHex(hex)
        reachableHexes.value.forEach(h => !h.occupied ? h.surfaceColor = new THREE.Color('rgb(56,56,56)') : '');
        reachableHexes.value = []
        isMovePhase.value = false

        // Просто переход хода
        setTimeout(() => {
            nextTurn()
        }, 400)
        return;
    }

    const prevHex = hexGrid.value.find(h =>
        h.busy === currentPlayerIndex.value
    );
    if (prevHex) {
        prevHex.busy = null;
    }

    //Перемещение фишки на тот самый активный hex
    hex.busy = currentPlayerIndex.value
    const pos = hex.position;
    hex.occupied = true
    hex.ownerId = currentPlayerIndex.value
    resetHex(hex)
    positionShape.value[props.players - 2][currentPlayerIndex.value] = [pos.x, pos.y + 0.46, pos.z];

    reachableHexes.value.forEach(h => !h.occupied ? h.surfaceColor = new THREE.Color('rgb(56,56,56)') : '');
    hex.surfaceColor = activeColor.value
    reachableHexes.value = [];
    isMovePhase.value = false
    playWhip()

    setTimeout(() => {
        nextTurn();
    }, 400);
}

const questionForUpHex = () =>{
    isHexClickable.value = true;
    const hex = hexActiveTurn.value
    hex.immune = true // 🛡️ Добавляем иммунитет к атаке после победы
    hex.beamColor = hex.surfaceColor

    resetHex(hex)
    reachableHexes.value.forEach(h => !h.occupied ? h.surfaceColor = new THREE.Color('rgb(56,56,56)') : '');
    reachableHexes.value = []
    isMovePhase.value = false

    // Просто переход хода
    setTimeout(() => {
        nextTurn()
    }, 400)
}
//Курсор-поинтер при наведении на поле
const canvasRef = shallowRef(null)

//Изменение цвета активной фишки
const activeColor = ref(new THREE.Color('#ff0000'))
const beforeColor = ref(null)
const highHex = ref(false)

//Подсветка путём проверки на нахождения данного гекса в массиве reachableHexes
const highlightHex = (hex) =>{
    if (!isHexClickable.value) return;
    if (props.startGameIf !== false){
        if (highHex.value !== false) return;
        highHex.value = true
        if(reachableHexes.value.includes(hex)){
            //Подсвет незанятых клеток - куда можно пойти
            if(!hex.occupied){
                canvasRef.value.$el.style.cursor = "url('/icons/Point.png') 15 15, auto"
                playPointer()
                hex.gameColor = activeColor.value // Установка цвета активной фишки
            }else{
                //Если клетки - частность активной клетки - туда можно переместиться свободно
                if(currentPlayerIndex.value === hex.ownerId){
                    if(hex.busy === null){
                        canvasRef.value.$el.style.cursor = "url('/icons/Running.png') 20 20, auto"
                        playWhoosh()
                    }else{
                        if(hex.immune){
                            canvasRef.value.$el.style.cursor = "url('/icons/NotAllowed.png') 15 15, auto"
                        }else{
                            canvasRef.value.$el.style.cursor = "url('/icons/Upgrade.png') 20 20, auto"
                            playUpgrade()
                        }
                    }
                }else{
                    //Если клетки не свободны и не являтся частностью активной - это вражеские клетки, их можно атаковать
                    if(hex.busy === null){
                        if(hex.immune){
                            canvasRef.value.$el.style.cursor = "url('/icons/Shield.png') 10 10, auto"

                            const hsl = {};
                            const color = hex.surfaceColor
                            color.getHSL(hsl); // hsl.h, hsl.s, hsl.l

                            // Меняем яркость (lightness): от 0.3 до 0.6, например
                            const newLightness = Math.min(1, Math.max(0, hsl.l + 0.5 / 3  * 0.5));

                            hex.gameColor = new THREE.Color().setHSL(hsl.h, hsl.s, newLightness);
                            playShield()
                        }else{
                            canvasRef.value.$el.style.cursor = "url('/icons/Sword.png') 15 15, auto"
                            hex.gameColor = activeColor.value
                            playAttack()
                        }
                    }else{
                        canvasRef.value.$el.style.cursor = "url('/icons/NotAllowed.png') 15 15, auto"
                        playWrong()
                    }
                }
            }
        }else{
            //Клетки - куда ходит нельзя
            if(currentPlayerIndex.value === hex.ownerId){
                canvasRef.value.$el.style.cursor = "url('/icons/Running.png') 20 20, auto"
                playWhoosh()
            }else{
                canvasRef.value.$el.style.cursor = "url('/icons/NotAllowed.png') 15 15, auto"
            }
        }
    }
};
//Удаление подсветки путём проверки данных находящихся там гексов
const resetHex = (hex) => {
    highHex.value = false
    if (props.startGameIf !== false){
        if(!reachableHexes.value.includes(hex)){
            if(!hex.occupied || hex.immune){
                hex.gameColor = null;
                canvasRef.value.$el.style.cursor = "url('/icons/Default.png') 15 15, auto"
            }
        }else{
            if(hex.busy === null){
                if(currentPlayerIndex.value !== hex.ownerId){
                    hex.gameColor = null;
                    canvasRef.value.$el.style.cursor = "url('/icons/Default.png') 15 15, auto"
                }else{
                    if (canvasRef.value && canvasRef.value.$el) {
                        canvasRef.value.$el.style.cursor = "url('/icons/Default.png') 15 15, auto"
                    }
                }
            }
        }
    }
};
// Генерация поля
const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return new THREE.Color(r / 255, g / 255, b / 255);
}
const createHex = (index, position, geometry) => {
    const color = new THREE.Color('rgb(255,255,255)');
    const surfaceColor = new THREE.Color('rgb(56,56,56)');
    // const surfaceColor = getRandomColor();
    const id = index?.id;
    const occupied = false;
    const busy = null;
    const immune = false;
    const ownerId  = null;
    const gameColor = null;
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
        color,
        toneMapped: false,
    });

    return {
        id, occupied, ownerId, busy, immune, position, color,
        surfaceColor, // добавляем цвет для поверхности
        gameColor, edgesGeometry, lineMaterial,
    };
};
const createHexGrid = () => {
    const hexes = [];
    const circleCount = 3; // Количество колец шестиугольников
    const unit = Math.sqrt(3) * 0.72 * 1.022;
    const angle = Math.PI / 3;
    const axis = new THREE.Vector3(0, 1, 0);
    const axisVector = new THREE.Vector3(0,  0, -unit);
    const sideVector = new THREE.Vector3(0, 0, unit).applyAxisAngle(axis, -angle);
    const vec3 = new THREE.Vector3();

    const cylinderGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 6);

    // Расставляем шестиугольники по окружности
    for (let seg = 0; seg < 6; seg++) {
        for (let ax = 1; ax <= circleCount; ax++) {
            for (let sd = 0; sd < ax; sd++) {
                vec3.copy(axisVector)
                    .multiplyScalar(ax)
                    .addScaledVector(sideVector, sd)
                    .applyAxisAngle(axis, (angle * seg) + (Math.PI / 6));

                hexes.push(createHex({id: `${seg}, ${ax}, ${sd}`}, vec3.clone(), cylinderGeometry));
            }
        }
    }
    // Центральный шестиугольник
    hexes.push(createHex({id: "0, 0, 0"}, new THREE.Vector3(), cylinderGeometry))
    //Вывод таблицы id (ну почти) шестиугольников для дальнейшего взаимодействия фишки с картой.
    hexGrid.value = hexes;
};

//Логика для фишек (переключение, актив и т.д)
const playerNamesColors = ['Красные', 'Синие', 'Зелёные', 'Жёлтые', 'Фиолетовые']
const playerColors = ['#ff0000', '#0000ff', '#00ff00', '#ffbb00', '#9100cd']
const allPlayers = ref([])
const currentPlayerIndex = ref(0)

watch(currentPlayerIndex, (newVal) => {
    emit('update-current-player', allPlayers.value[newVal])
})
watch(() => props.startGameIf, (newVal)=>{
    if (newVal){
        currentPiecePosition.value = new THREE.Vector3(
            ...positionShape.value[props.players - 2][currentPlayerIndex.value]
        );

        reachableHexes.value = getReachableHexes(currentPiecePosition.value, 2);
        reachableHexes.value.forEach(hex => {
            if(!hex.occupied){
                const dist = currentPiecePosition.value.distanceTo(hex.position);
                const intensity = 1 - dist / 3;

                // Клонируем цвет активной фишки
                const color = new THREE.Color(allPlayers.value[currentPlayerIndex.value].color) // THREE.Color

                // Получаем HSL
                const hsl = {};
                color.getHSL(hsl); // hsl.h, hsl.s, hsl.l

                // Меняем яркость (lightness): от 0.3 до 0.6, например
                const newLightness = Math.min(1, Math.max(0, hsl.l + intensity * 0.5));

                // Применяем новый HSL
                hex.surfaceColor = new THREE.Color().setHSL(hsl.h, hsl.s, newLightness);
                beforeColor.value = new THREE.Color().setHSL(hsl.h, hsl.s, newLightness);
            }
        });
        whooshCamera.play()
        isMovePhase.value = true;
    }
})

const shapeMapping = {
    0: RedShape
    ,1: BlueShape
    ,2: GreenShape
    ,3: YellowShape
    ,4: PurpleShape
}

const initPlayers = () => {
    const count = Number(props.players)
    allPlayers.value = Array.from({ length: count }, (_, i) => ({
        id: i,
        name: playerNamesColors[i],
        color: playerColors[i],
    }))
}

const nextTurn = () => {
    currentPlayerIndex.value = (currentPlayerIndex.value + 1) % allPlayers.value.length
    activeColor.value = new THREE.Color(allPlayers.value[currentPlayerIndex.value].color)

    currentPiecePosition.value = new THREE.Vector3(
        ...positionShape.value[props.players - 2][currentPlayerIndex.value]
    );

    reachableHexes.value = getReachableHexes(currentPiecePosition.value, 2);
    reachableHexes.value.forEach(hex => {
        if(!hex.occupied){
            const dist = currentPiecePosition.value.distanceTo(hex.position);
            const intensity = 1 - dist / 3;

            // Клонируем цвет активной фишки
            const color = new THREE.Color(allPlayers.value[currentPlayerIndex.value].color) // THREE.Color

            // Получаем HSL
            const hsl = {};
            color.getHSL(hsl); // hsl.h, hsl.s, hsl.l

            // Меняем яркость (lightness): от 0.3 до 0.6, например
            const newLightness = Math.min(1, Math.max(0, hsl.l + intensity * 0.5));

            // Применяем новый HSL
            hex.surfaceColor = new THREE.Color().setHSL(hsl.h, hsl.s, newLightness);
            beforeColor.value = new THREE.Color().setHSL(hsl.h, hsl.s, newLightness);
        }
    });
    isMovePhase.value = true;
}

const activeCrownPosition = computed(() => positionShape.value[props.players-2][currentPlayerIndex.value])

watch(() => props.highlightedIndex, (value)=>{
    currentPlayerIndex.value = value;
    activeColor.value = new THREE.Color(allPlayers.value[currentPlayerIndex.value]?.color)
    emit('update-current-player', allPlayers.value[currentPlayerIndex.value]);
})

onMounted(()=>{
    initPlayers();
    createHexGrid();
});

defineExpose({
    nextPlayerTurn,
    nextTurn,
    questionForUpHex
})
</script>

<template>
    <!-- preset="realistic"-->
    <TresCanvas shadows ref="canvasRef" :clear-color="'rgb(60,42,46)'" window-size :antialias="true">
        <!--<OrbitControls/>-->
        <CameraAnimation :startGameIf="startGameIf" :targetPosition="positionShape[players-2][currentPlayerIndex]"></CameraAnimation>
        <TresAmbientLight :intensity=".5"/>
        <TresDirectionalLight :position="[0, 100, 0]" :intensity="2" :look-at="[0, 0, 0]" cast-shadow/>
        <TresGroup>
            <TresMesh @click="() => HexClick(hex)" v-for="(hex, index) in hexGrid" :key="index" :position="[hex.position.x, hex.position.y, hex.position.z]" receive-shadow
                @pointer-enter="((event)=>{highlightHex(hex); event.stopPropagation()})" @pointer-leave="(()=>{resetHex(hex)})" @double-click="updateHex(hex)">

                <!-- Поверхность шестиугольников -->
                <TresCylinderGeometry :args="[0.7, 0.7, 0.1, 6]"/>
                <TresMeshStandardMaterial :color="hex.gameColor === null ? hex.surfaceColor : hex.gameColor" :roughness=".75" :metalness=".25" :emissive="hex.surfaceColor" :emissive-intensity=".01"/>
            </TresMesh>

            <!--Визуальный активный игрок-->
            <CrownShape :position="activeCrownPosition"/>

            <!-- Визуальный beam для отображения иммунных клеток -->
            <template v-for="(hex, index) in hexGrid" :key="'beam-' + index">
                <TresMesh v-if="hex?.beamColor" :position="[hex.position.x, hex.position.y + .15, hex.position.z]" :geometry="beamGeometry" receive-shadow :material="beamMaterial(hex.beamColor)"/>
            </template>

            <TresGroup v-for="(player, index) in props.players" :key="index">
                <Suspense>
                    <component :is="shapeMapping[index]" :position="positionShape[props.players-2][index]" cast-shadow/>
                </Suspense>
            </TresGroup>

        </TresGroup>
        <BloomScene></BloomScene>
    </TresCanvas>
</template>
