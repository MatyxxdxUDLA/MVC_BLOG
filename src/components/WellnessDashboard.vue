<template>
  <div class="wellness-dashboard">
    <!-- Header del Dashboard -->
    <div class="dashboard-header">
      <h2>🧘 Dashboard de Bienestar</h2>
      <div class="period-selector">
        <select v-model="selectedPeriod" @change="loadData" class="period-select">
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando métricas de bienestar...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>❌ Error al cargar datos: {{ error }}</p>
      <button @click="loadData" class="retry-btn">Reintentar</button>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- Wellness Score Principal -->
      <div class="wellness-score-card">
        <div class="score-container">
          <div class="score-circle" :style="{ background: getScoreGradient(dashboard.wellnessScore) }">
            <div class="score-value">{{ dashboard.wellnessScore.toFixed(1) }}</div>
            <div class="score-label">Wellness Score</div>
          </div>
          <div class="score-info">
            <h3>{{ getScoreInterpretation(dashboard.wellnessScore) }}</h3>
            <p class="status-badge" :class="dashboard.todayStatus">
              {{ getStatusText(dashboard.todayStatus) }}
            </p>
            <div class="trend-indicator" :class="dashboard.trends.direction">
              <span class="trend-icon">{{ getTrendIcon(dashboard.trends.direction) }}</span>
              <span>{{ getTrendText(dashboard.trends.direction) }}</span>
              <span v-if="dashboard.trends.changePercentage">
                ({{ dashboard.trends.changePercentage > 0 ? '+' : '' }}{{ dashboard.trends.changePercentage }}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboard.quickStats.streakDays }}</div>
            <div class="stat-label">Días seguidos</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboard.quickStats.thisWeekPosts }}</div>
            <div class="stat-label">Posts esta semana</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">😊</div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboard.quickStats.positivityRatio }}</div>
            <div class="stat-label">Ratio positividad</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚖️</div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboard.quickStats.emotionalBalance.toFixed(1) }}</div>
            <div class="stat-label">Balance emocional</div>
          </div>
        </div>
      </div>

      <!-- Detailed Metrics -->
      <div class="metrics-grid">
        <!-- Emotional Health -->
        <div class="metric-card">
          <h4>💖 Salud Emocional</h4>
          <div class="emotional-balance">
            <div class="balance-chart">
              <div class="balance-bar">
                <div 
                  class="balance-segment positive" 
                  :style="{ width: getBalancePercentage('positive') + '%' }"
                ></div>
                <div 
                  class="balance-segment neutral" 
                  :style="{ width: getBalancePercentage('neutral') + '%' }"
                ></div>
                <div 
                  class="balance-segment negative" 
                  :style="{ width: getBalancePercentage('negative') + '%' }"
                ></div>
              </div>
              <div class="balance-legend">
                <span class="legend-item positive">
                  Positivo: {{ dashboard.emotionalHealth.balance.positive }}
                </span>
                <span class="legend-item neutral">
                  Neutral: {{ dashboard.emotionalHealth.balance.neutral }}
                </span>
                <span class="legend-item negative">
                  Negativo: {{ dashboard.emotionalHealth.balance.negative }}
                </span>
              </div>
            </div>
            <div class="volatility-info">
              <p><strong>Volatilidad:</strong> {{ getVolatilityText(dashboard.emotionalHealth.volatility.level) }}</p>
              <p><strong>Recuperación:</strong> {{ dashboard.emotionalHealth.recovery.description }}</p>
            </div>
          </div>
        </div>

        <!-- Goals Progress -->
        <div class="metric-card">
          <h4>🎯 Progreso de Metas</h4>
          <div class="goals-progress">
            <div class="goal-item">
              <div class="goal-header">
                <span>Meta Semanal</span>
                <span class="goal-status" :class="dashboard.goals.weeklyStatus">
                  {{ getGoalStatusIcon(dashboard.goals.weeklyStatus) }}
                </span>
              </div>
              <div class="goal-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill weekly" 
                    :style="{ width: getGoalProgress('weekly') + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ dashboard.goals.weekly }}</span>
              </div>
            </div>
            <div class="goal-item">
              <div class="goal-header">
                <span>Meta Mensual</span>
                <span class="goal-status" :class="dashboard.goals.monthlyStatus">
                  {{ getGoalStatusIcon(dashboard.goals.monthlyStatus) }}
                </span>
              </div>
              <div class="goal-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill monthly" 
                    :style="{ width: getGoalProgress('monthly') + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ dashboard.goals.monthly }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Trends Chart -->
        <div class="metric-card trends-card">
          <h4>📈 Tendencias Recientes</h4>
          <div v-if="trends.length > 0" class="trends-chart">
            <WellnessTrendsChart :data="trends" />
          </div>
          <div v-else class="no-data">
            <p>No hay suficientes datos para mostrar tendencias</p>
          </div>
        </div>

        <!-- Pattern Analysis -->
        <div class="metric-card" v-if="patterns">
          <h4>🔍 Análisis de Patrones</h4>
          <div class="patterns-content">
            <div v-if="patterns.patterns.bestDays.length > 0" class="pattern-item">
              <strong>Mejores días:</strong> {{ patterns.patterns.bestDays.join(', ') }}
            </div>
            <div v-if="patterns.patterns.bestTimes.length > 0" class="pattern-item">
              <strong>Mejores horarios:</strong> {{ patterns.patterns.bestTimes.join(', ') }}
            </div>
            <div class="insights">
              <h5>💡 Insights</h5>
              <div v-for="insight in patterns.insights" :key="insight.message" 
                   class="insight-item" :class="insight.type">
                <span class="insight-icon">{{ getInsightIcon(insight.type) }}</span>
                <span>{{ insight.message }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Forecast -->
        <div class="metric-card" v-if="forecast">
          <h4>🔮 Predicción de Bienestar</h4>
          <div class="forecast-content">
            <div class="forecast-score">
              <div class="forecast-current">
                <span class="label">Actual:</span>
                <span class="value">{{ forecast.currentScore.toFixed(1) }}</span>
              </div>
              <div class="forecast-arrow">→</div>
              <div class="forecast-predicted">
                <span class="label">Predicción ({{ forecast.nextDays }}d):</span>
                <span class="value" :class="forecast.trend">{{ forecast.predictedScore.toFixed(1) }}</span>
              </div>
            </div>
            <div class="forecast-confidence">
              <span>Confianza: {{ forecast.confidence }}%</span>
            </div>
            <div class="forecast-recommendation">
              <strong>Recomendación:</strong> {{ forecast.recommendation }}
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="dashboard-actions">
        <button @click="refreshData" class="action-btn primary">
          <span class="btn-icon">🔄</span>
          Actualizar Datos
        </button>
        <button @click="exportData" class="action-btn secondary">
          <span class="btn-icon">📊</span>
          Exportar Métricas
        </button>
        <button @click="viewDetailedAnalysis" class="action-btn secondary">
          <span class="btn-icon">🔍</span>
          Análisis Detallado
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { wellnessService, type Dashboard, type TrendData, type PatternAnalysis, type Forecast } from '../services/wellnessService'
import WellnessTrendsChart from './WellnessTrendsChart.vue'

// Reactive data
const loading = ref(true)
const error = ref<string | null>(null)
const selectedPeriod = ref<'daily' | 'weekly' | 'monthly'>('weekly')
const dashboard = ref<Dashboard>({} as Dashboard)
const trends = ref<TrendData[]>([])
const patterns = ref<PatternAnalysis | null>(null)
const forecast = ref<Forecast | null>(null)

// Computed properties
const totalEmotions = computed(() => {
  if (!dashboard.value.emotionalHealth) return 0
  const { positive, neutral, negative } = dashboard.value.emotionalHealth.balance
  return positive + neutral + negative
})

// Methods
const loadData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Load dashboard data
    dashboard.value = await wellnessService.getDashboard()
    
    // Load trends
    trends.value = await wellnessService.getHistoricalTrends(selectedPeriod.value, 7)
    
    // Load patterns
    patterns.value = await wellnessService.getPatternAnalysis(30)
    
    // Load forecast
    forecast.value = await wellnessService.getWellnessForecast(7)
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

const exportData = () => {
  // TODO: Implement export functionality
  alert('Funcionalidad de exportación en desarrollo')
}

const viewDetailedAnalysis = () => {
  // TODO: Navigate to detailed analysis view
  alert('Vista de análisis detallado en desarrollo')
}

// Helper methods
const getScoreGradient = (score: number) => {
  const colors = {
    excellent: 'conic-gradient(#22c55e 0deg, #16a34a 360deg)',
    good: 'conic-gradient(#3b82f6 0deg, #2563eb 360deg)',
    fair: 'conic-gradient(#f59e0b 0deg, #d97706 360deg)',
    poor: 'conic-gradient(#ef4444 0deg, #dc2626 360deg)'
  }
  
  if (score >= 8) return colors.excellent
  if (score >= 6) return colors.good
  if (score >= 4) return colors.fair
  return colors.poor
}

const getScoreInterpretation = (score: number) => {
  return wellnessService.interpretScore(score)
}

const getStatusText = (status: string) => {
  const statusMap = {
    excellent: '🌟 Excelente',
    good: '😊 Bueno',
    fair: '😐 Regular',
    needs_attention: '🚨 Necesita atención'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getTrendIcon = (direction: string) => {
  const iconMap = {
    improving: '📈',
    declining: '📉',
    stable: '➡️'
  }
  return iconMap[direction as keyof typeof iconMap] || '➡️'
}

const getTrendText = (direction: string) => {
  return wellnessService.getTrendDescription(direction)
}

const getBalancePercentage = (type: 'positive' | 'neutral' | 'negative') => {
  if (!dashboard.value.emotionalHealth || totalEmotions.value === 0) return 0
  const count = dashboard.value.emotionalHealth.balance[type]
  return (count / totalEmotions.value) * 100
}

const getVolatilityText = (level: string) => {
  const levelMap = {
    low: 'Baja (Estable)',
    medium: 'Media (Normal)',
    high: 'Alta (Variable)'
  }
  return levelMap[level as keyof typeof levelMap] || level
}

const getGoalStatusIcon = (status: string) => {
  const iconMap = {
    achieved: '✅',
    in_progress: '🔄',
    missed: '❌'
  }
  return iconMap[status as keyof typeof iconMap] || '🔄'
}

const getGoalProgress = (type: 'weekly' | 'monthly') => {
  const goalText = dashboard.value.goals[type]
  const [achieved, target] = goalText.split('/').map(part => parseInt(part.split(' ')[0]))
  return Math.min(100, (achieved / target) * 100)
}

const getInsightIcon = (type: string) => {
  const iconMap = {
    positive: '✨',
    warning: '⚠️',
    suggestion: '💡'
  }
  return iconMap[type as keyof typeof iconMap] || '💡'
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.wellness-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  color: #1f2937;
  margin: 0;
  font-size: 2rem;
}

.period-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}

.wellness-score-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
}

.score-container {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-value {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.score-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.score-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.status-badge.excellent { background: rgba(34, 197, 94, 0.2); }
.status-badge.good { background: rgba(59, 130, 246, 0.2); }
.status-badge.fair { background: rgba(245, 158, 11, 0.2); }
.status-badge.needs_attention { background: rgba(239, 68, 68, 0.2); }

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.trend-indicator.improving { color: #22c55e; }
.trend-indicator.declining { color: #ef4444; }
.trend-indicator.stable { color: #f59e0b; }

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
}

.metric-card h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.balance-bar {
  height: 8px;
  border-radius: 4px;
  display: flex;
  overflow: hidden;
  margin-bottom: 0.5rem;
  background: #f3f4f6;
}

.balance-segment.positive { background: #22c55e; }
.balance-segment.neutral { background: #f59e0b; }
.balance-segment.negative { background: #ef4444; }

.balance-legend {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.legend-item::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-item.positive::before { background: #22c55e; }
.legend-item.neutral::before { background: #f59e0b; }
.legend-item.negative::before { background: #ef4444; }

.goals-progress {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.weekly { background: #3b82f6; }
.progress-fill.monthly { background: #8b5cf6; }

.insights {
  margin-top: 1rem;
}

.insights h5 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.insight-item.positive { color: #059669; }
.insight-item.warning { color: #d97706; }
.insight-item.suggestion { color: #3b82f6; }

.forecast-content {
  text-align: center;
}

.forecast-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.forecast-current, .forecast-predicted {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.forecast-score .label {
  font-size: 0.8rem;
  color: #6b7280;
}

.forecast-score .value {
  font-size: 1.5rem;
  font-weight: bold;
}

.forecast-score .value.improving { color: #22c55e; }
.forecast-score .value.declining { color: #ef4444; }
.forecast-score .value.stable { color: #f59e0b; }

.dashboard-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

.trends-card {
  grid-column: 1 / -1;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

@media (max-width: 768px) {
  .wellness-dashboard {
    padding: 1rem;
  }
  
  .score-container {
    flex-direction: column;
    text-align: center;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 