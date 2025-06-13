<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4"
  >
    <div class="container mx-auto max-w-2xl">
      <div class="text-center">
        <!-- Состояние загрузки -->
        <div v-if="isLoading" class="bg-white rounded-2xl shadow-xl p-8">
          <div class="flex justify-center mb-6">
            <div
              class="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-8 h-8 text-blue-600 animate-spin"
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
            </div>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">
            Перенаправление...
          </h2>
          <p class="text-gray-600">
            Проверяем ссылку и перенаправляем вас на целевую страницу
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'src/boot/axios';

defineOptions({
  name: 'RedirectPage',
});

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const shortCode = route.params.shortCode as string;

const fetchOriginalUrl = async () => {
  try {
    const response = await api.get(`${shortCode}`);
    const originalUrl = response.data.originalUrl;

    if (originalUrl) {
      console.log('Redirecting to:', originalUrl);
      // Прямое перенаправление без задержки
      window.location.href = originalUrl;
    } else {
      // Если URL не найден, перенаправляем на 404
      console.log('URL not found, redirecting to 404');
      router.push('/404');
    }
  } catch (err: unknown) {
    console.error('Ошибка при получении URL:', err);
    // При любой ошибке перенаправляем на 404
    router.push('/404');
  }
};

onMounted(() => {
  console.log('RedirectPage mounted, shortCode:', shortCode);
  if (!shortCode || shortCode.length < 3) {
    console.log('Invalid shortCode, redirecting to 404');
    router.push('/404');
    return;
  }

  fetchOriginalUrl();
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
