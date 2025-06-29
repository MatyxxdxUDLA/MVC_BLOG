<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  router.push('/');
};
</script>

<template>
  <header class="header">
    <div class="header-content">
      <h1>Mi Blog Personal</h1>
      <button v-if="$route.path === '/dashboard'" @click="logout" class="logout-btn">
        Logout
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: #42b883;
  padding: 1rem 0;
  color: white;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  margin: 0;
  font-size: 1.8rem;
}

.logout-btn {
  background-color: #fff;
  color: #42b883;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.logout-btn:hover {
  background-color: #f0f0f0;
}
</style>