<template>
    <!--Exit-->
    <TransitionRoot as="template" :show="open">
        <Dialog class="relative z-10" @close="open = false">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500/75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-20 w-screen overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div class="bg-fuchsia-100 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="sm:flex sm:items-start">
                                    <div class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-fuchsia-200 sm:mx-0 sm:size-10">
                                        <ExclamationTriangleIcon class="size-6 text-red-600" aria-hidden="true" />
                                    </div>
                                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <DialogTitle as="h3" class="roboto text-base font-semibold text-gray-900">Выход из учётной записи</DialogTitle>
                                        <div class="mt-2">
                                            <p class="text-sm text-gray-500">Вы уверены, что хотите выйти из учётной записи? Все несохранённые изменения будут удалены.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-fuchsia-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button type="button" class="roboto inline-flex w-full justify-center rounded-md bg-fuchsia-500 px-3 py-2 text-sm font-normal text-white shadow-xs hover:bg-fuchsia-700 sm:ml-3 sm:w-auto" @click="exit">Выход</button>
                                <button type="button" class="roboto mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-normal text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto" @click="open = false" ref="cancelButtonRef">Отмена</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
    <!--Create-->
    <TransitionRoot as="template" :show="openCreate">
        <Dialog class="relative z-10" @close="openCreate = false">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500/75 transition-opacity"/>
            </TransitionChild>
            <div class="scroll-container fixed inset-0 z-20 w-screen overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel :class="activeCard === 'Lucky' || activeCard === 'Specializations' ? 'sm:max-w-lg' : 'sm:max-w-screen-xl'" class="relative transform text-left shadow-xl transition-all sm:my-8 sm:w-full ">
                            <div class="bg-white border-b border-gray-300 rounded-t-xl px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="sm:flex sm:items-start">
                                    <div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
                                        <DialogTitle as="h3" class="text-3xl font-black text-gray-800 text-center">Создать {{ componentsMap[activeCard].name }}</DialogTitle>
                                        <form @submit.prevent class="flex flex-col gap-4 mt-6">
                                            <!--Название специальности-->
                                            <div v-if="activeCard === 'Specializations' || activeCard === 'Word'" class="flex flex-col gap-2 w-full">
                                                <label for="name" class="roboto text-base text-gray-800 font-normal w-full">{{ activeCard === 'Specializations' ? 'Название специальности' : 'Слово'}}</label>
                                                <input v-model="name" id="name" class="roboto text-base text-gray-950 font-medium border border-gray-800 bg-[#f3f4f6] w-full rounded px-3 py-2">
                                            </div>
                                            <!--Генератор слов-->
                                            <div v-if="activeCard === 'Word' && startGenerating === true" class="">
                                                <div v-if="words.length === 0" class="inset-0 flex justify-center items-center bg-white bg-opacity-70 z-10">
                                                    <svg class="animate-spin h-8 w-8 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                                        <path class="opacity-75" fill="currentColor"
                                                              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z" />
                                                    </svg>
                                                </div>
                                                <!--Сгенерированные слова-->
                                                <div v-else-if="words.length !== 0" class="roboto flex w-full overflow-y-scroll scroll-container h-max max-h-[24rem] p-2 flex-wrap gap-2">
                                                <span v-for="(word, index) in words" :key="index"
                                                      class="roboto bg-gray-200 text-gray-900 px-3 py-1 pt-0.5 rounded-full text-sm font-medium flex items-center gap-2">
                                                  {{ word }}
                                                  <button @click="removeWord(index)" class="mt-0.5 text-red-500 font-black hover:text-red-700 text-sm">✕</button>
                                                </span>
                                                </div>
                                            </div>
                                            <div v-if="activeCard === 'Word' && words.length !== 0" class="flex items-center gap-2">
                                                <input v-model="newWord" placeholder="Введите новое слово" class="roboto border rounded px-3 py-2 w-full">
                                                <button @click="addNewWord" class="roboto bg-gray-600 transition-all ease-in-out duration-500
                                                 font-medium text-white px-4 py-2 rounded hover:bg-gray-950">Добавить</button>
                                            </div>
                                            <!--Выполняемое действие-->
                                            <div v-if="activeCard === 'Action'" class="flex justify-between gap-4 w-full">
                                                <div class="w-6/12 flex flex-col gap-1">
                                                    <label for="name" class="roboto text-base text-gray-800 font-semibold w-full">Выполняемое действие</label>
                                                    <textarea v-model="action"
                                                              class="roboto scroll-container w-full min-h-[20rem] max-h-[20rem] h-40 p-4 rounded border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                                                              placeholder="Введите описание действия (что нужно сделать)..."
                                                    ></textarea>
                                                    <div class="text-sm text-gray-500 mt-1">
                                                        <code>**</code> – жирный, <code>*</code> – курсив, <code>~~</code> – зачёркнутый, <code>__</code> - жирный,
                                                        <br><code>1.</code> - пункты, <code>-</code> - пункты, <code># ## ###</code> - оглавления.
                                                    </div>
                                                </div>
                                                <div class="w-6/12">
                                                    <h3 class="roboto font-semibold text-gray-700">Предпросмотр:</h3>
                                                    <div class="scroll-container overflow-y-scroll mt-1 h-[20rem] p-4 border rounded bg-gray-50 break-words">
                                                        <div class="max-w-none prose prose-sm" v-html="compiledMarkdownAction"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Вопрос-->
                                            <div v-if="activeCard !== 'Specializations' && activeCard !== 'Action' && activeCard !== 'Lucky' && activeCard !== 'Word'" class="flex items-start justify-between gap-4 w-full">
                                                <div class="w-6/12 flex flex-col gap-1">
                                                    <label for="name" class="roboto text-base text-gray-800 font-semibold w-full">Вопрос</label>
                                                    <textarea v-model="question"
                                                              class="roboto scroll-container w-full min-h-[20rem] max-h-[20rem] h-40 p-4 rounded border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                                                              placeholder="Напишите вопрос..."
                                                    ></textarea>
                                                    <div class="text-sm text-gray-500 mt-1">
                                                        <code>**</code> – жирный, <code>*</code> – курсив, <code>~~</code> – зачёркнутый, <code>__</code> - жирный,
                                                        <br><code>1.</code> - пункты, <code>-</code> - пункты, <code># ## ###</code> - оглавления.
                                                    </div>
                                                </div>
                                                <div class="w-6/12">
                                                    <h3 class="roboto font-semibold text-gray-700">Предпросмотр:</h3>
                                                    <div class="scroll-container overflow-y-scroll mt-1 h-[20rem] p-4 border rounded bg-gray-50 break-words">
                                                        <div class="max-w-none prose prose-sm" v-html="compiledMarkdownQuestion"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Описание к ответу-->
                                            <div v-if="activeCard !== 'Specializations' && activeCard !== 'Action' && activeCard !== 'Lucky' && activeCard !== 'Found'" class="flex items-start justify-between gap-4 w-full">
                                                <div class="w-6/12 flex flex-col gap-1">
                                                    <label v-if="activeCard !== 'Word'" for="name" class="roboto text-base text-gray-800 font-semibold w-full">Описание к ответу</label>
                                                    <label v-else for="name" class="roboto text-base text-gray-800 font-semibold w-full">Описание слова</label>
                                                    <textarea v-model="explanation"
                                                              class="roboto scroll-container w-full min-h-[14rem] max-h-[14rem] h-40 p-4 rounded border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                                                              :placeholder="activeCard !== 'Word' ? 'Введите описание к ответу (дополнение)...': 'Введите описание слова'"
                                                    ></textarea>
                                                    <div class="text-sm text-gray-500 mt-1">
                                                        <code>**</code> – жирный, <code>*</code> – курсив, <code>~~</code> – зачёркнутый, <code>__</code> - жирный,
                                                        <br><code>1.</code> - пункты, <code>-</code> - пункты, <code># ## ###</code> - оглавления.
                                                    </div>
                                                </div>
                                                <div class="w-6/12">
                                                    <h3 class="roboto font-semibold text-gray-700">Предпросмотр:</h3>
                                                    <div class="scroll-container overflow-y-scroll mt-1 h-[14rem] p-4 border rounded bg-gray-50 break-words">
                                                        <div class="max-w-none prose prose-sm" v-html="compiledMarkdownExplanation"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Ответы & очки карточки-->
                                            <div v-if="activeCard !== 'Specializations' && activeCard !== 'Word' && activeCard !== 'Found'" class="flex w-full items-center justify-between gap-4">
                                                <!--Ответ-->
                                                <div v-if="activeCard !== 'Action' && activeCard !== 'Lucky' && activeCard !== 'TF'" class="flex w-6/12 justify-between items-center">
                                                    <label for="name" class="roboto text-base text-gray-800 font-semibold w-2/12">Ответ:</label>
                                                    <input v-model="answer"
                                                           class="roboto w-10/12 px-4 py-2 rounded border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                                                           placeholder="Введите ответ...">
                                                </div>
                                                <!--Правда или ложь на вопрос-->
                                                <div v-if="activeCard === 'TF'" class="flex w-6/12 items-center justify-between">
                                                    <label for="story" class="roboto text-base font-medium">Ответ: {{answerTF}}</label>
                                                    <div class="flex gap-[0.45rem]">
                                                        <button :class="[answerTF === true ? 'bg-green-400 border border-gray-800' : 'border border-gray-800 bg-white text-gray-800 hover:bg-gray-50',
                                                                'roboto px-3 py-1 rounded transition-all duration-300 font-medium']" @click="checkAnswer(true)"
                                                        >T</button>
                                                        <button :class="[answerTF === false ? 'bg-red-400 border border-gray-800' : 'border border-gray-800 bg-white text-gray-800 hover:bg-gray-50',
                                                                'roboto px-3 py-1 rounded transition-all duration-300 font-medium']" @click="checkAnswer(false)"
                                                        >F</button>
                                                    </div>
                                                </div>
                                                <!--Количество очков-->
                                                <div :class="activeCard === 'Action' || activeCard === 'Lucky' ? 'w-full' : 'w-6/12'" class="roboto flex items-center justify-between">
                                                    <div class="flex gap-2">
                                                        <label for="story" class="roboto text-base font-medium">Количество очков:</label>
                                                        <input v-model="points" disabled type="number" class="roboto text-center w-16 font-bold bg-white cursor-no-drop rounded ps-2.5 text-base">
                                                    </div>

                                                    <div class="flex gap-2">
                                                        <div @click="reducePointsSelectAny" class="p-2 rounded border border-gray-800 cursor-pointer">
                                                            <svg class="rotate-90 w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"/>
                                                            </svg>
                                                        </div>
                                                        <div @click="addPointsSelectAny" class="p-2 rounded border border-gray-800 cursor-pointer">
                                                            <svg class="-rotate-90 w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"/>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Картинка-вопрос-ответ-->
                                            <div v-if="activeCard === 'Found'" class="flex w-full justify-between">
                                                <div class="flex flex-col items-start gap-2">
                                                    <h2 class="font-medium text-lg">Изображение вопрос</h2>
                                                    <div class="w-96 h-96 relative block border-black border-2 rounded-2xl overflow-hidden">
                                                        <input type="file" id="img" accept="image/jpeg, image/svg+xml, image/bmp, image/png" name="img" class="absolute text-transparent w-96 h-96 file:w-24 file:h-24 file:border-0 file:bg-transparent
                                                            file:text-transparent" @change="handleFileChange($event, 'urlQuestion')"/>
                                                        <img v-if="previewQuestion" :src="previewQuestion" alt="Загруженное изображение" class="w-96 h-96 object-cover rounded-2xl"/>
                                                        <label v-else class="text-4xl absolute top-1/2 left-1/2" style="transform: translate(-50%, -50%)">+</label>
                                                    </div>
                                                </div>

                                                <div class="flex flex-col items-end gap-2">
                                                    <h2 class="font-medium text-lg">Изображение ответ</h2>
                                                    <div class="w-96 h-96 relative block border-black border-2 rounded-2xl overflow-hidden">
                                                        <input type="file" id="img" accept="image/jpeg, image/svg+xml, image/bmp, image/png" name="img" class="absolute text-transparent w-96 h-96 file:w-24 file:h-24 file:border-0 file:bg-transparent
                                                            file:text-transparent" @change="handleFileChange($event, 'urlAnswer')"/>
                                                        <img v-if="previewAnswer" :src="previewAnswer" alt="Загруженное изображение" class="w-96 h-96 object-cover rounded-2xl"/>
                                                        <label v-else class="text-4xl absolute top-1/2 left-1/2" style="transform: translate(-50%, -50%)">+</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Тип генерации вопросов-->
                                            <div v-if="activeCard === 'Specializations'" class="flex flex-col w-full gap-2">
                                                <label for="" class="roboto font-normal text-base text-gray-800 w-full">Тип генерации</label>
                                                <div class="relative gap-2">
                                                    <div @click="isDropdownOpen = !isDropdownOpen" class="roboto flex border border-gray-800 font-medium justify-between items-center bg-[#f3f4f6] custom-select rounded
                                                        text-base p-2 w-full cursor-pointer">
                                                        {{ selectedType.type || 'Выберите тип получения вопросов' }}
                                                        <ChevronUpIcon class="col-start-1 row-start-1 size-6 mt-0.5 self-center justify-self-end text-gray-500 sm:size-5 rotate-180" aria-hidden="true"/>
                                                    </div>

                                                    <!--Заменить ключ на id и selectedCategory-->
                                                    <div v-show="isDropdownOpen" class="w-full border border-black rounded mt-2 bg-fuchsia-50 transition-all duration-500">
                                                        <div v-for="type in typeGenerations" :key="type.id"
                                                             @click="isDropdownOpen = !isDropdownOpen; selectedType = type"
                                                             class="roboto option font-medium p-2 hover:bg-fuchsia-300 cursor-pointer text-sm text-gray-950">
                                                            {{ type.type }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Специальности-->
                                            <div v-else class="relative w-full">
                                                    <!-- Заголовок селекта -->
                                                <div
                                                    @click="isDropdownOpen = !isDropdownOpen"
                                                    class="roboto flex border border-gray-800 font-medium justify-between items-center bg-[#f3f4f6] custom-select rounded
                                                       text-base p-2 w-full cursor-pointer">
                                                    {{ displaySelectedText }}
                                                    <ChevronUpIcon class="col-start-1 row-start-1 size-6 mt-0.5 self-center justify-self-end text-gray-500 sm:size-5 rotate-180" aria-hidden="true"/>
                                                </div>
                                                <!-- Выпадающий список -->
                                                <div
                                                    v-show="isDropdownOpen"
                                                    class="scroll-smooth md:scroll-auto w-full border border-black rounded mt-2 bg-fuchsia-50 transition-all max-h-48 duration-500 overflow-y-scroll">
                                                    <div v-if="specializations.length > 1"
                                                        @click.stop="allSpecialization(); isDropdownOpen = !isDropdownOpen"
                                                        class="roboto option font-medium p-2 hover:bg-fuchsia-300 cursor-pointer text-sm text-gray-950">
                                                        Все специальности
                                                        <span v-if="selectedSpecialization.includes(0)">✅</span>
                                                    </div>
                                                    <div
                                                        v-for="spec in specializations"
                                                        :key="spec.id"
                                                        @click.stop="toggleSpecialization(spec.id)"
                                                        class="roboto option font-medium p-2 hover:bg-fuchsia-300 cursor-pointer text-sm text-gray-950">
                                                        {{ spec.name }}
                                                        <span v-if="selectedSpecialization.includes(spec.id)">✅</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-xl">
                                <button v-if="activeCard === 'Word' && !generating" type="button" class="roboto font-normal inline-flex w-full justify-center rounded-md bg-[#24262C] px-3 py-2 text-sm text-white shadow-xs hover:bg-[#24262C] sm:ml-3 sm:w-auto" @click="componentsMap[activeCard].generate">Сгенерировать слова</button>
                                <button v-else type="button" class="roboto font-normal inline-flex w-full justify-center rounded-md bg-[#24262C] px-3 py-2 text-sm text-white shadow-xs hover:bg-[#24262C] sm:ml-3 sm:w-auto" @click="componentsMap[activeCard].create">Добавить {{componentsMap[activeCard].name }}</button>
                                <button type="button" class="roboto font-normal mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm  text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto" @click="openCreate = false" ref="cancelButtonRef">Отмена</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
    <!--Update-->
    <TransitionRoot as="template" :show="openUpdate">
        <Dialog class="relative z-10" @close="openUpdate = false">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500/75 transition-opacity"/>
            </TransitionChild>

            <div class="fixed inset-0 z-20 w-screen overflow-y-auto">
                <div class=" flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel :class="activeCard === 'Lucky' || activeCard === 'Specializations' ? 'sm:max-w-lg' : 'sm:max-w-screen-xl'" class="relative transform text-left shadow-xl transition-all sm:my-8 sm:w-full">
                            <div class="bg-white border-b border-gray-300 rounded-t-xl px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="sm:flex sm:items-start">
                                    <div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
                                        <DialogTitle as="h3" class="text-3xl font-black text-gray-800 text-center">Изменить {{ componentsMap[activeCard].name }}</DialogTitle>
                                        <form @submit.prevent class="flex flex-col gap-5 mt-6">
                                            <!--Название специальности-->
                                            <div v-if="activeCard === 'Specializations' || activeCard === 'Word'" class="flex flex-col gap-2 w-full">
                                                <label for="name" class="roboto text-base text-gray-800 font-normal w-full">{{ activeCard === 'Specializations' ? 'Название специальности' : 'Слово'}}</label>
                                                <input v-model="name" id="name" class="roboto text-base text-gray-950 font-medium border border-gray-800 bg-[#f3f4f6] w-full rounded px-3 py-2">
                                            </div>
                                            <!--Отображение генерируемых слов-->
                                            <div v-if="activeCard === 'Word' && startGenerating === true" class="">
                                                <div v-if="words.length === 0" class="inset-0 flex justify-center items-center bg-white bg-opacity-70 z-10">
                                                    <svg class="animate-spin h-8 w-8 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                                        <path class="opacity-75" fill="currentColor"
                                                              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z" />
                                                    </svg>
                                                </div>
                                                <!--Сгенерированные слова-->
                                                <div v-else-if="words.length !== 0" class="roboto flex w-full overflow-y-scroll scroll-container h-max max-h-[24rem] p-2 flex-wrap gap-2">
                                                    <span v-for="(word, index) in words" :key="index"
                                                          class="roboto bg-gray-200 text-gray-900 px-3 py-1 pt-0.5 rounded-full text-sm font-medium flex items-center gap-2">
                                                            {{ word }}
                                                        <button @click="removeWord(index)" class="mt-0.5 text-red-500 font-black hover:text-red-700 text-sm">✕</button>
                                                    </span>
                                                </div>
                                            </div>
                                            <!--Добавление нового слова-->
                                            <div v-if="activeCard === 'Word' && words.length !== 0" class="flex items-center gap-2">
                                                <input v-model="newWord" placeholder="Введите новое слово" class="roboto border rounded px-3 py-2 w-full">
                                                <button @click="addNewWord" class="roboto bg-gray-600 transition-all ease-in-out duration-500
                                                 font-medium text-white px-4 py-2 rounded hover:bg-gray-950">Добавить</button>
                                            </div>
                                            <!--Выполняемое действие-->
                                            <div v-if="activeCard === 'Action'" class="flex justify-between gap-4 w-full">
                                                <div class="w-6/12 flex flex-col gap-1">
                                                    <label for="name" class="roboto text-base text-gray-800 font-semibold w-full">Выполняемое действие</label>
                                                    <textarea v-model="action"
                                                              class="roboto scroll-container w-full min-h-[20rem] max-h-[20rem] h-40 p-4 rounded border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                                                              placeholder="Введите описание к ответу (дополнение)..."
                                                    ></textarea>
                                                    <div class="text-sm text-gray-500 mt-1">
                                                        <code>**</code> – жирный, <code>*</code> – курсив, <code>~~</code> – зачёркнутый, <code>__</code> - жирный,
                                                        <br><code>1.</code> - пункты, <code>-</code> - пункты, <code># ## ###</code> - оглавления.
                                                    </div>
                                                </div>
                                                <div class="w-6/12">
                                                    <h3 class="font-semibold text-gray-700">Предпросмотр:</h3>
                                                    <div class="scroll-container overflow-y-scroll mt-1 h-[20rem] p-4 border rounded bg-gray-50 break-words">
                                                        <div class="max-w-none prose prose-sm" v-html="compiledMarkdownAction"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Вопрос-->
                                            <div v-if="activeCard !== 'Specializations' && activeCard !== 'Action' && activeCard !== 'Lucky' && activeCard !== 'Word'" class="flex items-start justify-between gap-4 w-full">
                                                <div class="w-6/12 flex flex-col gap-1">
                                                    <label for="name" class="roboto text-base text-gray-800 font-semibold w-full">Вопрос</label>
                                                    <textarea v-model="question"
                                                              class="roboto scroll-container w-full min-h-[20rem] max-h-[20rem] h-40 p-4 rounded border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                                                              placeholder="Напишите вопрос..."
                                                    ></textarea>
                                                    <div class="text-sm text-gray-500 mt-1">
                                                        <code>**</code> – жирный, <code>*</code> – курсив, <code>~~</code> – зачёркнутый, <code>__</code> - жирный,
                                                        <br><code>1.</code> - пункты, <code>-</code> - пункты, <code># ## ###</code> - оглавления.
                                                    </div>
                                                </div>
                                                <div class="w-6/12">
                                                    <h3 class="font-semibold text-gray-700">Предпросмотр:</h3>
                                                    <div class="scroll-container overflow-y-scroll mt-1 h-[20rem] p-4 border rounded bg-gray-50 break-words">
                                                        <div class="max-w-none prose prose-sm" v-html="compiledMarkdownQuestion"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Описание к ответу-->
                                            <div v-if="activeCard !== 'Specializations' && activeCard !== 'Action' && activeCard !== 'Lucky' && activeCard !== 'Found'" class="flex items-start justify-between gap-4 w-full">
                                                <div class="w-6/12 flex flex-col gap-1">
                                                    <label for="name" class="roboto text-base text-gray-800 font-semibold w-full">Описание к ответу</label>
                                                    <textarea v-model="explanation"
                                                              class="roboto scroll-container w-full min-h-[14rem] max-h-[14rem] h-40 p-4 rounded border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                                                              placeholder="Введите описание к ответу (дополнение)..."
                                                    ></textarea>
                                                    <div class="text-sm text-gray-500 mt-1">
                                                        <code>**</code> – жирный, <code>*</code> – курсив, <code>~~</code> – зачёркнутый, <code>__</code> - жирный,
                                                        <br><code>1.</code> - пункты, <code>-</code> - пункты, <code># ## ###</code> - оглавления.
                                                    </div>
                                                </div>
                                                <div class="w-6/12">
                                                    <h3 class="font-semibold text-gray-700">Предпросмотр:</h3>
                                                    <div class="scroll-container overflow-y-scroll mt-1 h-[14rem] p-4 border rounded bg-gray-50 break-words">
                                                        <div class="max-w-none prose prose-sm" v-html="compiledMarkdownExplanation"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Картинка вопрос и ответ-->
                                            <div v-if="activeCard === 'Found'" class="flex w-full justify-between">
                                                <div class="flex flex-col items-start gap-2">
                                                    <h2 class="font-medium text-lg">Изображение вопрос</h2>
                                                    <div class="w-96 h-96 relative block border-black border-2 rounded-2xl overflow-hidden">
                                                        <input type="file" id="img" accept="image/jpeg, image/bmp, image/png" name="img" class="absolute text-transparent w-96 h-96 file:w-24 file:h-24 file:border-0 file:bg-transparent
                                                            file:text-transparent" @change="handleFileChange($event, 'urlQuestion')"/>
                                                        <img v-if="previewQuestion" :src="isProgramLoadingQuestion ? '/storage/' + previewQuestion : previewQuestion" alt="Загруженное изображение" class="w-96 h-96 object-cover rounded-2xl"/>
                                                        <label v-else class="text-4xl absolute top-1/2 left-1/2" style="transform: translate(-50%, -50%)">+</label>
                                                    </div>
                                                </div>

                                                <div class="flex flex-col items-end gap-2">
                                                    <h2 class="font-medium text-lg">Изображение ответ</h2>
                                                    <div class="w-96 h-96 relative block border-black border-2 rounded-2xl overflow-hidden">
                                                        <input type="file" id="img" accept="image/jpeg, image/bmp, image/png" name="img" class="absolute text-transparent w-96 h-96 file:w-24 file:h-24 file:border-0 file:bg-transparent
                                                            file:text-transparent" @change="handleFileChange($event, 'urlAnswer')"/>
                                                        <img v-if="previewAnswer" :src="isProgramLoadingAnswer ? '/storage/' + previewAnswer : previewAnswer" alt="Загруженное изображение" class="w-96 h-96 object-cover rounded-2xl"/>
                                                        <label v-else class="text-4xl absolute top-1/2 left-1/2" style="transform: translate(-50%, -50%)">+</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Ответы & очки карточки-->
                                            <div v-if="activeCard !== 'Specializations' && activeCard !== 'Word' && activeCard !== 'Found'" class="flex w-full items-center justify-between gap-4">
                                                <!--Ответ-->
                                                <div v-if="activeCard !== 'Action' && activeCard !== 'Lucky' && activeCard !== 'TF'" class="flex w-6/12 justify-between items-center">
                                                    <label for="name" class="roboto text-base text-gray-800 font-semibold w-2/12">Ответ:</label>
                                                    <input v-model="answer"
                                                           class="roboto w-10/12 px-4 py-2 rounded border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition"
                                                           placeholder="Введите ответ...">
                                                </div>
                                                <!--Правда или ложь на вопрос-->
                                                <div v-if="activeCard === 'TF'" class="flex w-6/12 items-center justify-between">
                                                    <label for="story" class="roboto text-base font-medium">Ответ: {{answerTF}}</label>
                                                    <div class="flex gap-[0.45rem]">
                                                        <button :class="[answerTF === true ? 'bg-green-400 border border-gray-800' : 'border border-gray-800 bg-white text-gray-800 hover:bg-gray-50',
                                                                'roboto px-3 py-1 rounded transition-all duration-300 font-medium']" @click="checkAnswer(true)"
                                                        >T</button>
                                                        <button :class="[answerTF === false ? 'bg-red-400 border border-gray-800' : 'border border-gray-800 bg-white text-gray-800 hover:bg-gray-50',
                                                                'roboto px-3 py-1 rounded transition-all duration-300 font-medium']" @click="checkAnswer(false)"
                                                        >F</button>
                                                    </div>
                                                </div>
                                                <!--Количество очков-->
                                                <div :class="activeCard === 'Action' || activeCard === 'Lucky' ? 'w-full' : 'w-6/12'" class="flex items-center justify-between">
                                                    <div class="flex gap-2">
                                                        <label for="story" class="roboto text-base font-medium">Количество очков:</label>
                                                        <input v-model="points" disabled type="number" class="roboto text-center w-16 font-bold bg-white cursor-no-drop rounded ps-2.5 text-base">
                                                    </div>

                                                    <div class="flex gap-2">
                                                        <div @click="reducePointsSelectAny" class="p-2 rounded border border-gray-800 cursor-pointer">
                                                            <svg class="rotate-90 w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"/>
                                                            </svg>
                                                        </div>
                                                        <div @click="addPointsSelectAny" class="p-2 rounded border border-gray-800 cursor-pointer">
                                                            <svg class="-rotate-90 w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"/>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Тип генерации вопросов-->
                                            <div v-if="activeCard === 'Specializations'" class="flex flex-col w-full gap-2">
                                                <label for="" class="text-base text-gray-800 font-normal roboto w-full">Тип генерации</label>
                                                <div class="relative gap-3">
                                                    <div @click="isDropdownOpen = !isDropdownOpen" class="roboto flex border border-gray-800 font-medium justify-between items-center bg-[#f3f4f6] custom-select rounded
                                                        text-base p-2 w-full cursor-pointer">
                                                        {{ selectedType.type || 'Выберите тип получения вопросов' }}
                                                        <ChevronUpIcon class="col-start-1 row-start-1 size-6 mt-0.5 self-center justify-self-end text-gray-500 sm:size-5 rotate-180" aria-hidden="true"/>
                                                    </div>

                                                    <div v-show="isDropdownOpen" class=" w-full border border-black rounded mt-2 bg-fuchsia-50 transition-all duration-500">
                                                        <div v-for="type in typeGenerations" :key="type.id"
                                                             @click="isDropdownOpen = !isDropdownOpen; selectedType = type"
                                                             class="roboto option font-medium p-2 hover:bg-fuchsia-300 cursor-pointer text-sm text-gray-950">
                                                            {{ type.type }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!--Специальности-->
                                            <div v-else class="relative w-full">
                                                <!-- Заголовок селекта -->
                                                <div
                                                    @click="isDropdownOpen = !isDropdownOpen"
                                                    class="roboto flex border border-gray-800 font-medium justify-between items-center bg-[#f3f4f6] custom-select rounded
                                                       text-base p-2 w-full cursor-pointer">
                                                    {{ displaySelectedText }}
                                                    <ChevronUpIcon class="col-start-1 row-start-1 size-6 mt-0.5 self-center justify-self-end text-gray-500 sm:size-5 rotate-180" aria-hidden="true"/>
                                                </div>
                                                <!-- Выпадающий список -->
                                                <div v-show="isDropdownOpen" class="scroll-smooth md:scroll-auto w-full border border-black rounded mt-2 bg-fuchsia-50 transition-all max-h-48 duration-500 overflow-y-scroll">
                                                    <div v-if="specializations.length > 1"
                                                         @click.stop="allSpecialization(); isDropdownOpen = !isDropdownOpen"
                                                         class="roboto option font-medium p-2 hover:bg-fuchsia-300 cursor-pointer text-sm text-gray-950">
                                                        Все специальности
                                                        <span v-if="selectedSpecialization.includes(0)">✅</span>
                                                    </div>
                                                    <div
                                                        v-for="spec in specializations"
                                                        :key="spec.id"
                                                        @click.stop="toggleSpecialization(spec.id)"
                                                        class="roboto option font-medium p-2 hover:bg-fuchsia-300 cursor-pointer text-sm text-gray-950">
                                                        {{ spec.name }}
                                                        <span v-if="selectedSpecialization.includes(spec.id)">✅</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-xl">
                                <button v-if="activeCard === 'Word' && generating === false" type="button" class="roboto font-normal inline-flex w-full justify-center rounded-md bg-[#24262C] px-3 py-2 text-sm text-white shadow-xs hover:bg-[#24262C] sm:ml-3 sm:w-auto" @click="componentsMap[activeCard].generate">Сгенерировать слова</button>
                                <button v-else  type="button" class="roboto font-normal inline-flex w-full justify-center rounded-md bg-[#24262C] px-3 py-2 text-sm text-white shadow-xs hover:bg-[#24262C] sm:ml-3 sm:w-auto" @click="componentsMap[activeCard].update">Применить изменения</button>
                                <button type="button" class="roboto font-normal mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto" @click="openUpdate = false" ref="cancelButtonRef">Отмена</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
    <!--Delete-->
    <TransitionRoot as="template" :show="openDelete">
        <Dialog class="relative z-20" @close="openDelete = false">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500/75 transition-opacity"/>
            </TransitionChild>

            <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel class="relative transform text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div class="bg-white border-b border-gray-300 rounded-t-xl px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="sm:flex sm:items-start">
                                    <div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
                                        <DialogTitle as="h3" class="text-3xl font-black text-gray-800 text-center">Удалить {{componentsMap[activeCard].name }}</DialogTitle>
                                        <h2 v-if="activeCard === 'Specializations'" class="roboto text-base font-normal mt-4 italic"><span class="font-bold text-lg not-italic">
                                            Специальность:</span> <br> {{deleteItem.name}}
                                        </h2>
                                        <h2 v-if="activeCard === 'Word'" class="roboto text-base font-normal mt-4 italic"><span class="font-bold text-lg not-italic">
                                            Слово:</span> <br> {{deleteItem.word}}
                                        </h2>
                                        <div v-if="activeCard === 'Action'" class="roboto text-base font-normal mt-4 italic"><span class="font-bold text-lg not-italic">
                                            Действие:</span><br>
                                            <div class="scroll-container overflow-y-scroll mt-1 h-max p-4 border rounded bg-gray-50 break-words">
                                                <div class="max-w-none prose prose-sm" v-html="compiledMarkdownAction"></div>
                                            </div>
                                        </div>
                                        <div v-if="activeCard === 'TF' || activeCard === 'Decide' || activeCard === 'Question' || activeCard === 'Found'" class="text-base font-normal mt-4 italic"><span class="roboto font-bold text-lg not-italic">
                                            Вопрос:</span><br>
                                            <div class="scroll-container overflow-y-scroll mt-1 h-max p-4 border rounded bg-gray-50 break-words">
                                                <div class="roboto max-w-none prose prose-sm" v-html="compiledMarkdownQuestion"></div>
                                            </div>
                                        </div>
                                        <h2 v-if="activeCard !== 'Specializations' && activeCard !== 'Word' && activeCard !== 'Found'" class="roboto text-base font-normal mt-4 italic"><span class="roboto font-bold text-lg not-italic">
                                            Очки:</span> <br> {{deleteItem.points}}
                                        </h2>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-xl">
                                <button type="button" class="roboto inline-flex w-full justify-center rounded-md bg-[#24262C] px-3 py-2 text-sm font-normal text-white shadow-xs hover:bg-[#24262C] sm:ml-3 sm:w-auto" @click="componentsMap[activeCard].del">Продолжить</button>
                                <button type="button" class="roboto mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-normal text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto" @click="openDelete = false" ref="cancelButtonRef">Отмена</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import {ref, computed, watch, nextTick, reactive} from 'vue'
import MarkdownIt from "markdown-it";
import markdownItMark from 'markdown-it-mark'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import {router} from "@inertiajs/vue3";
import {ChevronUpIcon} from "@heroicons/vue/16/solid/index.js";
import axios from "axios";
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: true
}).use(markdownItMark)

const compiledMarkdownQuestion = computed(() => md.render(question.value));
const compiledMarkdownAction = computed(()=> md.render(action.value));
const compiledMarkdownExplanation = computed(() => md.render(explanation.value));

const props = defineProps({
    content: Array
})

const emit = defineEmits(['againGetContent', 'closeRightModal', 'updateRightModal'])
const form = reactive({
    urlQuestion: null, // File
    urlAnswer: null,   // File
});
const isProgramLoadingQuestion = ref(false);
const isProgramLoadingAnswer = ref(false);
const open = ref(false);
const previewQuestion = ref(null);
const previewAnswer = ref(null);
const isDropdownOpen = ref(false);
const selectedType = ref('');
const typeGenerations = [
    {id: 1, type: 'Присылать из БД', valueType: 0},
    {id: 2, type: 'Генерировать с помощью нейросети', valueType: 1}
]
const newWord = ref('');
const name = ref('');
const isLoadingItem = ref(false);
const selectedSpecialization = ref([]);
const specializations = ref([]);
const points = ref(50);
const action = ref('');
const words = ref([]);
const question = ref('');
const explanation = ref('');
const generating = ref(false);
const startGenerating = ref(false);
const deleteItem = ref(null);
const updateItem = ref(null);
const openCreate = ref(false);
const openUpdate = ref(false);
const openDelete = ref(false);
const activeCard = ref('Specializations')
const answerTF = ref(null);
const answer = ref('');

const checkAnswer = (answer) => {
    answerTF.value = answer
}
const reducePointsSelectAny = () =>{
    switch (activeCard.value){
        case 'Lucky':
            if(points.value !== -100){
                points.value -= 10
                if(points.value === 0) points.value -= 10
            }else{
                alert('Минимальное кол-во очков у Удачи = -100')
            }
            break;
        case 'Action':
            if(points.value !== 10){
                points.value -= 10
            }else{
                alert('Минимальное кол-во очков у Удачи = 10')
            }
            break;
        case 'TF':
            if(points.value !== 10){
                points.value -= 10
            }else{
                alert('Минимальное кол-во очков у Правды или Ложь = 10')
            }
            break;
        case 'Decide':
            if(points.value !== 10){
                points.value -= 10
            }else{
                alert('Минимальное кол-во очков у Решай-ка = 10')
            }
            break;
        case 'Question':
            if(points.value !== 10){
                points.value -= 10
            }else{
                alert('Минимальное кол-во очков у Внимание, вопрос = 10')
            }
            break;
    }
}
const addPointsSelectAny = () =>{
    switch (activeCard.value){
        case 'Lucky':
            if(points.value !== 100){
                points.value += 10
                if(points.value === 0) points.value += 10
            }else{
                alert('Максимальное кол-во очков у Удачи = 100')
            }
            break;
        case 'Action':
            if(points.value !== 50){
                points.value += 10
            }else{
                alert('Максимальное кол-во очков у Действия = 50')
            }
            break;
        case 'TF':
            if(points.value !== 50){
                points.value += 10
            }else{
                alert('Максимальное кол-во очков у Правды или Ложь = 50')
            }
            break;
        case 'Decide':
            if(points.value !== 50){
                points.value += 10
            }else{
                alert('Максимальное кол-во очков у Решай=ка = 50')
            }
            break;
        case 'Question':
            if(points.value !== 50){
                points.value += 10
            }else{
                alert('Максимальное кол-во очков у Внимание, вопрос = 50')
            }
            break;
    }
}
//
const allSpecialization = () =>{
    selectedSpecialization.value = []
    selectedSpecialization.value.push(0);
}
const toggleSpecialization = (id) => {
    if (selectedSpecialization.value.includes(0)){
        selectedSpecialization.value = []
    }
    const index = selectedSpecialization.value.indexOf(id)
    if (index === -1) {
        selectedSpecialization.value.push(id)
    } else {
        selectedSpecialization.value.splice(index, 1)
    }

    if (selectedSpecialization.value.length === specializations.value.length && selectedSpecialization.value.length > 1){
        selectedSpecialization.value = [];
        selectedSpecialization.value.push(0);
    }
}
const displaySelectedText = computed( () => {
    if (selectedSpecialization.value.includes(0) || allSelected.value) return 'Выбраны все специальности'
    else if (selectedSpecialization.value.length === 0) return 'Выберите специальность'
    else if (selectedSpecialization.value.length === 1) {
        const spec = specializations.value.find(s => s.id === selectedSpecialization.value[0])
        return spec?.name || 'Выбрана 1 (одна) специальность'
    }
    return 'Выбрано несколько специальностей'
});
//Добавление чего-либо в зависимости от полученных данных
const addSpecialization = () => {
    if (name.value.trim() !== '') {
        if (selectedType.value !== '') {
            const trimmedName = name.value.trim().toLowerCase();

            const isDuplicate = props.content.some(spec => {
                return spec.name.trim().toLowerCase() === trimmedName &&
                    spec.method === selectedType.value.valueType;
            });

            if (isDuplicate) {
                alert('Такая специальность с выбранным типом уже существует');
                return;
            }

            // Отправка запроса
            router.post('/admin/specialization/add', {
                method: selectedType.value.valueType,
                name: name.value.trim()
            }, {
                onSuccess: ()=>{
                    emit('closeRightModal');
                    emit('againGetContent');
                    openCreate.value = false;
                }
            });
        } else {
            alert('Выберите тип получения вопросов.');
        }
    } else {
        alert('Введите название специальности');
    }
}
const deleteSpecialization = () =>{
    router.delete(`/admin/specialization/delete/${deleteItem.value.id}`, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openDelete.value = false;
        }
    })
}
const putSpecialization = () =>{
    if(name.value !== ''){
        router.put(`/admin/specialization/put/${updateItem.value.id}`, {name: name.value, method: selectedType.value.valueType}, {
            onSuccess: ()=>{
                emit('closeRightModal');
                emit('againGetContent');
                openUpdate.value = false
            }
        })
    }else{
        alert('Название специальности не должно быть пустым')
    }
}
//
const addLucky = () => {
    if(selectedSpecialization.value.length !== 0){
        if(props.content.some(luckyCard => luckyCard.points === points.value)){
            alert('Очки должны быть уникальны и не должны повторяться')
            return
        }

        router.post('/admin/lucky/add', {
            points: points.value,
            specializations: selectedSpecialization.value
        }, {
            onSuccess: ()=>{
                emit('closeRightModal');
                emit('againGetContent');
                openCreate.value = false;
            }
        });
    }else{
        alert('Нужно выбрать специальности, в которых будут участвовать карточки "Лови Удачу"')
    }
}
const deleteLucky = () => {
    router.delete(`/admin/lucky/delete/${deleteItem.value.id}`,{
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openDelete.value = false;
        }
    })
}
const putLucky = () => {
    if (props.content.some(luckyCard =>
            luckyCard.points === points.value &&
            luckyCard.id !== updateItem.value.id)
    ) {
        alert('Очки должны быть уникальны и не должны повторяться');
        return;
    }
    router.put(`/admin/lucky/put/${updateItem.value.id}`, {points: points.value, specializations: selectedSpecialization.value}, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openUpdate.value = false
        }
    })
}
//
const addAction = () => {
    if (action.value.trim() !== '') {
        const trimmedAction = action.value.trim().toLowerCase();

        const isDuplicate = props.content.some(card => {
            return card.action.trim().toLowerCase() === trimmedAction &&
                card.points === points.value;
        });

        if (isDuplicate) {
            alert('Карточка с таким действием и количеством очков уже существует');
            return;
        }

        if (selectedSpecialization.value.length !== 0) {
            router.post('/admin/action/add', {
                action: action.value.trim(),
                points: points.value,
                specializations: selectedSpecialization.value
            }, {
                onSuccess: ()=>{
                    emit('closeRightModal');
                    emit('againGetContent');
                    openCreate.value = false;
                }
            });
        } else {
            alert('Нужно выбрать специальности, в которых будут отображаться карточка "Действия"');
        }
    } else {
        alert('Карточка должна иметь реализуемое действие');
    }
}
const putAction = () => {
    if (props.content.some(actionCard =>
        actionCard.points === points.value &&
        actionCard.action.trim().toLowerCase() === action.value.trim().toLowerCase() &&
        actionCard.id !== updateItem.value.id)
    ){
        alert('Действие и очки должны быть уникальны и не должны повторяться');
        return;
    }
    router.put(`/admin/action/put/${updateItem.value.id}`, {action: action.value, points: points.value, specializations: selectedSpecialization.value}, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openUpdate.value = false
        }
    })
}
const deleteAction = () =>{
    router.delete(`/admin/action/delete/${deleteItem.value.id}`, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openDelete.value = false;
        }
    })
}
//
const addDecide = () => {
    const trimmedTF = question.value.trim();
    // Проверка: пустой вопрос
    if (trimmedTF === '') {
        alert('Карточка должна содержать вопрос');
        return;
    }
    // Проверка: не выбран ответ Правда/Ложь
    if (answer.value === null) {
        alert('Нужно ввести ответ');
        return;
    }
    // Проверка: повтор карточки
    const isDuplicate = props.content.some(card => {
        return card.question.trim().toLowerCase() === trimmedTF.toLowerCase() &&
            card.points === points.value
    });
    if (isDuplicate) {
        alert('Карточка с таким действием и количеством очков уже существует');
        return;
    }
    // Проверка: выбраны ли специальности
    if (selectedSpecialization.value.length === 0) {
        alert('Нужно выбрать специальности, в которых будут отображаться карточка "Действия"');
        return;
    }
    // Все проверки пройдены — отправка данных
    router.post('/admin/decide/add', {
        question: trimmedTF,
        points: points.value,
        answer: answer.value,
        explanation: explanation.value,
        specializations: selectedSpecialization.value},
        {onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openCreate.value = false;
        }
    });
}
const putDecide = () =>{
    if (props.content.some(tFCard =>
        tFCard.points === points.value &&
        tFCard.question.trim().toLowerCase() === question.value.trim().toLowerCase() &&
        tFCard.id !== updateItem.value.id)
    ){
        alert('Карточки "Решай-ка" и очки должны быть уникальны и не должны повторяться');
        return;
    }

    router.put(`/admin/decide/put/${updateItem.value.id}`, {
        question: question.value,
        explanation:explanation.value,
        answer:answer.value,
        points: points.value,
        specializations: selectedSpecialization.value}, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openUpdate.value = false;
        }
    })
}
const deleteDecide = () => {
    router.delete(`/admin/decide/delete/${deleteItem.value.id}`, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openDelete.value = false;
        }
    })
}
//
const handleFileChange = (event, field) => {
    const file = event.target.files[0]
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        if (field === 'urlQuestion') {
            previewQuestion.value = e.target.result;
            form.urlQuestion = file; // ✅ сохрани файл
        } else if (field === 'urlAnswer') {
            previewAnswer.value = e.target.result;
            form.urlAnswer = file; // ✅ сохрани файл
        }
    };
    reader.readAsDataURL(file);
}
const addFound = () => {
    const formData = new FormData();
    const trimmedTF = question.value.trim();
    // Проверка: пустой вопрос
    if (trimmedTF === '') {
        alert('Карточка должна содержать вопрос');
        return;
    }
    formData.append('question', trimmedTF);
    if (selectedSpecialization.value.length === 0) {
        alert('Нужно выбрать специальности, в которых будут отображаться карточка "Найди-меня"');
        return;
    }
    if (form.urlQuestion === null){
        alert('Вставьте картинку Вопрос')
        return;
    }
    formData.append('urlQuestion', form.urlQuestion);
    if (form.urlAnswer === null){
        alert('Вставьте картинку Ответ')
        return;
    }
    formData.append('urlAnswer', form.urlAnswer);
    selectedSpecialization.value.forEach(id => {
        formData.append('specializations[]', id);
    });
    router.post('admin/found/add', formData, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openCreate.value = false;
        }
    })
}
const putFound = () => {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    const trimmedTF = question.value.trim();
    // Проверка: пустой вопрос
    if (trimmedTF === '') {
        alert('Карточка должна содержать вопрос');
        return;
    }
    formData.append('question', trimmedTF);
    console.log(trimmedTF);
    if (selectedSpecialization.value.length === 0) {
        alert('Нужно выбрать специальности, в которых будут отображаться карточка "Найди-меня"');
        return;
    }
    selectedSpecialization.value.forEach(id => {
        formData.append('specializations[]', id);
    });
    if (form.urlQuestion === null){
        alert('Вставьте картинку Вопрос')
        return;
    }
    formData.append('urlQuestion', form.urlQuestion);
    if (form.urlAnswer=== null){
        alert('Вставьте картинку Ответ')
        return;
    }
    formData.append('urlAnswer', form.urlAnswer);
    router.post(`admin/found/put/${updateItem.value.id}`, formData, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openUpdate.value = false;
        }
    })
}
const deleteFound = () => {
    router.delete(`/admin/found/delete/${deleteItem.value.id}`, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openDelete.value = false;
        }
    })
}
//
const addQuestion = () => {
    const trimmedTF = question.value.trim();
    // Проверка: пустой вопрос
    if (trimmedTF === '') {
        alert('Карточка должна содержать вопрос');
        return;
    }
    // Проверка: не выбран ответ Правда/Ложь
    if (answer.value === null) {
        alert('Нужно ввести ответ');
        return;
    }
    // Проверка: повтор карточки
    const isDuplicate = props.content.some(card => {
        return card.question.trim().toLowerCase() === trimmedTF.toLowerCase() &&
            card.points === points.value
    });
    if (isDuplicate) {
        alert('Карточка с таким действием и количеством очков уже существует');
        return;
    }
    // Проверка: выбраны ли специальности
    if (selectedSpecialization.value.length === 0) {
        alert('Нужно выбрать специальности, в которых будут отображаться карточка "Действия"');
        return;
    }
    // Все проверки пройдены — отправка данных
    router.post('/admin/question/add', {
        question: trimmedTF,
        points: points.value,
        answer: answer.value,
        explanation: explanation.value,
        specializations: selectedSpecialization.value
    }, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openCreate.value = false;
        }
    });
}
const putQuestion = () => {
    if (props.content.some(tFCard =>
        tFCard.points === points.value &&
        tFCard.question.trim().toLowerCase() === question.value.trim().toLowerCase() &&
        tFCard.id !== updateItem.value.id)
    ){
        alert('Карточки "Внимание, вопрос!" и очки должны быть уникальны и не должны повторяться');
        return;
    }

    router.put(`/admin/question/put/${updateItem.value.id}`, {
        question: question.value,
        explanation:explanation.value,
        answer:answer.value,
        points: points.value,
        specializations: selectedSpecialization.value
    }, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openUpdate.value = false;
        }
    })
}
const deleteQuestion = () => {
    router.delete(`/admin/question/delete/${deleteItem.value.id}`, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openDelete.value = false;
        }
    })
}
//
const addTF = () => {
    const trimmedTF = question.value.trim();
    // Проверка: пустой вопрос
    if (trimmedTF === '') {
        alert('Карточка должна содержать вопрос');
        return;
    }
    // Проверка: не выбран ответ Правда/Ложь
    if (answerTF.value === null) {
        alert('Нужно выбрать ответ: "Правда" или "Ложь"');
        return;
    }
    // Проверка: повтор карточки
    const isDuplicate = props.content.some(card => {
        return card.question.trim().toLowerCase() === trimmedTF.toLowerCase() &&
            card.points === points.value
    });
    if (isDuplicate) {
        alert('Карточка с таким действием и количеством очков уже существует');
        return;
    }
    // Проверка: выбраны ли специальности
    if (selectedSpecialization.value.length === 0) {
        alert('Нужно выбрать специальности, в которых будут отображаться карточка "Действия"');
        return;
    }
    // Все проверки пройдены — отправка данных
    router.post('/admin/tf/add', {
        question: trimmedTF,
        points: points.value,
        answer: answerTF.value,
        explanation: explanation.value,
        specializations: selectedSpecialization.value
    }, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openCreate.value = false;
        }
    });
};
const putTF = () => {
    if (props.content.some(tFCard =>
        tFCard.points === points.value &&
        tFCard.question.trim().toLowerCase() === question.value.trim().toLowerCase() &&
        tFCard.id !== updateItem.value.id)
    ){
        alert('Карточки "Правда или Ложь" и очки должны быть уникальны и не должны повторяться');
        return;
    }

    router.put(`/admin/tf/put/${updateItem.value.id}`, {
        question: question.value,
        explanation:explanation.value,
        answer:answerTF.value,
        points: points.value,
        specializations: selectedSpecialization.value
    }, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openUpdate.value = false;
        }
    })
}
const deleteTF = () => {
    router.delete(`/admin/tf/delete/${deleteItem.value.id}`, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openDelete.value = false;
        }
    })
}
//
async function generateWords() {
    if (name.value.length > 8){
        startGenerating.value = true;
        const response = await axios.post('admin/word/generate', { word: name.value });
        generating.value = true;
        words.value = response.data.words;
    }else{
        alert('Слишком короткое слово')
    }
}
function removeWord(index) {
    words.value.splice(index, 1);
}
const addNewWord = () => {
    const word = newWord.value.trim().toLowerCase()
    const source = name.value.trim().toLowerCase()

    if (!generating.value) {alert('Чтобы добавить слово, нужно в начале сгенерировать слова'); return;}

    if (!word) return

    if (canBeFormedFrom(word, source)) {
        if (!words.value.includes(word)){
            words.value.push(word)
            newWord.value = ''
        }else{
            alert('Такое слово уже есть в списке')
        }
    } else {
        alert('Невозможно составить слово из букв исходного слова.')
    }
}
// Проверка: можно ли составить слово
const canBeFormedFrom = (word, source) => {
    const countLetters = (str) => {
        const map = {}
        for (const char of str) {
            map[char] = (map[char] || 0) + 1
        }
        return map
    }

    const wordLetters = countLetters(word)
    const sourceLetters = countLetters(source)

    return Object.keys(wordLetters).every(
        (letter) => (sourceLetters[letter] || 0) >= wordLetters[letter]
    )
}
const addWord = () => {
    const trimmedTF = name.value.trim();
    // Проверка: пустой вопрос
    if (trimmedTF === '') {
        alert('Карточка должна содержать слово');
        return;
    }
    // Проверка: не выбран ответ Правда/Ложь
    if (words.value.length <10) {
        alert('У букв слова должно быть хотя бы больше 10 сочетаний');
        return;
    }
    // Проверка: повтор карточки
    const isDuplicate = props.content.some(card => {
        return card.word.trim().toLowerCase() === trimmedTF.toLowerCase()
    });
    if (isDuplicate) {
        alert('Карточка с таким словом уже существует');
        return;
    }
    // Проверка: выбраны ли специальности
    if (selectedSpecialization.value.length === 0) {
        alert('Нужно выбрать специальности, в которых будут отображаться карточка "Слово-дел"');
        return;
    }
    // Все проверки пройдены — отправка данных
    router.post('/admin/word/add', {
        word: trimmedTF,
        words: words.value,
        explanation: explanation.value,
        specializations: selectedSpecialization.value
    }, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openCreate.value = false;
        }
    });
}
const putWord = () => {
    if (props.content.some(tFCard =>
        tFCard.word.trim().toLowerCase() === name.value.trim().toLowerCase() &&
        tFCard.id !== updateItem.value.id)
    ){
        alert('Карточки "Слово-дел" должны быть уникальны и не должны повторяться');
        return;
    }

    router.put(`/admin/word/put/${updateItem.value.id}`, {
        word: name.value,
        explanation:explanation.value,
        words:words.value,
        specializations: selectedSpecialization.value
    }, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openUpdate.value = false;
        }
    })
}
const deleteWord = () => {
    router.delete(`/admin/word/delete/${deleteItem.value.id}`, {
        onSuccess: ()=>{
            emit('closeRightModal');
            emit('againGetContent');
            openDelete.value = false;
        }
    })
}
//

const componentsMap = {
    Action: {name: 'Карточку "Действие"', create: addAction, update: putAction, del: deleteAction},
    Decide: {name: 'Карточку "Решай-ка"', create: addDecide, update: putDecide, del: deleteDecide},
    Found: {name: 'Карточку "Найди меня"', create: addFound, update: putFound, del: deleteFound},
    Lucky: {name: 'Карточку "Удачи"', create: addLucky, update: putLucky, del: deleteLucky},
    Question: {name: 'Карточку "Внимание, вопрос!"', create: addQuestion, update: putQuestion, del: deleteQuestion},
    TF: {name: 'Карточку "Правда или ложь"', create: addTF, update: putTF, del: deleteTF},
    Word: {name: 'Карточку "Словодел"', create: addWord, update: putWord, del: deleteWord, generate: generateWords},
    Specializations: {name: 'Специальность', create: addSpecialization, update: putSpecialization, del: deleteSpecialization}
}

const openUserModal = () => {
    open.value = true
}
const openCreateModal = async (value) => {
    switch (value){
        case 'Specializations':
            isDropdownOpen.value = false;
            name.value = ''
            selectedType.value = ''
            break;
        case 'Lucky':
            isDropdownOpen.value = false;
            await getSpecialization();
            points.value = 50;
            selectedSpecialization.value = [];
            break;
        case 'Action':
            isDropdownOpen.value = false;
            await getSpecialization();
            points.value = 10;
            selectedSpecialization.value = [];
            action.value = ''
            break;
        case 'TF':
            isDropdownOpen.value = false;
            await getSpecialization();
            question.value = ''
            answerTF.value = null;
            explanation.value = ''
            points.value = 30;
            selectedSpecialization.value = [];
            break;
        case 'Decide':
            isDropdownOpen.value = false;
            await getSpecialization();
            question.value = ''
            answer.value = null;
            explanation.value = ''
            points.value = 40;
            selectedSpecialization.value = [];
            break;
        case 'Question':
            isDropdownOpen.value = false;
            await getSpecialization();
            question.value = ''
            answer.value = null;
            explanation.value = ''
            points.value = 50;
            selectedSpecialization.value = [];
            break;
        case 'Word':
            newWord.value = '';
            startGenerating.value = false;
            generating.value = false;
            isDropdownOpen.value = false;
            await getSpecialization();
            name.value = ''
            explanation.value = ''
            selectedSpecialization.value = [];
            break;
        case 'Found':
            await getSpecialization();
            question.value = ''
            previewAnswer.value = null;
            previewQuestion.value = null;
            selectedSpecialization.value = [];
            break;
    }
    openCreate.value = true
    activeCard.value = value
}
const openUpdateModal = async (item, value) => {
    isDropdownOpen.value = false;
    activeCard.value = value
    updateItem.value = item
    switch (value){
        case 'Specializations':
            name.value = item.name
            selectedType.value = typeGenerations[item.method]
            break;
        case 'Lucky':
            await getSpecialization();
            points.value = item.points
            if(item.specializations.length === specializations.value.length && specializations.value.length > 1){
                selectedSpecialization.value = [];
                selectedSpecialization.value.push(0);
            }else{
                selectedSpecialization.value = item.specializations.map(s => s.id)
            }
            break;
        case 'Action':
            await getSpecialization();
            action.value = item.action;
            points.value = item.points
            if(item.specializations.length === specializations.value.length && specializations.value.length > 1){
                selectedSpecialization.value = [];
                selectedSpecialization.value.push(0);
            }else{
                selectedSpecialization.value = item.specializations.map(s => s.id)
            }
            break;
        case 'TF':
            await getSpecialization();
            question.value = item.question;
            answerTF.value = item.answer
            explanation.value = item.explanation ?? '';
            points.value = item.points
            if(item.specializations.length === specializations.value.length && specializations.value.length > 1){
                selectedSpecialization.value = [];
                selectedSpecialization.value.push(0);
            }else{
                selectedSpecialization.value = item.specializations.map(s => s.id)
            }
            break;
        case 'Decide':
            await getSpecialization();
            question.value = item.question;
            answer.value = item.answer
            explanation.value = item.explanation ?? '';
            points.value = item.points
            if(item.specializations.length === specializations.value.length && specializations.value.length > 1){
                selectedSpecialization.value = [];
                selectedSpecialization.value.push(0);
            }else{
                selectedSpecialization.value = item.specializations.map(s => s.id)
            }
            break;
        case 'Question':
            await getSpecialization();
            question.value = item.question;
            answer.value = item.answer
            explanation.value = item.explanation;
            points.value = item.points
            if(item.specializations.length === specializations.value.length && specializations.value.length > 1){
                selectedSpecialization.value = [];
                selectedSpecialization.value.push(0);
            }else{
                selectedSpecialization.value = item.specializations.map(s => s.id)
            }
            break;
        case 'Word':
            isLoadingItem.value = true;
            await getSpecialization();
            name.value = item.word;
            explanation.value = item.explanation ?? '';
            startGenerating.value = true;
            generating.value = true;
            words.value = item.words

            if(item.specializations.length === specializations.value.length && specializations.value.length > 1){
                // Выбраны все специальности
                selectedSpecialization.value = [0]; // 0 означает "все специальности"
            }else{
                selectedSpecialization.value = item.specializations.map(s => s.id)
            }
            await nextTick(() => {
                isLoadingItem.value = false;
            });
            break;
        case 'Found':
            await getSpecialization();
            question.value = item.question
            isProgramLoadingQuestion.value = true;
            isProgramLoadingAnswer.value = true;
            previewQuestion.value = item.urlQuestion;
            previewAnswer.value = item.urlAnswer;
            form.urlQuestion = item.urlQuestion;
            form.urlAnswer = item.urlAnswer;

            if(item.specializations.length === specializations.value.length && specializations.value.length > 1){
                // Выбраны все специальности
                selectedSpecialization.value = [0]; // 0 означает "все специальности"
            }else{
                selectedSpecialization.value = item.specializations.map(s => s.id)
            }
            break;
    }
    openUpdate.value = true
}
const openDelModal = (item, value) => {
    openDelete.value = true
    deleteItem.value = item;
    activeCard.value = value

    switch (value){
        case 'Decide':
            question.value = item.question
            break;
        case 'TF':
            question.value = item.question
            break;
        case 'Action':
            action.value = item.action
            break;
        case 'Question':
            question.value = item.question
            break;
        case 'Found':
            question.value = item.question
            break;
    }
}
const getSpecialization = async () => {
    try {
        const res = await axios.get(`admin/specialization`);
        // Допустим, тут вы хотите что-то сохранить:
        specializations.value = res.data;
    } catch (error) {
        console.error('Ошибка при загрузке специализации:', error);
    }
}
const exit = ()=> {
    router.get('/exit')
}
const allSelected = computed(() => {
    if(specializations.value.length > 1){
        const allIds = specializations.value.map(s => s.id);
        return allIds.every(id => selectedSpecialization.value.includes(id));
    }else {
        return false
    }
});

watch(() => name.value, ()=>{
    if (activeCard.value === 'Word' && !isLoadingItem.value) {
        words.value = [];
        startGenerating.value = false;
        generating.value = false;
    }
})

defineExpose({
    openUserModal,
    openCreateModal,
    openUpdateModal,
    openDelModal,
})
</script>

<style scoped>
    ::v-deep(.prose del),
    ::v-deep(.prose s){
        text-decoration: line-through;
    }

    .scroll-container {
        overflow-y: auto;
        scrollbar-width: thin;         /* Firefox */
        scrollbar-color: #1f2937 #f0f0f0; /* Firefox */
    }

    /* WebKit-стилизация (Chrome, Safari, Edge) */
    .scroll-container::-webkit-scrollbar {
        width: 8px;
    }

    .scroll-container::-webkit-scrollbar-track {
        background: #f0f0f0;
        border-radius: 8px;
    }

    .scroll-container::-webkit-scrollbar-thumb {
        background-color: #1f2937;
        border-radius: 8px;
        border: 2px solid #f0f0f0;
    }

    .scroll-container::-webkit-scrollbar-thumb:hover {
        background-color: #1f2937;
    }

    .scroll-container::-webkit-scrollbar-thumb {
        transition: background-color 0.3s ease;
    }

    .roboto{
        font-family: 'RobotoCondensed', sans-serif;
    }
</style>
