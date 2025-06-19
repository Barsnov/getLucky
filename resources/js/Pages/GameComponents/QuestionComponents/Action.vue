<script setup>


const props = defineProps({

})
</script>

<template>
    <div class="absolute bg-gradient-to-r from-fuchsia-500 via-pink-400 to-blue-500 w-full h-full flex flex-col items-start justify-center gap-10 transition-all duration-300" :class="visibleQuestion ? 'opacity-100 z-30' : 'opacity-0 -z-10'">
        <!--Тип вопроса-->
        <h1 class="absolute text-white left-7 top-12 text-4xl text-center font-medium" style="font-family: 'Barboskin', serif">
            Категория:
            <span style="font-family: 'Barboskin', serif" class="text-white text-4xl underline-offset-4 underline uppercase">{{ categoryGame }}</span>
        </h1>

        <div class="flex w-10/12 justify-center">
            <div class="bg-white/100 max-w-[95rem] w-max h-max max-h-[60rem] p-6 rounded-2xl flex flex-col items-center gap-4">
                <div class="relative p-2 rounded-2xl">
                    <div class="w-full flex flex-col gap-6">
                        <h2 v-if="question?.explanation !== null || !checkAnswer" style="font-family: 'RobotoCondensed-Medium', sans-serif" class="text-4xl font-bold">{{!checkAnswer ? 'Вопрос' : 'Объяснение'}}</h2>
                        <!--Карточки удачи + действия-->
                        <div v-if="checkAnswer && question?.explanation !== null || !checkAnswer"
                             class="w-full prose break-words max-w-none"
                             v-html="renderMarkdown(checkAnswer ? question?.explanation : question?.question || question.action)">
                        </div>

                        <div v-if="checkAnswer" class="w-full flex items-end gap-3">
                            <h2 style="font-family: 'RobotoCondensed-Medium', sans-serif" class="text-4xl font-bold">Ответ:</h2>
                            <p style="font-family: 'RobotoCondensed-Medium', sans-serif" v-if="question?.answer === true || question?.answer === false" class="text-3xl">{{ question?.answer  ? 'Правда' : 'Ложь' }}</p>
                            <p style="font-family: 'RobotoCondensed-Medium', sans-serif" v-else class="text-3xl">{{ question?.answer }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <transition name="fade">
                <div class="absolute flex items-center gap-16" style="bottom: 3rem;">
                    <div v-if="!checkAnswer" class="border-4 border-b-[.7rem] hover:border-b-4 transition-all bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-2xl px-6 py-4"
                         @click="checkAnswer = true" style="cursor: url('/icons/Point.png') 20 20, auto">
                        <h1 class="text-4xl text-white" style="font-family: 'Barboskin', sans-serif;">Проверить ответ</h1>
                    </div>
                    <!-- После проверки: "Пропустить" и "+ Очки" -->
                    <div v-if="checkAnswer" class="flex items-center gap-16">
                        <div class="bg-gradient-to-r from-green-600 via-purple-700 w-[17rem] text-center to-blue-500 border-4 border-b-[.7rem] hover:border-b-4 transition-all border-white rounded-2xl px-6 py-4"
                             @click="closeQuestion(false)"
                             style="cursor: url('/icons/Point.png') 0 0, auto">
                            <h1 style="font-family: 'Barboskin', sans-serif;" class="text-4xl text-white">Пропустить</h1>
                        </div>
                        <div class="bg-gradient-to-r from-purple-600 via-pink-500 w-[17rem] text-center to-red-500 border-4 border-b-[.7rem] hover:border-b-4 transition-all border-white rounded-2xl px-6 py-4"
                             @click="closeQuestion(true)"
                             style="cursor: url('/icons/Point.png') 0 0, auto">
                            <h1 style="font-family: 'Barboskin', sans-serif;" class="text-4xl text-white">+ {{ question?.points }} очков</h1>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<style scoped>

</style>
