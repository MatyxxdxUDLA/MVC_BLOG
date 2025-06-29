<template>
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; {{ new Date().getFullYear() }} Mi Blog Personal. All rights reserved.</p>
      </div>
    </footer>
</template>
  
<style scoped>
    .footer {
    background-color: #333;
    color: white;
    padding: 2rem 0;
    margin-top: auto;
    }
    
    .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;
    }
</style>