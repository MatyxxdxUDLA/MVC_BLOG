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
  isFavorite?: boolean;
}

const posts = ref<Post[]>([]);
const newPost = ref({
  title: '',
  content: '',
  emotion: 'Neutral', });
const editingPost = ref<string | null>(null);
const message = ref<string>('');
const router = useRouter();
const searchQuery = ref('');
const searchEmotion = ref('');

const token = localStorage.getItem('token') as string;

// URL backend en Render
const API_BASE_URL = 'https://mvc-blog-hz8l.onrender.com';

const fetchPosts = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (data.success) {
      const postsWithFavorites = await Promise.all(
        data.posts.map(async (post: Post) => {
          const favResponse = await fetch(`${API_BASE_URL}/api/favorites/status/${post._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const favData = await favResponse.json();
          return { ...post, isFavorite: favData.isFavorite || false };
        })
      );
      posts.value = postsWithFavorites;
    }
  } catch (error) {
    message.value = 'Error encontrando posts';
    console.error('Fetch error:', error);
  }
};

const searchPosts = async () => {
  try {
    const queryParams = new URLSearchParams();
    if (searchQuery.value) queryParams.append('query', searchQuery.value);
    if (searchEmotion.value) queryParams.append('emotion', searchEmotion.value);

    const response = await fetch(`/api/posts/search?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (data.success) {
      posts.value = data.posts;
    }
    else {
      message.value = data.message;
    }
  } catch (error) {
    message.value = 'Error buscando posts';
  }
};

const createPost = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newPost.value)
    });
    const data = await response.json();
    if (data.success) {

      posts.value.unshift(data.post as Post);
      newPost.value = { title: '', content: '', emotion: 'Neutral' };
      message.value = 'Post created successfully';

      // Borrar el mensaje después de 3 segundos
      setTimeout(() => {
        message.value = '';
      }, 3000);
    }
  } catch (error) {
    message.value = 'Error creando post';
    console.error('Crear error:', error);
  }
};

const updatePost = async (post: Post): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${post._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        emotion: post.emotion?.name || 'Neutral'
      })
    });
    const data = await response.json();
    if (data.success) {
      const index = posts.value.findIndex((p: Post) => p._id === post._id);
      posts.value[index] = data.post as Post;
      editingPost.value = null;
      message.value = 'Post actualizado con éxito';

      // Borrar el mensaje después de 3 segundos
      setTimeout(() => {
        message.value = '';
      }, 3000);
    }
  } catch (error) {
    message.value = 'Error actualizando post';
    console.error('Actualizar error:', error);
  }
};

const deletePost = async (postId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (data.success) {
      posts.value = posts.value.filter((p: Post) => p._id !== postId);
      message.value = 'Post eliminado con éxito';

      // Borrar el mensaje después de 3 segundos
      setTimeout(() => {
        message.value = '';
      }, 3000);
    }
  } catch (error) {
    message.value = 'Error eliminando post';
    console.error('Eliminar error:', error);
  }
};

const toggleFavorite = async (postId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites/toggle/${postId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (data.success) {
      // Actualizar el estado local del post
      const postIndex = posts.value.findIndex((p: Post) => p._id === postId);
      if (postIndex !== -1) {
        posts.value[postIndex].isFavorite = data.isFavorite;
      }
      message.value = data.message;

      // Borrar el mensaje después de 3 segundos
      setTimeout(() => {
        message.value = '';
      }, 3000);
    }
  } catch (error) {
    message.value = 'Error al actualizar favorito';
    console.error('Toggle favorite error:', error);
  }
};

/*
const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  router.push('/');
};
*/

const getEmotionEmoji = (emotion: Emotion | undefined): string => {
  if (!emotion) return '😐';
  if (emotion.name === 'Positivo') return '😊';
  if (emotion.name === 'Negativo') return '😔';
  return '😐';
};

onMounted((): void => {
  if (!token) router.push('/login');
  fetchPosts();
});

</script>

<template>
  <div class="dashboard">
    <section id="search-posts" class="section">
      <h2>Buscar Posts</h2>
      <div class="search-form">
        <input
          v-model="searchQuery"
          placeholder="Buscar palabras clave..."
          class="input-field"
        />
        <select v-model="searchEmotion" class="input-field">
          <option value="">All emotions</option>
          <option value="Positivo">Positive</option>
          <option value="Neutral">Neutral</option>
          <option value="Negativo">Negative</option>
        </select>
        <button @click="searchPosts" class="search-btn">Search</button>
        <button @click="fetchPosts" class="reset-btn">Reset</button>
      </div>
    </section>

    <section id="create-post" class="section">
      <h2>Crear Nuevo Post</h2>
      <form @submit.prevent="createPost" class="post-form">
        <input
          v-model="newPost.title"
          placeholder="Title"
          required
          class="input-field"
        />
        <textarea
          v-model="newPost.content"
          placeholder="Content"
          required
          class="textarea-field"
        ></textarea>
        <select v-model="newPost.emotion" class="input-field">
          <option value="Positivo">Positive 😊</option>
          <option value="Neutral">Neutral 😐</option>
          <option value="Negativo">Negative 😔</option>
        </select>
        <button type="submit" class="submit-btn">Crear Post</button>
      </form>
    </section>

    <div v-if="message" class="message" :class="{ error: message.includes('Error') }">
      {{ message }}
    </div>

    <section id="my-posts" class="section">
      <h2>Mis Post</h2>
      <div class="posts-grid">
        <div v-for="post in posts" :key="post._id" class="post-card">
          <template v-if="editingPost === post._id">
            <input v-model="post.title" class="input-field" />
            <textarea v-model="post.content" class="textarea-field"></textarea>
            <select v-model="post.emotion.name" class="input-field">
              <option value="Positivo">Positive 😊</option>
              <option value="Neutral">Neutral 😐</option>
              <option value="Negativo">Negative 😔</option>
            </select>
            <div class="post-actions">
              <button @click="updatePost(post)" class="action-btn save">Guardar</button>
              <button @click="editingPost = null" class="action-btn cancel">Cancelar</button>
            </div>
          </template>
          <template v-else>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-content">{{ post.content }}</p>
            <div class="emotion-info">
              <p class="emotion-score">
                Estado emocional: {{ getEmotionEmoji(post.emotion) }} 
                {{ post.emotion?.name || 'Neutral' }}
              </p>
            </div>
            <div class="post-actions">
              <button 
                @click="toggleFavorite(post._id)" 
                class="action-btn favorite"
                :class="{ active: post.isFavorite }"
              >
                {{ post.isFavorite ? '★' : '☆' }} Favorito
              </button>
              <button @click="editingPost = post._id" class="action-btn edit">Editar</button>
              <button @click="deletePost(post._id)" class="action-btn delete">Eliminar</button>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  width: 100%;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-btn {
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.reset-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-field, .textarea-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.textarea-field {
  min-height: 150px;
  resize: vertical;
}

.submit-btn {
  background-color: #42b883;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.submit-btn:hover {
  background-color: #3aa876;
}

.posts-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.post-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
}

.post-title {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.post-content {
  color: #666;
  margin-bottom: 1rem;
}

.emotion-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.emotion-score {
  font-size: 1.2rem;
  margin: 0;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.action-btn.edit {
  background-color: #4a90e2;
  color: white;
}

.action-btn.delete {
  background-color: #dc3545;
  color: white;
}

.action-btn.save {
  background-color: #28a745;
  color: white;
}

.action-btn.cancel {
  background-color: #6c757d;
  color: white;
}

.action-btn.favorite {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.action-btn.favorite.active {
  background-color: #ffc107;
  color: #212529;
  border-color: #ffc107;
}

.action-btn.favorite:hover {
  background-color: #e9ecef;
}

.action-btn.favorite.active:hover {
  background-color: #ffcd39;
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