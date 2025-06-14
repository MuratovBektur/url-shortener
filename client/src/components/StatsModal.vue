<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Статистика ссылки</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Загрузка статистики...</p>
      </div>

      <div v-else-if="stats" class="space-y-6">
        <!-- Основные метрики -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-blue-600">
              {{ stats.totalClicks }}
            </div>
            <div class="text-sm text-gray-600">Всего кликов</div>
          </div>
          <div class="bg-green-50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-green-600">
              {{ stats.todayClicks }}
            </div>
            <div class="text-sm text-gray-600">За сегодня</div>
          </div>
          <div class="bg-purple-50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-purple-600">
              {{ stats.weekClicks }}
            </div>
            <div class="text-sm text-gray-600">За неделю</div>
          </div>
        </div>

        <!-- График кликов по дням -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Клики за последние 30 дней
          </h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="h-64 flex items-end justify-between space-x-1">
              <div
                v-for="(day, index) in stats.dailyClicks"
                :key="index"
                class="flex-1 flex flex-col items-center justify-end relative"
              >
                <!-- Число над столбцом -->
                <div
                  v-if="day.clicks > 0"
                  class="absolute -top-6 text-xs text-gray-600 font-medium"
                >
                  {{ day.clicks }}
                </div>
                <!-- Столбец -->
                <div
                  :style="{
                    height: getBarHeight(day.clicks) + '%',
                    backgroundColor: day.clicks > 0 ? '#3B82F6' : '#E5E7EB',
                  }"
                  class="w-full rounded-t-sm min-h-[4px] transition-all hover:opacity-80"
                  :title="`${formatDateForChart(day.date)}: ${day.clicks} кликов`"
                ></div>
              </div>
            </div>
            <!-- Ось X с датами -->
            <div class="flex justify-between mt-2 text-xs text-gray-500">
              <template
                v-for="(day, index) in stats.dailyClicks"
                :key="'date-' + index"
              >
                <span
                  v-if="
                    index % 5 === 0 || index === stats.dailyClicks.length - 1
                  "
                >
                  {{ formatDateForChart(day.date) }}
                </span>
                <span v-else class="invisible">.</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Последние IP адреса -->
        <div
          v-if="stats.recentIpAddresses && stats.recentIpAddresses.length > 0"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Последние IP адреса
          </h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="space-y-2">
              <div
                v-for="(ip, index) in stats.recentIpAddresses"
                :key="index"
                class="flex items-center justify-between py-2 px-3 bg-white rounded border"
              >
                <span class="font-mono text-sm">{{ ip }}</span>
                <span class="text-xs text-gray-500">#{{ index + 1 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-600">Не удалось загрузить статистику</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { api } from 'src/boot/axios';

interface StatsData {
  totalClicks: number;
  todayClicks: number;
  weekClicks: number;
  dailyClicks: Array<{ date: string; clicks: number }>;
  recentIpAddresses: string[];
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  url: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const loading = ref(false);
const stats = ref<StatsData | null>(null);

const closeModal = () => {
  isOpen.value = false;
};

const getBarHeight = (clicks: number) => {
  if (!stats.value?.dailyClicks) return 0;
  const maxClicks = Math.max(...stats.value.dailyClicks.map((d) => d.clicks));
  if (maxClicks === 0) return 5; // Минимальная высота для пустых дней
  return Math.max((clicks / maxClicks) * 100, clicks > 0 ? 10 : 5);
};

const formatDateForChart = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate()}.${date.getMonth() + 1}`;
};

const loadStats = async () => {
  if (!props.url?.shortCode) return;

  loading.value = true;
  try {
    const response = await api.get(`/analytics/${props.url.shortCode}`);
    stats.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
    stats.value = null;
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && props.url) {
      loadStats();
    }
  },
);

watch(
  () => props.url,
  (newUrl) => {
    if (newUrl && props.modelValue) {
      loadStats();
    }
  },
);
</script>
