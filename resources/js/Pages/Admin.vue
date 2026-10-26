<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Head } from '@inertiajs/vue3';
import axios from 'axios';
import LeftBar from './AdminComponents/LeftBar.vue';
import RightBar from './AdminComponents/RightBar.vue';
import MainContainer from './AdminComponents/MainContainer.vue';
import Modal from './AdminComponents/Modal.vue';
import type { AdminCategoryKey, AdminEntityItem, AdminMenuItem } from '@/Types/admin';

const modal = ref<InstanceType<typeof Modal> | null>(null);
const mainCont = ref<InstanceType<typeof MainContainer> | null>(null);
const right = ref<InstanceType<typeof RightBar> | null>(null);

const visibleAdmin = ref(false);
const activeCard = ref<AdminCategoryKey>('Specialization');
const activeRight = ref(false);
const content = ref<AdminEntityItem[] | null>(null);
const activeCardId = ref<number | null>(null);

let timerId: ReturnType<typeof setTimeout> | null = null;

const activeContent = computed<AdminEntityItem | undefined>(() => {
    if (content.value !== null && activeCardId.value !== null) {
        return content.value.find((item) => item.id === activeCardId.value);
    }
    return undefined;
});

function activeRightBar(cardId: number): void {
    activeCardId.value = cardId;
    right.value?.activeRight();
    activeRight.value = true;
}

function updateRightBar(cardId: number): void {
    activeCardId.value = cardId;
    right.value?.updateRight();
}

function updateRightModal(): void {
    right.value?.updateRight();
}

function closeRight(): void {
    mainCont.value?.closeRight();
    activeRight.value = false;
}

function closeRightModal(): void {
    right.value?.closeRight();
}

function againGetContent(): void {
    content.value = null;
    getContent();
}

async function getContent(): Promise<void> {
    try {
        const res = await axios.get<AdminEntityItem[]>(`admin/${activeCard.value.toLowerCase()}`);
        content.value = res.data;
    } catch (error) {
        console.error('Ошибка при загрузке данных категории:', error);
    }
}

function openUserModal(): void {
    modal.value?.openUserModal();
}

function createNew(value: string): void {
    modal.value?.openCreateModal(value);
}

function update(item: AdminEntityItem, value: string): void {
    modal.value?.openUpdateModal(item, value);
}

function del(item: AdminEntityItem, value: string): void {
    modal.value?.openDelModal(item, value);
}

function newActive(menuItem: AdminMenuItem): void {
    content.value = null;
    mainCont.value?.closeMain();
    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
        activeCard.value = menuItem.value;
        timerId = setTimeout(() => {
            getContent();
        }, 700);
    }, 500);
}

onMounted(() => {
    setTimeout(() => {
        visibleAdmin.value = true;
    }, 500);
    setTimeout(() => {
        getContent();
    }, 1000);
});

onUnmounted(() => {
    if (timerId) clearTimeout(timerId);
});
</script>

<template>
    <Head title="Админ-панель" />
    <div
        class="flex bg-gray-100 w-screen h-screen transition-all duration-1000 relative"
        :class="[visibleAdmin ? 'opacity-100' : 'opacity-0', activeRight ? 'gap-8' : 'gap-0']"
    >
        <LeftBar
            @closeRight="closeRightModal"
            @newActive="newActive"
            @openUserModal="openUserModal"
        />
        <MainContainer
            ref="mainCont"
            :content="content"
            :activeCard="activeCard"
            @updateRightBar="updateRightBar"
            @activeRightBar="activeRightBar"
            @againGetContent="againGetContent"
            @createNew="createNew"
            @update="update"
            @del="del"
        />
        <RightBar
            @closeRight="closeRight"
            :activeCard="activeCard"
            :card="activeContent"
            ref="right"
        />
        <Modal
            :content="content"
            @updateRightModal="updateRightModal"
            @closeRightModal="closeRightModal"
            @againGetContent="againGetContent"
            ref="modal"
        />
    </div>
</template>

<style>
p,
h1,
h2,
h3,
h4,
h5,
h6,
em,
strong {
    font-family: RobotoCondensed, serif;
}
</style>
