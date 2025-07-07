<template>
    <nav class="navigation" v-if="$route.path === '/dashboard' || $route.path === '/stats' || $route.path === '/wellness'">
      <div class="nav-content">
        <ul>
          <li>
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          </li>
          <li>
            <router-link to="/stats" class="nav-link">Estadísticas</router-link>
          </li>
          <li>
            <router-link to="/wellness" class="nav-link">🧘 Bienestar</router-link>
          </li>
        </ul>
      </div>
    </nav>
  </template>
  
  <style scoped>
  .navigation {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    padding: 1rem 0;
  }
  
  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 2rem;
  }
  
  .nav-link {
    color: #333;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  
  .nav-link:hover {
    background-color: #e9ecef;
  }

  .router-link-active {
  background-color: #e9ecef;
}
  </style>