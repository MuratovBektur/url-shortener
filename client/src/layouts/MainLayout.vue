<template>
  <div>
    <div class="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { api } from 'src/boot/axios';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'MainLayout',
});

const router = useRouter();

async function check_token() {
  const token = localStorage.getItem('access_token');
  if (!token) {
    router.push('auth');
  }

  const user = await api.get('user');
  console.log('user', user);
}

check_token();
</script>
