<template>
    <nav class="navigation" v-if="$route.path === '/dashboard'">
      <div class="nav-content">
        <ul>
          <li>
            <a href="#create-post" class="nav-link">Create Post</a>
          </li>
          <li>
            <a href="#my-posts" class="nav-link">My Posts</a>
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
  </style>