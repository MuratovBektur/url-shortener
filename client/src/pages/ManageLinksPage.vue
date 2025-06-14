<template>
  <q-page class="bg-gray-50">
    <!-- Основной контент -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Управление ссылками</h1>
        <p class="mt-2 text-gray-600">
          Просматривайте и управляйте своими короткими ссылками
        </p>
      </div>

      <!-- Фильтры и сортировка -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div
          class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          <div class="flex flex-col sm:flex-row gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Сортировать по</label
              >
              <select
                v-model="sortBy"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Дата создания</option>
                <option value="clicks">Количество кликов</option>
                <option value="alias">Алиас</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Порядок</label
              >
              <select
                v-model="sortOrder"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">По убыванию</option>
                <option value="asc">По возрастанию</option>
              </select>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="loadUrls"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              {{ loading ? 'Загрузка...' : 'Обновить' }}
            </button>
            <router-link
              to="/"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Создать ссылку
            </router-link>
          </div>
        </div>
      </div>

      <!-- Список ссылок -->
      <div class="bg-white rounded-lg shadow">
        <div v-if="loading" class="text-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="mt-4 text-gray-600">Загрузка ссылок...</p>
        </div>

        <div v-else-if="urls.length === 0" class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
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
          <h3 class="mt-4 text-lg font-medium text-gray-900">
            Нет созданных ссылок
          </h3>
          <p class="mt-2 text-gray-500">Создайте свою первую короткую ссылку</p>
          <router-link
            to="/"
            class="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Создать ссылку
          </router-link>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <url-card
            v-for="url in urls"
            :key="url.id"
            :url="url"
            @delete="deleteUrl"
            @show-stats="showStats"
            class="p-6"
          />
        </div>
      </div>

      <!-- Уведомления -->
      <div
        v-if="notification.show"
        :class="[
          'fixed top-4 right-4 p-4 rounded-md shadow-lg z-50',
          notification.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800',
        ]"
      >
        {{ notification.message }}
      </div>
    </div>

    <!-- Модальное окно статистики -->
    <stats-modal v-model="statsModalOpen" :url="selectedUrl as any" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { api } from 'src/boot/axios';
import UrlCard from 'src/components/UrlCard.vue';
import StatsModal from 'src/components/StatsModal.vue';

interface UrlData {
  id: number;
  originalUrl: string;
  shortCode: string;
  alias?: string;
  shortUrl: string;
  expiresAt?: Date;
  clickCount: number;
  clicks: number;
  createdAt: Date;
}

// Реактивные данные
const urls = ref<UrlData[]>([]);
const loading = ref(false);
const sortBy = ref('createdAt');
const sortOrder = ref<'asc' | 'desc'>('desc');
const statsModalOpen = ref(false);
const selectedUrl = ref<UrlData | null>(null);
const notification = ref({
  show: false,
  message: '',
  type: 'success',
});

// Методы
const loadUrls = async () => {
  loading.value = true;
  try {
    const response = await api.get('/urls', {
      params: {
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
      },
    });
    urls.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки ссылок:', error);
    showNotification('Ошибка загрузки ссылок', 'error');
  } finally {
    loading.value = false;
  }
};

const deleteUrl = async (shortCode: string) => {
  try {
    await api.delete(`/delete/${shortCode}`);
    showNotification('Ссылка успешно удалена', 'success');
    loadUrls(); // Перезагружаем список
  } catch (error) {
    console.error('Ошибка удаления ссылки:', error);
    showNotification('Ошибка удаления ссылки', 'error');
  }
};

const showStats = (url: UrlData) => {
  selectedUrl.value = url;
  statsModalOpen.value = true;
};

const showNotification = (message: string, type = 'success') => {
  notification.value = {
    show: true,
    message,
    type,
  };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

// Watchers
watch([sortBy, sortOrder], () => {
  loadUrls();
});

// Lifecycle
onMounted(() => {
  loadUrls();
});
</script>
