import { Post } from '../models/Post.js';
import { Emotion } from '../models/Emotion.js';
import { WellnessMetrics } from '../models/WellnessMetrics.js';

export const wellnessService = {
  /**
   * Calcula el Wellness Score general del usuario
   */
  calculateWellnessScore: (metrics) => {
    const weights = {
      emotionalBalance: 0.3,
      writingConsistency: 0.25,
      positivityRatio: 0.25,
      selfReflectionDepth: 0.2
    };

    const normalizedPositivity = Math.min(10, Math.max(0, metrics.positivityRatio * 2));
    
    return (
      metrics.emotionalBalance * weights.emotionalBalance +
      metrics.writingConsistency * weights.writingConsistency +
      normalizedPositivity * weights.positivityRatio +
      metrics.selfReflectionDepth * weights.selfReflectionDepth
    );
  },

  /**
   * Calcula el balance emocional basado en la estabilidad y variabilidad
   */
  calculateEmotionalBalance: (emotions) => {
    if (!emotions.length) return 5;

    const scores = emotions.map(e => e.score);
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Calcular varianza para medir estabilidad
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    const stability = Math.max(0, 10 - variance);
    
    // Combinar promedio emocional y estabilidad
    const normalizedAvg = ((avg + 2) / 4) * 10; // Normalizar de [-2,2] a [0,10]
    return (stability * 0.6) + (normalizedAvg * 0.4);
  },

  /**
   * Calcula la consistencia de escritura
   */
  calculateWritingConsistency: (posts, days = 30) => {
    if (!posts.length) return 0;

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const postsInPeriod = posts.filter(post => 
      new Date(post.createdAt) >= startDate && new Date(post.createdAt) <= endDate
    );

    const postsPerDay = postsInPeriod.length / days;
    const idealFrequency = 1; // 1 post por día como ideal
    
    return Math.min(10, (postsPerDay / idealFrequency) * 10);
  },

  /**
   * Calcula el ratio de positividad
   */
  calculatePositivityRatio: (emotions) => {
    if (!emotions.length) return 0;

    const positive = emotions.filter(e => e.score > 0).length;
    const negative = emotions.filter(e => e.score < 0).length;
    
    if (negative === 0) return positive > 0 ? 10 : 0;
    return positive / negative;
  },

  /**
   * Evalúa la profundidad de auto-reflexión basada en el contenido
   */
  calculateSelfReflectionDepth: (posts) => {
    if (!posts.length) return 0;

    const reflectionKeywords = [
      'siento', 'pienso', 'reflexiono', 'me doy cuenta', 'aprendí', 
      'descubrí', 'entiendo', 'comprendo', 'significa', 'importante',
      'experiencia', 'lección', 'crecer', 'cambiar', 'mejorar'
    ];

    let totalReflectionScore = 0;
    
    posts.forEach(post => {
      const content = post.content.toLowerCase();
      const wordCount = content.split(' ').length;
      const reflectionMatches = reflectionKeywords.filter(keyword => 
        content.includes(keyword)
      ).length;
      
      // Puntuación basada en palabras reflexivas y longitud
      const reflectionScore = Math.min(10, (reflectionMatches / wordCount) * 100 + (wordCount / 50));
      totalReflectionScore += reflectionScore;
    });

    return totalReflectionScore / posts.length;
  },

  /**
   * Calcula la volatilidad emocional
   */
  calculateEmotionalVolatility: (emotions) => {
    if (emotions.length < 2) return { score: 0, level: 'low' };

    const scores = emotions.map(e => e.score);
    let totalVariation = 0;

    for (let i = 1; i < scores.length; i++) {
      totalVariation += Math.abs(scores[i] - scores[i-1]);
    }

    const avgVariation = totalVariation / (scores.length - 1);
    const volatilityScore = Math.min(10, avgVariation * 2);

    let level = 'low';
    if (volatilityScore > 6) level = 'high';
    else if (volatilityScore > 3) level = 'medium';

    return { score: volatilityScore, level };
  },

  /**
   * Calcula el tiempo promedio de recuperación emocional
   */
  calculateEmotionalRecovery: (emotions) => {
    if (emotions.length < 2) return { averageTime: 0, description: 'Datos insuficientes' };

    const negativeEmotions = emotions.filter(e => e.score < 0);
    let recoveryTimes = [];

    negativeEmotions.forEach(negEmotion => {
      const negDate = new Date(negEmotion.createdAt);
      const nextPositive = emotions.find(e => 
        e.score > 0 && new Date(e.createdAt) > negDate
      );

      if (nextPositive) {
        const posDate = new Date(nextPositive.createdAt);
        const recoveryDays = (posDate - negDate) / (1000 * 60 * 60 * 24);
        recoveryTimes.push(recoveryDays);
      }
    });

    if (recoveryTimes.length === 0) {
      return { averageTime: 0, description: 'No se encontraron patrones de recuperación' };
    }

    const avgRecovery = recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length;
    
    let description = 'Recuperación rápida';
    if (avgRecovery > 3) description = 'Recuperación lenta';
    else if (avgRecovery > 1) description = 'Recuperación moderada';

    return { averageTime: avgRecovery, description };
  },

  /**
   * Calcula las rachas actuales y récords
   */
  calculateStreaks: async (userId) => {
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
    const emotions = await Emotion.find({ 
      post: { $in: posts.map(p => p._id) } 
    }).sort({ createdAt: -1 });

    let currentWriting = 0;
    let currentPositive = 0;
    let recordWriting = 0;
    let recordPositive = 0;
    
    // Calcular racha actual de escritura
    const today = new Date();
    for (let i = 0; i < posts.length; i++) {
      const postDate = new Date(posts[i].createdAt);
      const daysDiff = Math.floor((today - postDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        currentWriting++;
      } else {
        break;
      }
    }

    // Calcular racha actual de emociones positivas
    for (let emotion of emotions) {
      if (emotion.score > 0) {
        currentPositive++;
      } else {
        break;
      }
    }

    // Calcular récords (simplificado)
    recordWriting = Math.max(currentWriting, recordWriting);
    recordPositive = Math.max(currentPositive, recordPositive);

    return {
      currentWriting,
      currentPositive,
      recordWriting,
      recordPositive
    };
  },

  /**
   * Identifica patrones temporales y triggers
   */
  identifyPatterns: (posts, emotions) => {
    const patterns = {
      bestDays: [],
      bestTimes: [],
      emotionalCycles: { weekly: '', monthly: '' },
      triggers: { positive: [], negative: [] }
    };

    // Analizar días de la semana
    const dayScores = {};
    emotions.forEach(emotion => {
      const day = new Date(emotion.createdAt).getDay();
      const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][day];
      
      if (!dayScores[dayName]) dayScores[dayName] = [];
      dayScores[dayName].push(emotion.score);
    });

    // Encontrar mejores días
    const avgDayScores = Object.keys(dayScores).map(day => ({
      day,
      avg: dayScores[day].reduce((sum, score) => sum + score, 0) / dayScores[day].length
    }));
    
    patterns.bestDays = avgDayScores
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 2)
      .map(d => d.day);

    // Analizar horarios
    const hourScores = {};
    emotions.forEach(emotion => {
      const hour = new Date(emotion.createdAt).getHours();
      let timeOfDay = 'mañana';
      if (hour >= 12 && hour < 18) timeOfDay = 'tarde';
      else if (hour >= 18) timeOfDay = 'noche';
      
      if (!hourScores[timeOfDay]) hourScores[timeOfDay] = [];
      hourScores[timeOfDay].push(emotion.score);
    });

    const avgHourScores = Object.keys(hourScores).map(time => ({
      time,
      avg: hourScores[time].reduce((sum, score) => sum + score, 0) / hourScores[time].length
    }));
    
    patterns.bestTimes = avgHourScores
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 2)
      .map(t => t.time);

    return patterns;
  },

  /**
   * Genera métricas completas para un usuario en un período específico
   */
  generateUserMetrics: async (userId, period = 'daily', date = new Date()) => {
    try {
      // Determinar rango de fechas según el período
      const endDate = new Date(date);
      const startDate = new Date(date);
      
      switch (period) {
        case 'daily':
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      // Obtener datos del usuario
      const posts = await Post.find({
        author: userId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: -1 });

      const emotions = await Emotion.find({
        post: { $in: posts.map(p => p._id) }
      }).sort({ createdAt: -1 });

      // Calcular métricas individuales
      const emotionalBalance = wellnessService.calculateEmotionalBalance(emotions);
      const writingConsistency = wellnessService.calculateWritingConsistency(posts);
      const positivityRatio = wellnessService.calculatePositivityRatio(emotions);
      const selfReflectionDepth = wellnessService.calculateSelfReflectionDepth(posts);
      
      const metrics = {
        emotionalBalance,
        writingConsistency,
        positivityRatio,
        selfReflectionDepth
      };

      const wellnessScore = wellnessService.calculateWellnessScore(metrics);

      // Calcular salud emocional
      const balance = {
        positive: emotions.filter(e => e.score > 0).length,
        neutral: emotions.filter(e => e.score === 0).length,
        negative: emotions.filter(e => e.score < 0).length
      };

      const volatility = wellnessService.calculateEmotionalVolatility(emotions);
      const recovery = wellnessService.calculateEmotionalRecovery(emotions);
      const streaks = await wellnessService.calculateStreaks(userId);
      const patterns = wellnessService.identifyPatterns(posts, emotions);

      // Calcular tendencia comparando con período anterior
      const previousPeriodStart = new Date(startDate);
      const previousPeriodEnd = new Date(startDate);
      
      switch (period) {
        case 'daily':
          previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
          break;
        case 'weekly':
          previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
          break;
        case 'monthly':
          previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);
          break;
      }

      const previousMetrics = await WellnessMetrics.findOne({
        userId,
        period,
        date: { $gte: previousPeriodStart, $lte: previousPeriodEnd }
      });

      let trends = {
        direction: 'stable',
        changePercentage: 0,
        comparedToPrevious: 'same'
      };

      if (previousMetrics) {
        const change = wellnessScore - previousMetrics.metrics.wellnessScore;
        trends.changePercentage = ((change / previousMetrics.metrics.wellnessScore) * 100).toFixed(1);
        
        if (change > 0.5) {
          trends.direction = 'improving';
          trends.comparedToPrevious = 'better';
        } else if (change < -0.5) {
          trends.direction = 'declining';
          trends.comparedToPrevious = 'worse';
        }
      }

      return {
        userId,
        date: endDate,
        period,
        metrics: {
          wellnessScore: parseFloat(wellnessScore.toFixed(1)),
          emotionalBalance: parseFloat(emotionalBalance.toFixed(1)),
          writingConsistency: parseFloat(writingConsistency.toFixed(1)),
          positivityRatio: parseFloat(positivityRatio.toFixed(1)),
          selfReflectionDepth: parseFloat(selfReflectionDepth.toFixed(1))
        },
        emotionalHealth: {
          balance,
          volatility,
          recovery
        },
        trends,
        patterns,
        streaks,
        goals: {
          weekly: {
            target: 5,
            achieved: posts.length,
            status: posts.length >= 5 ? 'achieved' : 'in_progress'
          },
          monthly: {
            target: 20,
            achieved: posts.length,
            status: posts.length >= 20 ? 'achieved' : 'in_progress'
          }
        }
      };
    } catch (error) {
      console.error('Error generating user metrics:', error);
      throw error;
    }
  }
}; 