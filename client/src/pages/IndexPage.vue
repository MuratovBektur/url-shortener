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
            <div class="flex-1">
              <input
                v-model="longUrl"
                @input="validateUrl"
                @blur="validateUrl"
                type="url"
                placeholder="Вставьте вашу длинную ссылку здесь..."
                :class="[
                  'w-full px-6 py-4 border-2 rounded-xl focus:outline-none text-lg transition-colors',
                  urlError
                    ? 'border-red-500 focus:border-red-600'
                    : longUrlTrimmed && isValidUrl
                      ? 'border-green-500 focus:border-green-600'
                      : 'border-gray-200 focus:border-blue-500',
                ]"
              />
              <div
                v-if="urlError"
                class="mt-2 text-red-600 text-sm font-medium"
              >
                <svg
                  class="w-4 h-4 inline mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ urlError }}
              </div>
              <div
                v-else-if="longUrlTrimmed && isValidUrl"
                class="mt-2 text-green-600 text-sm font-medium"
              >
                <svg
                  class="w-4 h-4 inline mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                URL корректен
              </div>
            </div>
            <button
              @click="shortenUrl"
              :disabled="!canShortenUrl"
              :class="[
                'px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300',
                canShortenUrl
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed',
              ]"
            >
              <span v-if="!isProcessing">Сократить</span>
              <span v-else class="flex items-center gap-2">
                <svg
                  class="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Обработка...
              </span>
            </button>
          </div>
        </div>

        <div v-if="shortUrl" class="bg-white rounded-2xl shadow-xl p-8 mb-8">
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
              :class="[
                'px-6 py-2 rounded-lg transition-colors font-medium',
                copySuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700',
              ]"
            >
              {{ copySuccess ? 'Скопировано!' : 'Копировать' }}
            </button>
          </div>
          <div class="mt-4 text-sm text-gray-600">
            <p><strong>Исходная ссылка:</strong> {{ longUrl }}</p>
            <p>
              <strong>Создано:</strong> {{ new Date().toLocaleString('ru-RU') }}
            </p>
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
import { ref, computed } from 'vue';

const longUrl = ref('');
const shortUrl = ref('');
const urlError = ref('');
const isValidUrl = ref(false);
const isProcessing = ref(false);
const copySuccess = ref(false);

// Функция валидации URL
const validateUrl = () => {
  const url = longUrlTrimmed.value;

  if (!url) {
    urlError.value = '';
    isValidUrl.value = false;
    return;
  }

  try {
    const urlObj = new URL(url);

    // Проверка протокола
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      urlError.value = 'URL должен начинаться с http:// или https://';
      isValidUrl.value = false;
      return;
    }

    // Проверка домена
    if (!urlObj.hostname || urlObj.hostname.length < 1) {
      urlError.value = 'Некорректное доменное имя';
      isValidUrl.value = false;
      return;
    }

    // Проверка на запрещенные символы
    const forbiddenChars = /[\s<>"{}|\\^`]/;
    if (forbiddenChars.test(url)) {
      urlError.value = 'URL содержит недопустимые символы';
      isValidUrl.value = false;
      return;
    }

    // Если все проверки пройдены
    urlError.value = '';
    isValidUrl.value = true;
  } catch {
    urlError.value = 'Некорректный формат URL';
    isValidUrl.value = false;
  }
};

const longUrlTrimmed = computed(() => {
  return longUrl.value.trim();
});

// Computed свойство для определения возможности сокращения
const canShortenUrl = computed(() => {
  return longUrlTrimmed.value && isValidUrl.value && !isProcessing.value;
});

const shortenUrl = async () => {
  if (!canShortenUrl.value) return;

  isProcessing.value = true;

  try {
    // Имитация задержки API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Генерация короткой ссылки
    const randomId = Math.random().toString(36).substring(2, 8);
    shortUrl.value = `https://short.ly/${randomId}`;
  } catch (error) {
    console.error('Ошибка при сокращении URL:', error);
    urlError.value = 'Произошла ошибка при сокращении ссылки';
  } finally {
    isProcessing.value = false;
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shortUrl.value);
    copySuccess.value = true;

    // Сброс состояния через 2 секунды
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('Ошибка при копировании:', err);
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea');
    textArea.value = shortUrl.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  }
};
</script>

<style scoped>
/* Дополнительные стили для анимаций */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
