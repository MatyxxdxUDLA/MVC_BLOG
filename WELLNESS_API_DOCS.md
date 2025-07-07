# 🧘 API de Métricas de Bienestar

## Descripción General

La API de Métricas de Bienestar convierte los datos emocionales del blog en métricas cuantificables de bienestar mental. Proporciona insights profundos sobre patrones emocionales, tendencias de bienestar y progreso personal.

## 📊 Métricas Principales

### Wellness Score (0-10)
- **Definición**: Puntuación general de bienestar calculada con algoritmos ponderados
- **Componentes**:
  - Balance Emocional (30%)
  - Consistencia de Escritura (25%) 
  - Ratio de Positividad (25%)
  - Profundidad de Auto-reflexión (20%)

### Balance Emocional (0-10)
- Combina estabilidad emocional y promedio de sentimientos
- Considera la varianza entre emociones para medir estabilidad

### Consistencia de Escritura (0-10)
- Mide la regularidad en el hábito de escritura
- Calcula posts por día vs. frecuencia ideal

### Ratio de Positividad
- Proporción entre emociones positivas y negativas
- Formato: "X:1" (ej. "3.5:1")

### Profundidad de Auto-reflexión (0-10)
- Analiza el contenido usando palabras clave reflexivas
- Considera longitud y calidad del contenido

## 🚀 Endpoints de la API

### 1. Dashboard Principal
```
GET /api/wellness/dashboard
```

**Respuesta:**
```json
{
  "success": true,
  "dashboard": {
    "wellnessScore": 8.5,
    "todayStatus": "excellent",
    "quickStats": {
      "streakDays": 12,
      "thisWeekPosts": 5,
      "positivityRatio": "6.5:1",
      "emotionalBalance": 8.2
    },
    "trends": {
      "direction": "improving",
      "changePercentage": 12.5,
      "comparedToPrevious": "better"
    },
    "goals": {
      "weekly": "5/5 posts",
      "weeklyStatus": "achieved",
      "monthly": "18/20 posts", 
      "monthlyStatus": "in_progress"
    },
    "emotionalHealth": {
      "balance": {
        "positive": 15,
        "neutral": 3,
        "negative": 2
      },
      "volatility": {
        "score": 2.1,
        "level": "low"
      },
      "recovery": {
        "averageTime": 1.2,
        "description": "Te recuperas rápido de emociones negativas"
      }
    }
  }
}
```

### 2. Métricas Detalladas
```
GET /api/wellness/metrics?period=weekly&date=2024-01-15
```

**Parámetros:**
- `period`: `daily` | `weekly` | `monthly`
- `date`: Fecha en formato ISO (opcional)

### 3. Análisis Comparativo
```
GET /api/wellness/compare?period1=weekly&period2=weekly&startDate1=2024-01-15&startDate2=2024-01-08
```

**Respuesta:**
```json
{
  "success": true,
  "comparison": {
    "wellnessScore": {
      "current": 8.5,
      "previous": 7.2,
      "change": 1.3,
      "changePercentage": "+18.1%"
    },
    "emotionalBalance": {
      "current": 8.2,
      "previous": 7.5,
      "change": 0.7
    }
  }
}
```

### 4. Tendencias Históricas
```
GET /api/wellness/trends?period=weekly&limit=10
```

**Respuesta:**
```json
{
  "success": true,
  "trends": [
    {
      "date": "2024-01-15",
      "wellnessScore": 8.5,
      "emotionalBalance": 8.2,
      "writingConsistency": 9.0,
      "positivityRatio": 6.5
    }
  ]
}
```

### 5. Análisis de Patrones
```
GET /api/wellness/patterns?days=30
```

**Respuesta:**
```json
{
  "success": true,
  "analysis": {
    "timeframe": "30 días",
    "patterns": {
      "bestDays": ["Martes", "Viernes"],
      "bestTimes": ["mañana", "noche"],
      "emotionalCycles": {
        "weekly": "Fuerte lunes, pico miércoles",
        "monthly": "Mejora en segunda mitad del mes"
      },
      "triggers": {
        "positive": ["ejercicio", "familia", "música"],
        "negative": ["trabajo", "estrés", "cansancio"]
      }
    },
    "emotionalVolatility": {
      "score": 2.1,
      "level": "low"
    },
    "insights": [
      {
        "type": "positive",
        "message": "Tus mejores días para escribir son: Martes y Viernes"
      }
    ]
  }
}
```

### 6. Predicción de Bienestar
```
GET /api/wellness/forecast?days=7
```

**Respuesta:**
```json
{
  "success": true,
  "forecast": {
    "nextDays": 7,
    "predictedScore": 8.7,
    "currentScore": 8.5,
    "trend": "improving",
    "confidence": 85,
    "recommendation": "Excelente progreso, continúa así"
  }
}
```

## 🎨 Frontend - Componentes Vue.js

### WellnessDashboard.vue
- **Descripción**: Componente principal del dashboard de bienestar
- **Características**:
  - Wellness Score visual con gauge circular
  - Estadísticas rápidas en tarjetas
  - Gráficos de tendencias interactivos
  - Análisis de patrones emocionales
  - Predicciones de bienestar
  - Responsive design

### WellnessTrendsChart.vue
- **Descripción**: Componente de gráficos para visualizar tendencias
- **Características**:
  - Gráficos SVG nativos (sin librerías externas)
  - Múltiples métricas seleccionables
  - Tooltips interactivos
  - Estadísticas de resumen
  - Responsive y accesible

### Servicio Frontend (wellnessService.ts)
- **Descripción**: Servicio TypeScript para consumir la API
- **Características**:
  - Interfaces TypeScript completas
  - Manejo de errores
  - Métodos utilitarios para formateo
  - Cache y optimización

## 🗄️ Estructura de Base de Datos

### Modelo WellnessMetrics
```javascript
{
  userId: ObjectId,
  date: Date,
  period: "daily" | "weekly" | "monthly",
  metrics: {
    wellnessScore: Number,
    emotionalBalance: Number,
    writingConsistency: Number,
    positivityRatio: Number,
    selfReflectionDepth: Number
  },
  emotionalHealth: {
    balance: {
      positive: Number,
      neutral: Number, 
      negative: Number
    },
    volatility: {
      score: Number,
      level: "low" | "medium" | "high"
    },
    recovery: {
      averageTime: Number,
      description: String
    }
  },
  trends: {
    direction: "improving" | "stable" | "declining",
    changePercentage: Number,
    comparedToPrevious: "better" | "same" | "worse"
  },
  patterns: {
    bestDays: [String],
    bestTimes: [String],
    emotionalCycles: {
      weekly: String,
      monthly: String
    },
    triggers: {
      positive: [String],
      negative: [String]
    }
  },
  streaks: {
    currentWriting: Number,
    currentPositive: Number,
    recordWriting: Number,
    recordPositive: Number
  },
  goals: {
    weekly: {
      target: Number,
      achieved: Number,
      status: "achieved" | "in_progress" | "missed"
    },
    monthly: {
      target: Number,
      achieved: Number,
      status: "achieved" | "in_progress" | "missed"
    }
  }
}
```

## 🔧 Algoritmos de Cálculo

### Wellness Score
```javascript
const weights = {
  emotionalBalance: 0.3,
  writingConsistency: 0.25,
  positivityRatio: 0.25,
  selfReflectionDepth: 0.2
};

wellnessScore = sum(metric * weight for each metric)
```

### Balance Emocional
```javascript
// Promedio normalizado + estabilidad
const normalizedAvg = ((avgEmotion + 2) / 4) * 10;
const stability = Math.max(0, 10 - variance);
const balance = (stability * 0.6) + (normalizedAvg * 0.4);
```

### Volatilidad Emocional
```javascript
// Variación promedio entre emociones consecutivas
const avgVariation = totalVariation / (emotions.length - 1);
const volatilityScore = Math.min(10, avgVariation * 2);
```

## 🚀 Navegación

- **Ruta**: `/wellness`
- **Autenticación**: Requerida
- **Menú**: Agregado a la navegación principal como "🧘 Bienestar"

## 📱 Características de UX

- **Responsive Design**: Funciona en móviles y tablets
- **Loading States**: Indicadores de carga
- **Error Handling**: Manejo elegante de errores
- **Tooltips**: Información contextual en gráficos
- **Color Coding**: Colores intuitivos para diferentes estados
- **Insights Automáticos**: Sugerencias basadas en patrones

## 🔄 Estados de Datos

### Wellness Score Estados
- **8.0-10.0**: Excelente (Verde)
- **6.0-7.9**: Bueno (Azul)  
- **4.0-5.9**: Regular (Amarillo)
- **0.0-3.9**: Necesita atención (Rojo)

### Tendencias
- **Improving**: Mejorando 📈
- **Stable**: Estable ➡️
- **Declining**: Declinando 📉

### Volatilidad
- **Low**: Baja (0-3)
- **Medium**: Media (3-6)
- **High**: Alta (6-10)

## 🎯 Próximas Mejoras

1. **Exportación de datos** en PDF/CSV
2. **Alertas proactivas** por email/push
3. **Comparación social anónima** con otros usuarios
4. **IA predictiva avanzada** con más variables
5. **Integración con dispositivos** wearables
6. **Recomendaciones personalizadas** basadas en IA

---

**Implementado**: ✅ API Backend completa, Frontend Vue.js, Navegación integrada
**Estado**: 🚀 Listo para producción
**Tecnologías**: Node.js, Express, MongoDB, Vue.js, TypeScript 