<script setup lang="ts">
import { ref, onMounted } from 'vue';

//Interfaz para tipar las tendencias emocionales
interface EmotionTrend {
  date: string;
  averageScore: number;
  emotionCounts: {
    Positivo: number;
    Neutral: number;
    Negativo: number;
  };
}

interface DateRange {
  _id: string;
  count: number;
}

//Datos
const emotionalTrends = ref<EmotionTrend[]>([]);  //Almacena las estadísticas emocionales
const message = ref('');                          //Mensaje error o éxito
const startDate = ref('');
const endDate = ref('');
const dateRange = ref<DateRange[]>([]); //Almacena el rango de fechas para filtrar
const mostFrequent = ref<DateRange | null>(null); //Almacena la fecha más frecuente

//Función para obtener las estadísticas emocionales desde la API
const fetchEmotionalStats = async () => {
  const token = localStorage.getItem('token'); //Token JWT
  try {
    const response = await fetch('/api/stats/emotional', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (data.success) {
      emotionalTrends.value = data.stats; //Actualiza los datos de tendencias emocionales
    } else {
      message.value = data.message;       // Mensaje de error del backend
    }
  } catch (error) {
    message.value = 'Error fetching emotional statistics';  // Error de conexión
  }
};

const analyzeEmotionsByDateRange = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(
      `/api/stats/emotions-range?startDate=${startDate.value}&endDate=${endDate.value}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    if (data.success) {
      dateRange.value = data.emotions;
      mostFrequent.value = data.mostFrequent;
    } else {
      message.value = data.message;
    }
  } catch (error) {
    message.value = 'Error al analizar emociones por rango de fechas';
  }
};

// Al montar el componente, carga los datos
onMounted(fetchEmotionalStats);
</script>

<template>
  <div class="stats-container">
    <h2>Emotional Progress Dashboard</h2>
    
    <!-- Mensajes de estado -->
    <div v-if="message" class="message" :class="{ error: message.includes('Error') }">
      {{ message }}
    </div>

    <div class="date-range-analysis">
      <h3>Analyze Emotions by Date Range</h3>
      <div class="date-inputs">
        <div class="input-group">
          <label for="startDate">Start Date:</label>
          <input 
            type="date" 
            id="startDate" 
            v-model="startDate"
            class="date-input"
          />
        </div>
        <div class="input-group">
          <label for="endDate">End Date:</label>
          <input 
            type="date" 
            id="endDate" 
            v-model="endDate"
            class="date-input"
          />
        </div>
        <button @click="analyzeEmotionsByDateRange" class="analyze-btn">
          Analyze
        </button>
      </div>

      <div v-if="mostFrequent" class="analysis-results">
        <h4>Analysis Results</h4>
        <p class="most-frequent">
          Most Frequent Emotion: 
          <span class="emotion-name">
            {{ mostFrequent._id }}
            {{ mostFrequent._id === 'Positivo' ? '😊' : 
               mostFrequent._id === 'Negativo' ? '😔' : '😐' }}
          </span>
          ({{ mostFrequent.count }} times)
        </p>
      </div>
    </div>

    <!-- Grid de visualización -->
    <div class="stats-grid">
      <!-- Tarjeta 1: Distribución de emociones -->
      <div class="stat-card">
        <h3>Emotional Distribution</h3>
        <div class="emotion-distribution">
          <div v-for="trend in emotionalTrends" :key="trend.date" class="trend-item">
            <div class="date">{{ new Date(trend.date).toLocaleDateString() }}</div>
            <div class="emotion-bars">
              <div 
                class="emotion-bar positive"
                :style="{ width: `${(trend.emotionCounts.Positivo / 
                  (trend.emotionCounts.Positivo + trend.emotionCounts.Neutral + trend.emotionCounts.Negativo)) * 100}%` }"
              >
                😊 {{ trend.emotionCounts.Positivo }}
              </div>
              <div 
                class="emotion-bar neutral"
                :style="{ width: `${(trend.emotionCounts.Neutral / 
                  (trend.emotionCounts.Positivo + trend.emotionCounts.Neutral + trend.emotionCounts.Negativo)) * 100}%` }"
              >
                😐 {{ trend.emotionCounts.Neutral }}
              </div>
              <div 
                class="emotion-bar negative"
                :style="{ width: `${(trend.emotionCounts.Negativo / 
                  (trend.emotionCounts.Positivo + trend.emotionCounts.Neutral + trend.emotionCounts.Negativo)) * 100}%` }"
              >
                😔 {{ trend.emotionCounts.Negativo }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjeta 2: Tendencias -->
      <div class="stat-card">
        <h3>Emotional Trend</h3>
        <div class="trend-graph">

          <!-- Puntos del gráfico posicionados dinámicamente -->
          <div 
            v-for="(trend, index) in emotionalTrends" 
            :key="trend.date"
            class="trend-point"
            :style="{ 
              left: `${(index / (emotionalTrends.length - 1)) * 100}%`,
              bottom: `${((trend.averageScore + 5) / 10) * 100}%`
            }"
            :title="`Score: ${trend.averageScore.toFixed(2)}`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-container {
  padding: 2rem;
}

.stats-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-top: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.emotion-distribution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.trend-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date {
  font-size: 0.9rem;
  color: #666;
}

.emotion-bars {
  display: flex;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
}

.emotion-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  transition: width 0.3s ease;
}

.emotion-bar.positive {
  background-color: #4caf50;
}

.emotion-bar.neutral {
  background-color: #ff9800;
}

.emotion-bar.negative {
  background-color: #f44336;
}

.trend-graph {
  position: relative;
  height: 200px;
  border-bottom: 1px solid #ddd;
  border-left: 1px solid #ddd;
  margin: 2rem 0;
}

.trend-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #42b883;
  border-radius: 50%;
  transform: translate(-50%, 50%);
}

.trend-point::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #42b883;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
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
</style>