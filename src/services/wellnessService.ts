export interface WellnessMetrics {
  wellnessScore: number;
  emotionalBalance: number;
  writingConsistency: number;
  positivityRatio: number;
  selfReflectionDepth: number;
}

export interface EmotionalBalance {
  positive: number;
  neutral: number;
  negative: number;
}

export interface Volatility {
  score: number;
  level: 'low' | 'medium' | 'high';
}

export interface Recovery {
  averageTime: number;
  description: string;
}

export interface EmotionalHealth {
  balance: EmotionalBalance;
  volatility: Volatility;
  recovery: Recovery;
}

export interface Trends {
  direction: 'improving' | 'stable' | 'declining';
  changePercentage: number;
  comparedToPrevious: 'better' | 'same' | 'worse';
}

export interface Streaks {
  currentWriting: number;
  currentPositive: number;
  recordWriting: number;
  recordPositive: number;
}

export interface Goals {
  weekly: {
    target: number;
    achieved: number;
    status: 'achieved' | 'in_progress' | 'missed';
  };
  monthly: {
    target: number;
    achieved: number;
    status: 'achieved' | 'in_progress' | 'missed';
  };
}

export interface Dashboard {
  wellnessScore: number;
  todayStatus: 'excellent' | 'good' | 'fair' | 'needs_attention';
  quickStats: {
    streakDays: number;
    thisWeekPosts: number;
    positivityRatio: string;
    emotionalBalance: number;
  };
  trends: Trends;
  goals: {
    weekly: string;
    weeklyStatus: string;
    monthly: string;
    monthlyStatus: string;
  };
  emotionalHealth: EmotionalHealth;
}

export interface TrendData {
  date: string;
  wellnessScore: number;
  emotionalBalance: number;
  writingConsistency: number;
  positivityRatio: number;
}

export interface Comparison {
  wellnessScore: {
    current: number;
    previous: number;
    change: number;
    changePercentage: string;
  };
  emotionalBalance: {
    current: number;
    previous: number;
    change: number;
  };
  writingConsistency: {
    current: number;
    previous: number;
    change: number;
  };
  positivityRatio: {
    current: number;
    previous: number;
    change: number;
  };
}

export interface PatternAnalysis {
  timeframe: string;
  patterns: {
    bestDays: string[];
    bestTimes: string[];
    emotionalCycles: {
      weekly: string;
      monthly: string;
    };
    triggers: {
      positive: string[];
      negative: string[];
    };
  };
  emotionalVolatility: Volatility;
  recoveryPattern: Recovery;
  insights: Array<{
    type: 'positive' | 'warning' | 'suggestion';
    message: string;
  }>;
}

export interface Forecast {
  nextDays: number;
  predictedScore: number;
  currentScore: number;
  trend: 'improving' | 'stable' | 'declining';
  confidence: number;
  recommendation: string;
}

class WellnessService {
  private baseURL = '/api/wellness';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Error desconocido');
    }

    return data;
  }

  /**
   * Obtiene el dashboard principal de wellness
   */
  async getDashboard(): Promise<Dashboard> {
    const response = await this.request<{ dashboard: Dashboard }>('/dashboard');
    return response.dashboard;
  }

  /**
   * Obtiene métricas detalladas por período
   */
  async getDetailedMetrics(period: 'daily' | 'weekly' | 'monthly' = 'weekly', date?: string): Promise<WellnessMetrics> {
    const params = new URLSearchParams();
    params.append('period', period);
    if (date) params.append('date', date);

    const response = await this.request<{ metrics: { metrics: WellnessMetrics } }>(`/metrics?${params}`);
    return response.metrics.metrics;
  }

  /**
   * Obtiene análisis comparativo entre períodos
   */
  async getComparativeAnalysis(
    period1: string = 'weekly',
    period2: string = 'weekly',
    startDate1?: string,
    startDate2?: string
  ): Promise<Comparison> {
    const params = new URLSearchParams();
    params.append('period1', period1);
    params.append('period2', period2);
    if (startDate1) params.append('startDate1', startDate1);
    if (startDate2) params.append('startDate2', startDate2);

    const response = await this.request<{ comparison: Comparison }>(`/compare?${params}`);
    return response.comparison;
  }

  /**
   * Obtiene tendencias históricas
   */
  async getHistoricalTrends(
    period: 'daily' | 'weekly' | 'monthly' = 'weekly',
    limit: number = 10
  ): Promise<TrendData[]> {
    const params = new URLSearchParams();
    params.append('period', period);
    params.append('limit', limit.toString());

    const response = await this.request<{ trends: TrendData[] }>(`/trends?${params}`);
    return response.trends;
  }

  /**
   * Obtiene análisis de patrones
   */
  async getPatternAnalysis(days: number = 30): Promise<PatternAnalysis> {
    const params = new URLSearchParams();
    params.append('days', days.toString());

    const response = await this.request<{ analysis: PatternAnalysis }>(`/patterns?${params}`);
    return response.analysis;
  }

  /**
   * Obtiene predicción de bienestar
   */
  async getWellnessForecast(days: number = 7): Promise<Forecast> {
    const params = new URLSearchParams();
    params.append('days', days.toString());

    const response = await this.request<{ forecast: Forecast }>(`/forecast?${params}`);
    return response.forecast;
  }

  /**
   * Calcula el color basado en el wellness score
   */
  getScoreColor(score: number): string {
    if (score >= 8) return '#22c55e'; // verde
    if (score >= 6) return '#3b82f6'; // azul  
    if (score >= 4) return '#f59e0b'; // amarillo
    return '#ef4444'; // rojo
  }

  /**
   * Interpreta el wellness score en texto
   */
  interpretScore(score: number): string {
    if (score >= 8) return 'Excelente';
    if (score >= 6) return 'Bueno';
    if (score >= 4) return 'Regular';
    return 'Necesita atención';
  }

  /**
   * Formatea porcentajes de cambio
   */
  formatChangePercentage(change: number): string {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  /**
   * Obtiene la descripción de la tendencia
   */
  getTrendDescription(direction: string): string {
    switch (direction) {
      case 'improving': return 'Mejorando';
      case 'declining': return 'Declinando';
      case 'stable': return 'Estable';
      default: return 'Sin cambios';
    }
  }

  /**
   * Formatea ratio de positividad
   */
  formatPositivityRatio(ratio: number): string {
    if (ratio === 0) return '0:1';
    if (ratio < 1) return `1:${(1/ratio).toFixed(1)}`;
    return `${ratio.toFixed(1)}:1`;
  }
}

export const wellnessService = new WellnessService(); 