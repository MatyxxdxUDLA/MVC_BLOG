<template>
  <div class="trends-chart">
    <div class="chart-header">
      <div class="metric-selector">
        <button 
          v-for="metric in metrics" 
          :key="metric.key"
          @click="selectedMetric = metric.key"
          :class="{ active: selectedMetric === metric.key }"
          class="metric-btn"
        >
          {{ metric.label }}
        </button>
      </div>
    </div>
    
    <div class="chart-container" v-if="chartData.length > 0">
      <svg 
        :width="chartWidth" 
        :height="chartHeight" 
        class="chart-svg"
        ref="chartSvg"
      >
        <!-- Grid lines -->
        <g class="grid">
          <line 
            v-for="i in 5" 
            :key="`grid-${i}`"
            :x1="padding.left"
            :y1="padding.top + ((chartHeight - padding.top - padding.bottom) / 4) * (i - 1)"
            :x2="chartWidth - padding.right"
            :y2="padding.top + ((chartHeight - padding.top - padding.bottom) / 4) * (i - 1)"
            stroke="#f3f4f6"
            stroke-width="1"
          />
        </g>
        
        <!-- Y-axis labels -->
        <g class="y-axis">
          <text 
            v-for="(value, i) in yAxisLabels" 
            :key="`y-label-${i}`"
            :x="padding.left - 10"
            :y="padding.top + ((chartHeight - padding.top - padding.bottom) / 4) * i + 5"
            text-anchor="end"
            class="axis-label"
          >
            {{ value.toFixed(1) }}
          </text>
        </g>
        
        <!-- Line path -->
        <path 
          :d="linePath" 
          fill="none" 
          :stroke="getMetricColor(selectedMetric)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        
        <!-- Data points -->
        <g class="data-points">
          <circle
            v-for="(point, i) in chartPoints"
            :key="`point-${i}`"
            :cx="point.x"
            :cy="point.y"
            r="5"
            :fill="getMetricColor(selectedMetric)"
            class="data-point"
            @mouseover="showTooltip($event, i)"
            @mouseout="hideTooltip"
          />
        </g>
        
        <!-- X-axis labels -->
        <g class="x-axis">
          <text 
            v-for="(point, i) in chartPoints" 
            :key="`x-label-${i}`"
            :x="point.x"
            :y="chartHeight - padding.bottom + 20"
            text-anchor="middle"
            class="axis-label"
          >
            {{ formatDate(chartData[i].date) }}
          </text>
        </g>
      </svg>
      
      <!-- Tooltip -->
      <div 
        v-if="tooltip.show"
        class="tooltip"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="tooltip-content">
          <div class="tooltip-date">{{ tooltip.date }}</div>
          <div class="tooltip-value">
            <span class="tooltip-metric">{{ getMetricLabel(selectedMetric) }}:</span>
            <span class="tooltip-number">{{ tooltip.value }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-chart-data">
      <p>No hay suficientes datos para mostrar el gráfico</p>
    </div>

    <!-- Summary Stats -->
    <div class="chart-summary" v-if="chartData.length > 0">
      <div class="summary-item">
        <span class="summary-label">Promedio:</span>
        <span class="summary-value">{{ getAverage().toFixed(1) }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Tendencia:</span>
        <span class="summary-value" :class="getTrendClass()">
          {{ getTrendText() }}
          <span class="trend-icon">{{ getTrendIcon() }}</span>
        </span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Mejor día:</span>
        <span class="summary-value">{{ getBestDay() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { TrendData } from '../services/wellnessService'

// Types
type MetricKey = 'wellnessScore' | 'emotionalBalance' | 'writingConsistency' | 'positivityRatio'

// Props
interface Props {
  data: TrendData[]
}

const props = defineProps<Props>()

// Reactive data
const chartWidth = ref(600)
const chartHeight = ref(300)
const selectedMetric = ref<MetricKey>('wellnessScore')
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  date: '',
  value: ''
})

const chartSvg = ref<SVGElement>()

// Chart configuration
const padding = {
  top: 20,
  right: 20,
  bottom: 50,
  left: 50
}

const metrics = [
  { key: 'wellnessScore' as MetricKey, label: 'Wellness Score' },
  { key: 'emotionalBalance' as MetricKey, label: 'Balance Emocional' },
  { key: 'writingConsistency' as MetricKey, label: 'Consistencia' },
  { key: 'positivityRatio' as MetricKey, label: 'Positividad' }
]

// Computed properties
const chartData = computed(() => {
  return props.data.slice().reverse() // Show chronologically
})

const currentValues = computed(() => {
  return chartData.value.map(d => Number(d[selectedMetric.value]) || 0)
})

const minValue = computed(() => {
  const values = currentValues.value
  return values.length > 0 ? Math.min(...values) : 0
})

const maxValue = computed(() => {
  const values = currentValues.value
  const max = values.length > 0 ? Math.max(...values) : 10
  return selectedMetric.value === 'positivityRatio' ? Math.max(max, 5) : Math.max(max, 10)
})

const yAxisLabels = computed(() => {
  const range = maxValue.value - minValue.value
  const step = range / 4
  return Array.from({ length: 5 }, (_, i) => maxValue.value - (step * i))
})

const chartPoints = computed(() => {
  if (currentValues.value.length === 0) return []
  
  const points: Array<{ x: number; y: number }> = []
  const xStep = (chartWidth.value - padding.left - padding.right) / Math.max(currentValues.value.length - 1, 1)
  const yRange = chartHeight.value - padding.top - padding.bottom
  const valueRange = maxValue.value - minValue.value || 1
  
  currentValues.value.forEach((value, i) => {
    const x = padding.left + (i * xStep)
    const y = padding.top + yRange - ((value - minValue.value) / valueRange) * yRange
    points.push({ x, y })
  })
  
  return points
})

const linePath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  
  let path = `M ${chartPoints.value[0].x} ${chartPoints.value[0].y}`
  
  for (let i = 1; i < chartPoints.value.length; i++) {
    const prevPoint = chartPoints.value[i - 1]
    const currentPoint = chartPoints.value[i]
    
    // Smooth curve using quadratic bezier
    const controlX = prevPoint.x + (currentPoint.x - prevPoint.x) / 2
    path += ` Q ${controlX} ${prevPoint.y} ${currentPoint.x} ${currentPoint.y}`
  }
  
  return path
})

// Methods
const getMetricColor = (metric: MetricKey) => {
  const colors: Record<MetricKey, string> = {
    wellnessScore: '#3b82f6',
    emotionalBalance: '#10b981',
    writingConsistency: '#8b5cf6',
    positivityRatio: '#f59e0b'
  }
  return colors[metric] || '#6b7280'
}

const getMetricLabel = (metric: MetricKey) => {
  const metric_obj = metrics.find(m => m.key === metric)
  return metric_obj?.label || metric
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { 
    month: 'short', 
    day: 'numeric' 
  })
}

const showTooltip = (event: MouseEvent, index: number) => {
  const rect = (event.target as Element).getBoundingClientRect()
  const chartRect = chartSvg.value?.getBoundingClientRect()
  
  if (chartRect) {
    tooltip.value = {
      show: true,
      x: rect.left - chartRect.left + 10,
      y: rect.top - chartRect.top - 10,
      date: formatDate(chartData.value[index].date),
      value: currentValues.value[index].toFixed(1)
    }
  }
}

const hideTooltip = () => {
  tooltip.value.show = false
}

const getAverage = () => {
  if (currentValues.value.length === 0) return 0
  const sum = currentValues.value.reduce((acc, val) => acc + val, 0)
  return sum / currentValues.value.length
}

const getTrendClass = () => {
  if (currentValues.value.length < 2) return 'stable'
  
  const first = currentValues.value[0]
  const last = currentValues.value[currentValues.value.length - 1]
  const change = last - first
  
  if (change > 0.5) return 'improving'
  if (change < -0.5) return 'declining'
  return 'stable'
}

const getTrendText = () => {
  const trendClass = getTrendClass()
  const texts = {
    improving: 'Mejorando',
    declining: 'Declinando',
    stable: 'Estable'
  }
  return texts[trendClass as keyof typeof texts]
}

const getTrendIcon = () => {
  const trendClass = getTrendClass()
  const icons = {
    improving: '📈',
    declining: '📉',
    stable: '➡️'
  }
  return icons[trendClass as keyof typeof icons]
}

const getBestDay = () => {
  if (currentValues.value.length === 0) return 'N/A'
  
  const maxIndex = currentValues.value.indexOf(Math.max(...currentValues.value))
  return formatDate(chartData.value[maxIndex].date)
}

const updateChartSize = () => {
  if (chartSvg.value) {
    const container = chartSvg.value.parentElement
    if (container) {
      chartWidth.value = Math.min(600, container.clientWidth)
      chartHeight.value = 300
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  updateChartSize()
  window.addEventListener('resize', updateChartSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartSize)
})
</script>

<style scoped>
.trends-chart {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.chart-header {
  margin-bottom: 1rem;
}

.metric-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.metric-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  font-weight: 500;
}

.metric-btn:hover {
  border-color: #d1d5db;
}

.metric-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.chart-container {
  position: relative;
  width: 100%;
  overflow-x: auto;
}

.chart-svg {
  max-width: 100%;
  height: auto;
}

.axis-label {
  font-size: 11px;
  fill: #6b7280;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.data-point {
  cursor: pointer;
  transition: r 0.2s ease;
}

.data-point:hover {
  r: 7;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tooltip-date {
  font-weight: 500;
}

.tooltip-metric {
  opacity: 0.8;
}

.tooltip-number {
  font-weight: bold;
  margin-left: 0.5rem;
}

.no-chart-data {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.chart-summary {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.summary-value.improving {
  color: #059669;
}

.summary-value.declining {
  color: #dc2626;
}

.summary-value.stable {
  color: #d97706;
}

.trend-icon {
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .metric-selector {
    justify-content: center;
  }
  
  .metric-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
  
  .chart-summary {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    text-align: center;
  }
  
  .summary-item {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .chart-container {
    margin: 0 -1rem;
  }
  
  .metric-selector {
    gap: 0.25rem;
  }
  
  .metric-btn {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }
}
</style> 