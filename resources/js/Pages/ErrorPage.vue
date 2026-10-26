<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    status: number;
}>();

const title = computed(() => {
    const titles: Record<number, string> = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
    };
    return titles[props.status] ?? `${props.status}: Error`;
});

const description = computed(() => {
    const descriptions: Record<number, string> = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page.',
    };
    return descriptions[props.status] ?? 'An unexpected error occurred.';
});
</script>

<template>
    <div>
        <h1>{{ title }}</h1>
        <div>{{ description }}</div>
    </div>
</template>
