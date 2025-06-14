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
          <div class="space-y-4">
            <!-- Основной URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                URL для сокращения *
              </label>
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
                    : longUrl.trim() && isValidUrl
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
                v-else-if="longUrl.trim() && isValidUrl"
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

            <!-- Дополнительные поля -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Алиас -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Пользовательский алиас (необязательно)
                </label>
                <input
                  v-model="alias"
                  @input="validateAlias"
                  type="text"
                  placeholder="мой-алиас"
                  maxlength="20"
                  :class="[
                    'w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors',
                    aliasError
                      ? 'border-red-500 focus:border-red-600'
                      : alias.trim() && isValidAlias
                        ? 'border-green-500 focus:border-green-600'
                        : 'border-gray-200 focus:border-blue-500',
                  ]"
                />
                <div v-if="aliasError" class="mt-1 text-red-600 text-xs">
                  {{ aliasError }}
                </div>
                <div v-else class="mt-1 text-gray-500 text-xs">
                  3-20 символов, только буквы, цифры, дефис и подчеркивание
                </div>
              </div>

              <!-- Дата окончания -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Дата окончания (необязательно)
                </label>
                <input
                  v-model="expiresAt"
                  type="datetime-local"
                  :min="minDate"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <div class="mt-1 text-gray-500 text-xs">
                  После этой даты ссылка перестанет работать
                </div>
              </div>
            </div>

            <!-- Кнопка сокращения -->
            <div class="flex justify-center pt-4">
              <button
                @click="shortenUrl"
                :disabled="!canShortenUrl"
                :class="[
                  'px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300',
                  canShortenUrl
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed',
                ]"
              >
                <span v-if="!isProcessing">Сократить URL</span>
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
                  Создание...
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Результат сокращения -->
        <div
          v-if="shortUrlResult"
          class="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h3 class="text-2xl font-bold text-gray-800 mb-4">
            ✅ Ваша сокращенная ссылка готова!
          </h3>
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
            <input
              :value="shortUrlResult.shortUrl"
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
            <button
              @click="goToPage"
              class="px-6 py-2 rounded-lg transition-colors font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Перейти по ссылке
            </button>
          </div>
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600"
          >
            <div>
              <p><strong>Исходная ссылка:</strong></p>
              <p class="text-gray-800 break-words">
                {{ shortUrlResult.originalUrl }}
              </p>
            </div>
            <div>
              <p>
                <strong>Создано:</strong>
                {{ formatDate(shortUrlResult.createdAt) }}
              </p>
              <p v-if="shortUrlResult.alias">
                <strong>Алиас:</strong> {{ shortUrlResult.alias }}
              </p>
              <p v-if="shortUrlResult.expiresAt">
                <strong>Действует до:</strong>
                {{ formatDate(shortUrlResult.expiresAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Информационные карточки -->
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
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Гибко</h3>
            <p class="text-gray-600">Пользовательские алиасы и срок действия</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';

// Реактивные переменные
const longUrl = ref('');
const alias = ref('');
const expiresAt = ref('');
interface ShortenResult {
  shortUrl: string;
  originalUrl: string;
  expiresAt?: string;
  alias?: string;
  createdAt: string;
}

const shortUrlResult = ref<ShortenResult | null>(null);
const urlError = ref('');
const aliasError = ref('');
const isValidUrl = ref(false);
const isValidAlias = ref(true);
const isProcessing = ref(false);
const copySuccess = ref(false);

// Минимальная дата (текущее время + 1 час)
const minDate = computed(() => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toISOString().slice(0, 16);
});

// Функция валидации URL
const validateUrl = () => {
  const url = longUrl.value.trim();

  if (!url) {
    urlError.value = '';
    isValidUrl.value = false;
    return;
  }

  // Проверка минимальной длины
  if (url.length < 4) {
    urlError.value = 'URL слишком короткий';
    isValidUrl.value = false;
    return;
  }

  // Проверка максимальной длины
  if (url.length > 2048) {
    urlError.value = 'URL слишком длинный (максимум 2048 символов)';
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

// Функция валидации алиаса
const validateAlias = () => {
  const aliasValue = alias.value.trim();

  if (!aliasValue) {
    aliasError.value = '';
    isValidAlias.value = true;
    return;
  }

  if (aliasValue.length < 3) {
    aliasError.value = 'Алиас слишком короткий (минимум 3 символа)';
    isValidAlias.value = false;
    return;
  }

  if (aliasValue.length > 20) {
    aliasError.value = 'Алиас слишком длинный (максимум 20 символов)';
    isValidAlias.value = false;
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(aliasValue)) {
    aliasError.value =
      'Алиас может содержать только буквы, цифры, дефис и подчеркивание';
    isValidAlias.value = false;
    return;
  }

  aliasError.value = '';
  isValidAlias.value = true;
};

// Computed свойство для определения возможности сокращения
const canShortenUrl = computed(() => {
  return (
    longUrl.value.trim() &&
    isValidUrl.value &&
    isValidAlias.value &&
    !isProcessing.value
  );
});

// Функция сокращения URL с реальным API
const shortenUrl = async () => {
  if (!canShortenUrl.value) return;

  isProcessing.value = true;

  try {
    const payload: {
      originalUrl: string;
      alias?: string;
      expiresAt?: string;
    } = {
      originalUrl: longUrl.value.trim(),
    };

    if (alias.value.trim()) {
      payload.alias = alias.value.trim();
    }

    if (expiresAt.value) {
      payload.expiresAt = new Date(expiresAt.value).toISOString();
    }

    const response = await api.post('/shorten', payload);
    shortUrlResult.value = response.data;

    // Очистка формы после успешного создания
    longUrl.value = '';
    alias.value = '';
    expiresAt.value = '';
    urlError.value = '';
    aliasError.value = '';
    isValidUrl.value = false;
  } catch (error: unknown) {
    console.error('Ошибка при сокращении URL:', error);

    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as {
        response?: { data?: { message?: string | string[] } };
      };
      if (apiError.response?.data?.message) {
        if (Array.isArray(apiError.response.data.message)) {
          urlError.value = apiError.response.data.message.join(', ');
        } else {
          urlError.value = apiError.response.data.message;
        }
      } else {
        urlError.value = 'Произошла ошибка при сокращении ссылки';
      }
    } else {
      urlError.value = 'Произошла ошибка при сокращении ссылки';
    }
  } finally {
    isProcessing.value = false;
  }
};

// Функция копирования в буфер обмена
const copyToClipboard = async () => {
  if (!shortUrlResult.value) return;

  try {
    await navigator.clipboard.writeText(shortUrlResult.value.shortUrl);
    copySuccess.value = true;

    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('Ошибка при копировании:', err);
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea');
    textArea.value = shortUrlResult.value.shortUrl;
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
const goToPage = () => {
  if (!shortUrlResult.value) return;

  window.open(shortUrlResult.value.shortUrl, '_blank');
};

// Функция форматирования даты
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
