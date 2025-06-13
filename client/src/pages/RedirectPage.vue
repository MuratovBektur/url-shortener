<template>
  <div>
    <ErrorNotFound v-if="!isUrlCorrect" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from 'src/boot/axios';
import ErrorNotFound from './ErrorNotFound.vue';

defineOptions({
  name: 'RedirectPage',
});

const route = useRoute();

const isUrlCorrect = ref(true);
const shortCode = route.params.shortCode as string;

const fetchOriginalUrl = async () => {
  try {
    const response = await api.get(`${shortCode}`);
    const originalUrl = response.data.originalUrl;

    if (originalUrl) {
      window.location.href = originalUrl;
    } else {
      isUrlCorrect.value = false;
    }
  } catch (err: unknown) {
    console.error('Ошибка при получении URL:', err);
    // При любой ошибке перенаправляем на 404
    isUrlCorrect.value = false;
  }
};

onMounted(() => {
  console.log('RedirectPage mounted, shortCode:', shortCode);
  if (!shortCode || shortCode.length < 3) {
    console.log('Invalid shortCode, redirecting to 404');
    isUrlCorrect.value = false;
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
