<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Post {
  _id: string;
  title: string;
  content: string;
  sentiment?: Sentiment;
  createdAt?: string;
  updatedAt?: string;
}

interface Sentiment {
  score: number;
  comparative: number;
  tokens: string[];
  words: string[];
  positive: string[];
  negative: string[];
}

const posts = ref<Post[]>([]);
const newPost = ref<Omit<Post, '_id'>>({ title: '', content: '' });
const editingPost = ref<string | null>(null);
const message = ref<string>('');
const router = useRouter();
const token = localStorage.getItem('token') as string;
const searchQuery = ref('');
const searchEmotion = ref('');

// URL de tu backend en Render
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
      posts.value = data.posts as Post[];
    }
  } catch (error) {
    message.value = 'Error fetching posts';
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
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (data.success) {
      posts.value = data.posts;
    }
  } catch (error) {
    message.value = 'Error searching posts';
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
      newPost.value = { title: '', content: '' };
      message.value = 'Post created successfully';
    }
  } catch (error) {
    message.value = 'Error creating post';
    console.error('Create error:', error);
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
      body: JSON.stringify(post)
    });
    const data = await response.json();
    if (data.success) {
      const index = posts.value.findIndex((p: Post) => p._id === post._id);
      posts.value[index] = data.post as Post;
      editingPost.value = null;
      message.value = 'Post updated successfully';
    }
  } catch (error) {
    message.value = 'Error updating post';
    console.error('Update error:', error);
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
      message.value = 'Post deleted successfully';
    }
  } catch (error) {
    message.value = 'Error deleting post';
    console.error('Delete error:', error);
  }
};

/*
const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  router.push('/');
};
*/

const getSentimentEmoji = (score: number): string => {
  if (score > 1) return '😊';
  if (score < -1) return '😔';
  return '😐';
};

const getSentimentText = (score: number): string => {
  if (score > 1) return 'Positivo';
  if (score < -1) return 'Negativo';
  return 'Neutral';
};

onMounted((): void => {
  if (!token) router.push('/login');
  fetchPosts();
});
</script>

<template>
  <div class="dashboard">
    <section id="search-posts" class="section">
      <h2>Search Posts</h2>
      <div class="search-form">
        <input
          v-model="searchQuery"
          placeholder="Search by keywords..."
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
      <h2>Create New Post</h2>
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
        <button type="submit" class="submit-btn">Create Post</button>
      </form>
    </section>

    <div v-if="message" class="message" :class="{ error: message.includes('Error') }">
      {{ message }}
    </div>

    <section id="my-posts" class="section">
      <h2>My Posts</h2>
      <div class="posts-grid">
        <div v-for="post in posts" :key="post._id" class="post-card">
          <template v-if="editingPost === post._id">
            <input v-model="post.title" class="input-field" />
            <textarea v-model="post.content" class="textarea-field"></textarea>
            <div class="post-actions">
              <button @click="updatePost(post)" class="action-btn save">Save</button>
              <button @click="editingPost = null" class="action-btn cancel">Cancel</button>
            </div>
          </template>
          <template v-else>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-content">{{ post.content }}</p>
            <div v-if="post.sentiment" class="sentiment-info">
              <p class="sentiment-score">
                Estado de ánimo: {{ getSentimentEmoji(post.sentiment.score) }} 
                {{ getSentimentText(post.sentiment.score) }}
              </p>
              <div v-if="post.sentiment.positive.length" class="sentiment-words">
                <strong>Palabras positivas:</strong> {{ post.sentiment.positive.join(', ') }}
              </div>
              <div v-if="post.sentiment.negative.length" class="sentiment-words">
                <strong>Palabras negativas:</strong> {{ post.sentiment.negative.join(', ') }}
              </div>
            </div>
            <div class="post-actions">
              <button @click="editingPost = post._id" class="action-btn edit">Edit</button>
              <button @click="deletePost(post._id)" class="action-btn delete">Delete</button>
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

.sentiment-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.sentiment-score {
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
}

.sentiment-words {
  font-size: 0.9rem;
  color: #666;
  margin: 0.5rem 0;
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