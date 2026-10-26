<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Head } from '@inertiajs/vue3';
import axios from 'axios';
import Loading from './Loading.vue';
import type { RawQuestionsPayload, Specialization } from '@/Types/cards';

const props = withDefaults(
    defineProps<{
        players: number;
        specialization: Specialization;
    }>(),
    {
        players: 2,
    }
);

const emit = defineEmits<{
    (e: 'nextPage'): void;
}>();

const visible = ref(false);
const progress = ref(0);
const questions = ref<RawQuestionsPayload | null>(null);
const generatedQuestions = ref<RawQuestionsPayload[]>([]);

let progressIntervalId: ReturnType<typeof setInterval> | null = null;
let startTimeoutId: ReturnType<typeof setTimeout> | null = null;

const generatorUrl =
    import.meta.env.VITE_GENERATOR_API_URL || 'http://192.168.100.183:8000/generate';

async function loadGeneratedQuestions(): Promise<void> {
    const minQuestions = 10;
    let loaded = 0;

    while (generatedQuestions.value.length < minQuestions) {
        try {
            const res = await axios.get(generatorUrl, {
                params: { specialization: props.specialization.name },
            });
            const rawBlock = res.data.question?.split('```')[1] ?? res.data.question;
            const parsed = JSON.parse(rawBlock) as RawQuestionsPayload;

            generatedQuestions.value.push(parsed);
            loaded++;
            progress.value = Math.floor((loaded / minQuestions) * 100);
        } catch (error) {
            console.error('Ошибка генерации вопроса:', error);
            break;
        }
    }

    questions.value = generatedQuestions.value[0] ?? {};
}

function nextPage(): void {
    emit('nextPage');
}

onMounted(() => {
    startTimeoutId = setTimeout(() => {
        visible.value = true;
        if (props.specialization.method === 0) {
            axios
                .get<RawQuestionsPayload>(`/questions/get/${props.specialization.id}`)
                .then((res) => {
                    questions.value = res.data;
                    progressIntervalId = setInterval(() => {
                        if (progress.value < 100) {
                            progress.value++;
                        } else if (progressIntervalId) {
                            clearInterval(progressIntervalId);
                            progressIntervalId = null;
                        }
                    }, 100);
                })
                .catch((err) => {
                    console.error('Ошибка загрузки вопросов:', err);
                });
        } else {
            loadGeneratedQuestions();
        }
    }, 1000);
});

onUnmounted(() => {
    if (progressIntervalId) clearInterval(progressIntervalId);
    if (startTimeoutId) clearTimeout(startTimeoutId);
});
</script>

<template>
    <Head title="Загрузка игры" />
    <div
        class="w-screen h-screen transition-opacity duration-1000"
        :class="visible ? 'opacity-100' : 'opacity-0'"
    >
        <Loading
            :questions="questions"
            @nextPage="nextPage"
            :players="players"
            :specialization="specialization"
            :progress="progress"
        />
    </div>
</template>
