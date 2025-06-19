<script setup>
import {ref, onMounted, watch, watchEffect} from 'vue';
import { TresCanvas, extend } from '@tresjs/core';
import { OrbitControls } from '@tresjs/cientos';
import * as THREE from 'three';
import BloomBackScene from "../GameComponents/BloomScene.vue";

//Импорт моделек
import RedShape from "../GameComponents/Shape/RedShape.vue";
import BlueShape from "../GameComponents/Shape/BlueShape.vue";
import GreenShape from "../GameComponents/Shape/GreenShape.vue";
import WhiteShape from "../GameComponents/Shape/PurpleShape.vue";
import YellowShape from "../GameComponents/Shape/YellowShape.vue";

extend({ OrbitControls });

const hexGrid = ref([]);

const getRandomColor = () => {
    // const r = Math.floor(Math.random() * 256); // случайное значение для красного
    // const g = Math.floor(Math.random() * 256); // случайное значение для зеленого
    // const b = Math.floor(Math.random() * 256); // случайное значение для синего
    // return new THREE.Color(r / 255, g / 255, b / 255); // возвращаем объект THREE.Color
    return new THREE.Color('#ffffff'); // возвращаем объект THREE.Color
};

const createHex = (index, position, geometry) => {
    const color = getRandomColor(); // случайный цвет для граней
    const surfaceColor = new THREE.Color(0,0,0);
    const id = index?.id

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
        color,
        linewidth: 1.5,
        toneMapped: false,
    });

    return {
        id,
        position,
        color,
        surfaceColor, // добавляем цвет для поверхности
        edgesGeometry,
        lineMaterial,
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
    hexes.forEach((hex)=>{
        if(hex.id === "5, 3, 2" || hex.id === "5, 3, 1"){
            console.log(hex.surfaceColor)
            hex.surfaceColor = new THREE.Color('#ff0000');
            console.log(hex.surfaceColor)
        }
    })
    console.log(hexes);
    hexGrid.value = hexes;
};

    onMounted(createHexGrid);
</script>

<template>
    <div class="" style="width: 925px; height: 600px">
        <TresCanvas clear-color="#000000">
                <TresPerspectiveCamera :position="[0, 6, 12]" :fov="30" :look-at="[0, 0, 0]"/>
            <OrbitControls />
            <TresDirectionalLight :position="[0, 100, 0]" :intensity="1" cast-shadow/>
            <TresAmbientLight :intensity="1" />
            <TresGroup>
                <TresMesh
                    v-for="(hex, index) in hexGrid"
                    :key="index"
                    :position="[hex.position.x, hex.position.y, hex.position.z]"
                    cast-shadow
                    receive-shadow
                >
                    <!-- Поверхность шестиугольников -->
                    <TresCylinderGeometry :args="[0.7, 0.7, 0.1, 6]" />
                    <TresMeshStandardMaterial :color="hex.surfaceColor" :roughness=".75" :metalness=".25" />
                </TresMesh>

                <!-- Грани шестиугольников -->
                <TresLineSegments
                    v-for="(hex, index) in hexGrid"
                    :key="'edge' + index"
                    :geometry="hex.edgesGeometry"
                    :material="hex.lineMaterial"
                    :position="[hex.position.x, hex.position.y, hex.position.z]"
                />
                <TresGroup v-if="players === 2">
                    <Suspense>
                        <RedShape :position="[5, 0.46, 0]"></RedShape>
                    </Suspense>
                    <Suspense>
                        <BlueShape :position="[-5, 0.46, 0]"></BlueShape>
                    </Suspense>
                </TresGroup>

                <TresGroup v-if="players === 3">
                    <Suspense>
                        <RedShape :position="[-5, 0.46, 0]"></RedShape>
                    </Suspense>
                    <Suspense>
                        <BlueShape :position="[5, 0.46, 0]"></BlueShape>
                    </Suspense>
                    <Suspense>
                        <GreenShape :position="[0, 0.46, 4.4]"></GreenShape>
                    </Suspense>
                </TresGroup>

                <TresGroup v-if="players === 4">
                    <Suspense>
                        <RedShape :position="[-5, 0.46, 0]"></RedShape>
                    </Suspense>
                    <Suspense>
                        <BlueShape :position="[5, 0.46, 0]"></BlueShape>
                    </Suspense>
                    <Suspense>
                        <GreenShape :position="[0, 0.46, 4.4]"></GreenShape>
                    </Suspense>
                    <Suspense>
                        <YellowShape :position="[0, 0.46, -4.4]"></YellowShape>
                    </Suspense>
                </TresGroup>

                <TresGroup v-if="players === 5">
                    <Suspense>
                        <RedShape :position="[0.63*4, 0.46, -4.4]"></RedShape>
                    </Suspense>
                    <Suspense>
                        <BlueShape :position="[0.63*-4, 0.46, -4.4]"></BlueShape>
                    </Suspense>
                    <Suspense>
                        <GreenShape :position="[0.63*-4, 0.46, 4.4]"></GreenShape>
                    </Suspense>
                    <Suspense>
                        <YellowShape :position="[0.63*4, 0.46, 4.4]"></YellowShape>
                    </Suspense>
                    <Suspense>
                        <WhiteShape :position="[5, 0.46, 0]"></WhiteShape>
                    </Suspense>
                </TresGroup>
            </TresGroup>

            <BloomBackScene></BloomBackScene>
        </TresCanvas>
    </div>
</template>

<script>
export default {
    props:{
        players: Number,
    },

    watch:{
        players(value){
            console.log(value)
        }
    }
}
</script>
