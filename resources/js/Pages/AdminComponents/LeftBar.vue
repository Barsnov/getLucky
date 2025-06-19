<script setup>
import { UserCircleIcon } from '@heroicons/vue/24/solid'
import { Menu, MenuButton } from '@headlessui/vue';
import {Link} from "@inertiajs/vue3";
import {ref, watch} from "vue";

const emit = defineEmits(['openUserModal', 'newActive', 'closeRight'])

const activeCard = ref({id: 1, value: 'Specializations', name: 'SPC'})

watch(
    activeCard, (value) =>{
        emit('newActive', value);
        emit('closeRight');
    }
)

const linksMenu = ref([
    {id: 1, value: 'Specialization', name: 'SPC'},
    {id: 2, value: 'Lucky', name: 'LKC'},
    {id: 3, value: 'TF', name: 'T&F'},
    {id: 4, value: 'Action', name: 'ACT'},
    {id: 5, value: 'Decide', name: 'DCD'},
    {id: 6, value: 'Found', name: 'FND'},
    {id: 7, value: 'Question', name: 'QST'},
    {id: 8, value: 'Word', name: 'WRD'},
])

const openUserModal = () => {
    emit('openUserModal')
}
</script>

<template>
    <div class="w-24 sticky flex flex-col items-center justify-between px-5 py-6 bg-[#24262C]">
        <Link class="w-16" href="/"><img class="text-white cursor-pointer" :src="'/images/Logo_project_white_simple.svg'" alt="project_logo"></Link>
        <div class="flex flex-col gap-6">
            <div style="font-family: RobotoCondensed, serif" class="flex items-center justify-center px-2 py-3 cursor-pointer rounded text-sm text-white font-bold"
                 v-for="(link, index) in linksMenu" @click="activeCard = link" :class="index === activeCard.id-1 ? 'bg-fuchsia-400 text-fuchsia-800' : ''" :key="link.id">
                {{ link.name }}
            </div>
        </div>

        <Menu>
            <MenuButton class="flex rounded-full bg-white text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                <UserCircleIcon @click="openUserModal" class="cursor-pointer size-14 text-gray-300" aria-hidden="true" />
            </MenuButton>
        </Menu>
    </div>
</template>

<style scoped>

</style>

