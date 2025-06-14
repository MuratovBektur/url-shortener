<template>
  <div
    class="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow"
  >
    <div class="flex justify-between items-start">
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ url.alias || url.shortCode }}
        </h3>
        <div class="mb-2">
          <a
            :href="url.shortUrl"
            target="_blank"
            class="text-blue-600 hover:text-blue-800 font-medium break-all"
          >
            {{ url.shortUrl }}
          </a>
        </div>
        <p class="text-gray-600 text-sm break-all mb-3">
          {{ url.originalUrl }}
        </p>
        <div class="flex items-center text-sm text-gray-500 space-x-4">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ url.clicks }} кликов
          </span>
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clip-rule="evenodd"
              />
            </svg>
            {{ formatDate(url.createdAt) }}
          </span>
        </div>
      </div>
      <div class="flex space-x-2 ml-4">
        <button
          @click="$emit('show-stats', url)"
          class="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          Статистика
        </button>
        <button
          @click="confirmDelete"
          class="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  url: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['delete', 'show-stats']);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const confirmDelete = () => {
  if (
    confirm(
      `Вы уверены, что хотите удалить ссылку "${props.url.alias || props.url.shortCode}"?`,
    )
  ) {
    emit('delete', props.url.shortCode);
  }
};
</script>
