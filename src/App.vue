<script setup lang="ts">
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
import Navigation from './components/Navigation.vue';
import Footer from './components/Footer.vue';
</script>

<template>
  <div class="app-wrapper">
    <Header />
    <Navigation />
    <main class="main-content">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<style>
  .app-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
  }

  body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    display: block;
    background-color: #f5f5f5;
  }
</style>