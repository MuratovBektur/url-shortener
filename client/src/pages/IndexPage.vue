<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-16">
        <h1 class="text-6xl font-bold text-gray-800 mb-4">URL Shortener</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Быстро и легко сокращайте длинные ссылки для более удобного
          использования
        </p>
      </div>

      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div class="flex flex-col md:flex-row gap-4">
            <input
              v-model="longUrl"
              type="url"
              placeholder="Вставьте вашу длинную ссылку здесь..."
              class="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
            />
            <button
              @click="shortenUrl"
              :disabled="!longUrl.trim()"
              class="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
            >
              Сократить
            </button>
          </div>
        </div>

        <div v-if="shortUrl" class="bg-white rounded-2xl shadow-xl p-8">
          <h3 class="text-2xl font-bold text-gray-800 mb-4">
            Ваша сокращенная ссылка:
          </h3>
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <input
              :value="shortUrl"
              readonly
              class="flex-1 px-4 py-2 bg-transparent border-none outline-none text-lg text-blue-600 font-medium"
            />
            <button
              @click="copyToClipboard"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Копировать
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div class="text-center">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Быстро</h3>
            <p class="text-gray-600">Сокращайте ссылки за секунды</p>
          </div>

          <div class="text-center">
            <div
              class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Надежно</h3>
            <p class="text-gray-600">Ваши ссылки всегда работают</p>
          </div>

          <div class="text-center">
            <div
              class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Просто</h3>
            <p class="text-gray-600">Без регистрации и лишних действий</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const longUrl = ref('');
const shortUrl = ref('');

const shortenUrl = () => {
  if (!longUrl.value.trim()) return;

  // Пока просто генерируем случайную короткую ссылку
  const randomId = Math.random().toString(36).substring(2, 8);
  shortUrl.value = `https://short.ly/${randomId}`;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shortUrl.value);
    // Здесь можно добавить уведомление об успешном копировании
  } catch (err) {
    console.error('Ошибка при копировании:', err);
  }
};
</script>

<style scoped>
/* Дополнительные стили если нужны */
</style>
