<script setup>
import {Head, Link, router} from "@inertiajs/vue3";
import {onMounted, ref, watch} from "vue";

const visible = ref(false);
const props = defineProps({
    errors: Object,
})

const inputValues = ref(['', '', '', '', '']);
const inputs = ref([]); // для DOM-элементов

const inputCode = (index) => {
  let value = inputValues.value[index];

  value = value.replace(/\D/g, '');

  inputValues.value[index] = value;
  // Если есть значение и не последний — фокус на следующий
  if (value && value.length === 1 && index < inputs.value.length - 1) {
    inputs.value[index + 1].focus();
  }

  if(inputValues.value.every(input => input.trim() !== '')){
    checkCode()
  }
};

const handleBackspace = (index) => {
  const value = inputValues.value[index];

  // Если текущий пуст и не первый — перейти назад
  if (!value && index > 0) {
    inputValues.value[index - 1] = '';
    inputs.value[index - 1].focus();
  }
};

const checkCode = () => {
  let code = ''
  inputValues.value.forEach((val)=>{
    code += val
  })

  //post запрос на сервер, где я кодик проверю?
    router.post('/auth/check', {code:code})
}

onMounted(()=>{
  setTimeout(()=> visible.value = true, 200)
})

</script>


<template>
  <Head title="Авторизация"/>
  <div class="relative w-screen h-screen flex flex-col bg-gray-200 items-center justify-center">
    <img class="w-24 absolute left-4 top-4 z-10"
         :src="'/images/Logo_project_black_simple.svg'"
         alt="project_logo">

    <div class="bg-white rounded-2xl shadow-xl shadow-gray-900/30 p-32 w-2/4 flex flex-col items-center">
      <h1 class="text-4xl font-medium w-full text-center text-balance" style="font-family: Montserrat, sans-serif">
        Чтобы работать c Админ-панелью, нужно ввести <span class="font-bold text-fuchsia-700" style="font-family: Montserrat, sans-serif">код безопасности</span>
      </h1>
      <div class="flex gap-3 mt-12 items-center">
        <input
            v-for="(val, index) in inputValues"
            :key="index"
            :autofocus="index === 0"
            v-model="inputValues[index]"
            :ref="el => inputs[index] = el"
            @input="() => inputCode(index)"
            @keydown.backspace="() => handleBackspace(index)"
            type="password"
            autocomplete="new-password"
            maxlength="1"
            class="border-4 border-black rounded-xl w-24 h-24 text-6xl text-center"
        />
      </div>
        <p v-if="errors.code" class="mt-4 text-red-700 font-medium text-2xl"> {{ errors?.code[0] }}! </p>
    </div>
  </div>
</template>

<style scoped>

</style>
