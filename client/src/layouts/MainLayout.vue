<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <router-link to="/" class="text-white no-underline">
            URL Shortener
          </router-link>
        </q-toolbar-title>

        <q-space />
        <div class="flex items-center justify-center space-x-4">
          <q-btn
            flat
            :to="{ path: '/' }"
            class="bg-white text-blue-400"
            label="Главная"
          />
          <q-btn
            flat
            :to="{ path: '/manage' }"
            class="bg-white text-blue-400"
            label="Управление ссылками"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'MainLayout',
});
</script>
