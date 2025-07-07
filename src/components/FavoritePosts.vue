<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Emotion {
  _id: string;
  name: string;
  score: number;
  post: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  emotion: Emotion;
  createdAt: string;
}

const favoritePosts = ref<Post[]>([]);
const favoriteCount = ref(0);
const loading = ref(false);
const message = ref<string>('');
const router = useRouter();

const token = localStorage.getItem('token') as string;
const API_BASE_URL = 'https://mvc-blog-hz8l.onrender.com';

const fetchFavorites = async (): Promise<void> => {
  loading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites/list`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (data.success) {
      favoritePosts.value = data.favorites;
      favoriteCount.value = data.count;
    } else {
      message.value = data.message;
    }
  } catch (error) {
    message.value = 'Error cargando posts favoritos';
    console.error('Fetch favorites error:', error);
  } finally {
    loading.value = false;
  }
};

const removeFavorite = async (postId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites/toggle/${postId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (data.success) {
      // Remover el post de la lista local
      favoritePosts.value = favoritePosts.value.filter(post => post._id !== postId);
      favoriteCount.value = favoritePosts.value.length;
      message.value = data.message;

      setTimeout(() => {
        message.value = '';
      }, 3000);
    }
  } catch (error) {
    message.value = 'Error al remover favorito';
    console.error('Remove favorite error:', error);
  }
};

const getEmotionEmoji = (emotion: Emotion | undefined): string => {
  if (!emotion) return '😐';
  if (emotion.name === 'Positivo') return '😊';
  if (emotion.name === 'Negativo') return '😔';
  return '😐';
};

const goBack = (): void => {
  router.back();
};

onMounted((): void => {
  if (!token) router.push('/login');
  fetchFavorites();
});
</script>

<template>
  <div class="favorites-container">
    <div class="header">
      <button @click="goBack" class="back-btn">← Volver</button>
      <h1>Mis Posts Favoritos</h1>
      <div class="count-badge">{{ favoriteCount }} favoritos</div>
    </div>

    <div v-if="message" class="message" :class="{ error: message.includes('Error') }">
      {{ message }}
    </div>

    <div v-if="loading" class="loading">
      Cargando favoritos...
    </div>

    <div v-else-if="favoritePosts.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">☆</div>
      <h3>No tienes posts favoritos aún</h3>
      <p>Marca tus posts favoritos desde el dashboard principal</p>
      <button @click="goBack" class="primary-btn">Ir al Dashboard</button>
    </div>

    <div v-else class="favorites-grid">
      <div v-for="post in favoritePosts" :key="post._id" class="favorite-card">
        <div class="favorite-header">
          <span class="favorite-icon">★</span>
          <span class="post-date">{{ new Date(post.createdAt).toLocaleDateString() }}</span>
        </div>
        
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-content">{{ post.content }}</p>
        
        <div class="emotion-info">
          <span class="emotion-emoji">{{ getEmotionEmoji(post.emotion) }}</span>
          <span class="emotion-name">{{ post.emotion?.name || 'Neutral' }}</span>
        </div>
        
        <div class="card-actions">
          <button 
            @click="removeFavorite(post._id)" 
            class="remove-btn"
          >
            Remover de favoritos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.back-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #6c757d;
}

.back-btn:hover {
  background: #e9ecef;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
  flex: 1;
}

.count-badge {
  background: #42b883;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 1rem 0;
  color: #495057;
}

.primary-btn {
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.primary-btn:hover {
  background: #3aa876;
}

.favorites-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.favorite-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.favorite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.favorite-icon {
  color: #ffc107;
  font-size: 1.2rem;
}

.post-date {
  color: #6c757d;
  font-size: 0.9rem;
}

.post-title {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.post-content {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
  max-height: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.emotion-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.emotion-emoji {
  font-size: 1.2rem;
}

.emotion-name {
  color: #495057;
  font-weight: 500;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.remove-btn:hover {
  background: #c82333;
}

.message {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
  text-align: center;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
}

.message:not(.error) {
  background-color: #d4edda;
  color: #155724;
}
</style> 