<script setup>
import {Head} from "@inertiajs/vue3";
import {computed, onMounted, ref} from "vue";
import LeftBar from "./AdminComponents/LeftBar.vue";
import RightBar from "./AdminComponents/RightBar.vue";
import MainContainer from "./AdminComponents/MainContainer.vue";
import Modal from "./AdminComponents/Modal.vue";
import axios from "axios";

const modal = ref();
const mainCont = ref();
const right = ref();
const visibleAdmin = ref(false);
const activeCard = ref('Specialization');
const activeRight = ref(false);
const content = ref(null);
const timer = ref(null);
const activeCardId = ref(null)

const activeContent = computed(() => {
    if (content.value !== null){
        return content.value?.find(item => item.id === activeCardId?.value)
    }
})

const activeRightBar = (card) => {
    activeCardId.value = card
    right.value.activeRight(activeCardId.value)
    activeRight.value = true;
}

const updateRightBar = (card) => {
    activeCardId.value = card
    right.value.updateRight(activeCardId.value)
}

const updateRightModal = () =>{
    right.value.updateRight(activeCardId.value)
}

const closeRight = () => {
    mainCont.value.closeRight()
    activeRight.value = false;
}

const closeRightModal = () => {
    right.value.closeRight()
}

const againGetContent = () =>{
    content.value = null;
    getContent();
}

const getContent = async () => {
    try {
        const res = await axios.get(`admin/${activeCard.value.toLowerCase()}`);
        // Допустим, тут вы хотите что-то сохранить:
        content.value = res.data;
    } catch (error) {
        console.error('Ошибка при загрузке специализации:', error);
    }
}

const openUserModal = () => {
    modal.value.openUserModal();
}

const createNew = (value) => {
    modal.value.openCreateModal(value);
}

const update = (item, value) => {
    modal.value.openUpdateModal(item, value);
}

const del = (item, value) => {
    modal.value.openDelModal(item, value);
}

const newActive = (value) => {
    content.value = null;
    mainCont.value.closeMain();
    clearTimeout(timer.value);
    timer.value = setTimeout(()=> {
        activeCard.value = value.value
        timer.value = setTimeout(()=> {
            getContent();
        }, 700)
    }, 500)
}

onMounted(()=>{
    setTimeout(()=> visibleAdmin.value = true, 500);
    setTimeout(()=> getContent(), 1000);
})
</script>


<template>
    <Head title="Админ-панель"/>
    <div class="flex bg-gray-100 w-screen h-screen transition-all duration-1000 relative" :class ="[visibleAdmin ? 'opacity-100' : 'opacity-0', activeRight ? 'gap-8' : ' gap-0']">
        <!--LeftBar-->
        <LeftBar @closeRight="closeRightModal" @newActive="newActive" @openUserModal="openUserModal"></LeftBar>
        <!--MainContainer-->
        <MainContainer ref="mainCont" :content="content" :activeCard="activeCard"
                       @updateRightBar="updateRightBar" @activeRightBar="activeRightBar" @againGetContent="againGetContent"
                       @createNew="createNew" @update="update" @del="del"></MainContainer>
        <!--RightBar-->
        <RightBar @closeRight="closeRight" :activeCard="activeCard" :card="activeContent" ref="right"></RightBar>
        <!--Modal-->
        <Modal :content="content" @updateRightModal="updateRightModal" @closeRightModal="closeRightModal" @againGetContent="againGetContent" ref="modal"></Modal>
    </div>
</template>

<style>
    p,
    h1, h2, h3, h4, h5, h6,
    em, strong{
        font-family: RobotoCondensed, serif;
    }
</style>
