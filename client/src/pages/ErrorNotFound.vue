<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4"
  >
    <div class="container mx-auto max-w-4xl">
      <div class="text-center">
        <!-- Анимированная 404 цифра -->
        <div class="mb-8">
          <h1
            class="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 animate-bounce"
          >
            404
          </h1>
          <div class="flex justify-center mt-4">
            <div
              class="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
            ></div>
          </div>
        </div>

        <!-- Основное сообщение -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div class="mb-6">
            <!-- Иконка грустного лица -->
            <div class="flex justify-center mb-4">
              <div
                class="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>

            <h2 class="text-3xl font-bold text-gray-800 mb-4">
              Страница не найдена
            </h2>
            <p class="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              К сожалению, страница, которую вы ищете, не существует или была
              перемещена. Возможно, ссылка устарела или содержит ошибку.
            </p>
          </div>

          <!-- Варианты действий -->
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <!-- Кнопка домой -->
              <router-link
                to="/"
                class="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
                На главную
              </router-link>
            </div>
          </div>
        </div>

        <!-- Дополнительная информация -->
        <div class="bg-white rounded-2xl shadow-xl p-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">
            Что можно сделать?
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div class="p-4 bg-blue-50 rounded-xl">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-800">Проверьте URL</h4>
              </div>
              <p class="text-sm text-gray-600">
                Убедитесь, что адрес введен правильно
              </p>
            </div>

            <div class="p-4 bg-green-50 rounded-xl">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-green-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    ></path>
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-800">Вернитесь домой</h4>
              </div>
              <p class="text-sm text-gray-600">
                Начните сначала с главной страницы
              </p>
            </div>

            <div class="p-4 bg-purple-50 rounded-xl">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-purple-100 rounded-lg">
                  <svg
                    class="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    ></path>
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-800">Сократите URL</h4>
              </div>
              <p class="text-sm text-gray-600">
                Создайте новую короткую ссылку
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ErrorNotFound',
});
</script>

<style scoped>
/* Дополнительные анимации */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
