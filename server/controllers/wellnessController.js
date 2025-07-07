import { wellnessService } from '../services/wellnessService.js';
import { WellnessMetrics } from '../models/WellnessMetrics.js';
import { Post } from '../models/Post.js';
import { Emotion } from '../models/Emotion.js';

export const wellnessController = {
  /**
   * Dashboard principal con métricas de resumen
   */
  getDashboard: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Generar métricas actuales
      const currentMetrics = await wellnessService.generateUserMetrics(userId, 'daily');
      
      // Obtener posts de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      
      const todayPosts = await Post.find({
        author: userId,
        createdAt: { $gte: today, $lte: todayEnd }
      });

      // Interpretar estado del día
      let todayStatus = 'good';
      if (currentMetrics.metrics.wellnessScore >= 8) todayStatus = 'excellent';
      else if (currentMetrics.metrics.wellnessScore >= 6) todayStatus = 'good';
      else if (currentMetrics.metrics.wellnessScore >= 4) todayStatus = 'fair';
      else todayStatus = 'needs_attention';

      const dashboard = {
        wellnessScore: currentMetrics.metrics.wellnessScore,
        todayStatus,
        quickStats: {
          streakDays: currentMetrics.streaks.currentWriting,
          thisWeekPosts: todayPosts.length,
          positivityRatio: `${currentMetrics.metrics.positivityRatio.toFixed(1)}:1`,
          emotionalBalance: currentMetrics.metrics.emotionalBalance
        },
        trends: currentMetrics.trends,
        goals: {
          weekly: `${currentMetrics.goals.weekly.achieved}/${currentMetrics.goals.weekly.target} posts`,
          weeklyStatus: currentMetrics.goals.weekly.status,
          monthly: `${currentMetrics.goals.monthly.achieved}/${currentMetrics.goals.monthly.target} posts`,
          monthlyStatus: currentMetrics.goals.monthly.status
        },
        emotionalHealth: currentMetrics.emotionalHealth
      };

      res.json({ success: true, dashboard });
    } catch (error) {
      console.error('Error getting wellness dashboard:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Métricas detalladas por período
   */
  getDetailedMetrics: async (req, res) => {
    try {
      const userId = req.user.id;
      const { period = 'weekly', date } = req.query;
      
      const targetDate = date ? new Date(date) : new Date();
      const metrics = await wellnessService.generateUserMetrics(userId, period, targetDate);
      
      // Guardar métricas en la base de datos
      await WellnessMetrics.findOneAndUpdate(
        { userId, period, date: targetDate },
        metrics,
        { upsert: true, new: true }
      );

      res.json({ success: true, metrics });
    } catch (error) {
      console.error('Error getting detailed metrics:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Comparación entre períodos
   */
  getComparativeAnalysis: async (req, res) => {
    try {
      const userId = req.user.id;
      const { period1, period2, startDate1, startDate2 } = req.query;
      
      const date1 = startDate1 ? new Date(startDate1) : new Date();
      const date2 = startDate2 ? new Date(startDate2) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const metrics1 = await wellnessService.generateUserMetrics(userId, period1 || 'weekly', date1);
      const metrics2 = await wellnessService.generateUserMetrics(userId, period2 || 'weekly', date2);
      
      // Calcular diferencias
      const comparison = {
        wellnessScore: {
          current: metrics1.metrics.wellnessScore,
          previous: metrics2.metrics.wellnessScore,
          change: metrics1.metrics.wellnessScore - metrics2.metrics.wellnessScore,
          changePercentage: ((metrics1.metrics.wellnessScore - metrics2.metrics.wellnessScore) / metrics2.metrics.wellnessScore * 100).toFixed(1)
        },
        emotionalBalance: {
          current: metrics1.metrics.emotionalBalance,
          previous: metrics2.metrics.emotionalBalance,
          change: metrics1.metrics.emotionalBalance - metrics2.metrics.emotionalBalance
        },
        writingConsistency: {
          current: metrics1.metrics.writingConsistency,
          previous: metrics2.metrics.writingConsistency,
          change: metrics1.metrics.writingConsistency - metrics2.metrics.writingConsistency
        },
        positivityRatio: {
          current: metrics1.metrics.positivityRatio,
          previous: metrics2.metrics.positivityRatio,
          change: metrics1.metrics.positivityRatio - metrics2.metrics.positivityRatio
        }
      };

      res.json({ success: true, comparison });
    } catch (error) {
      console.error('Error getting comparative analysis:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Tendencias históricas
   */
  getHistoricalTrends: async (req, res) => {
    try {
      const userId = req.user.id;
      const { period = 'weekly', limit = 10 } = req.query;
      
      const historicalData = await WellnessMetrics.find({
        userId,
        period
      })
      .sort({ date: -1 })
      .limit(parseInt(limit));

      if (historicalData.length === 0) {
        // Generar datos si no existen
        const trends = [];
        const today = new Date();
        
        for (let i = limit - 1; i >= 0; i--) {
          const date = new Date(today);
          if (period === 'daily') {
            date.setDate(date.getDate() - i);
          } else if (period === 'weekly') {
            date.setDate(date.getDate() - (i * 7));
          } else if (period === 'monthly') {
            date.setMonth(date.getMonth() - i);
          }
          
          const metrics = await wellnessService.generateUserMetrics(userId, period, date);
          trends.push({
            date: date.toISOString().split('T')[0],
            wellnessScore: metrics.metrics.wellnessScore,
            emotionalBalance: metrics.metrics.emotionalBalance,
            writingConsistency: metrics.metrics.writingConsistency,
            positivityRatio: metrics.metrics.positivityRatio
          });
        }
        
        res.json({ success: true, trends });
      } else {
        const trends = historicalData.map(data => ({
          date: data.date.toISOString().split('T')[0],
          wellnessScore: data.metrics.wellnessScore,
          emotionalBalance: data.metrics.emotionalBalance,
          writingConsistency: data.metrics.writingConsistency,
          positivityRatio: data.metrics.positivityRatio
        }));
        
        res.json({ success: true, trends });
      }
    } catch (error) {
      console.error('Error getting historical trends:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Análisis de patrones específicos
   */
  getPatternAnalysis: async (req, res) => {
    try {
      const userId = req.user.id;
      const { days = 30 } = req.query;
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      
      const posts = await Post.find({
        author: userId,
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const emotions = await Emotion.find({
        post: { $in: posts.map(p => p._id) }
      });
      
      const patterns = wellnessService.identifyPatterns(posts, emotions);
      const volatility = wellnessService.calculateEmotionalVolatility(emotions);
      const recovery = wellnessService.calculateEmotionalRecovery(emotions);
      
      const analysis = {
        timeframe: `${days} días`,
        patterns,
        emotionalVolatility: volatility,
        recoveryPattern: recovery,
        insights: []
      };
      
      // Generar insights automáticos
      if (patterns.bestDays.length > 0) {
        analysis.insights.push({
          type: 'positive',
          message: `Tus mejores días para escribir son: ${patterns.bestDays.join(' y ')}`
        });
      }
      
      if (patterns.bestTimes.length > 0) {
        analysis.insights.push({
          type: 'positive',
          message: `Escribes mejor durante: ${patterns.bestTimes.join(' y ')}`
        });
      }
      
      if (volatility.level === 'high') {
        analysis.insights.push({
          type: 'warning',
          message: 'Tu estado emocional ha sido bastante variable últimamente. Considera técnicas de estabilización.'
        });
      }
      
      if (recovery.averageTime > 3) {
        analysis.insights.push({
          type: 'suggestion',
          message: 'Te tomas tiempo para recuperarte de emociones negativas. Esto es normal y saludable.'
        });
      }
      
      res.json({ success: true, analysis });
    } catch (error) {
      console.error('Error getting pattern analysis:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Predicción de bienestar (simple)
   */
  getWellnessForecast: async (req, res) => {
    try {
      const userId = req.user.id;
      const { days = 7 } = req.query;
      
      // Obtener tendencia reciente
      const recentMetrics = await WellnessMetrics.find({
        userId,
        period: 'daily'
      })
      .sort({ date: -1 })
      .limit(7);
      
      if (recentMetrics.length < 3) {
        return res.json({
          success: true,
          forecast: {
            message: 'Necesitas más datos para generar predicciones precisas',
            confidence: 0
          }
        });
      }
      
      // Calcular tendencia simple
      const scores = recentMetrics.map(m => m.metrics.wellnessScore);
      const trend = (scores[0] - scores[scores.length - 1]) / scores.length;
      
      const currentScore = scores[0];
      const predictedScore = Math.max(0, Math.min(10, currentScore + (trend * parseInt(days))));
      
      let recommendation = 'Mantén tu rutina actual';
      if (trend < -0.2) {
        recommendation = 'Considera actividades que mejoren tu bienestar';
      } else if (trend > 0.2) {
        recommendation = 'Excelente progreso, continúa así';
      }
      
      const forecast = {
        nextDays: parseInt(days),
        predictedScore: parseFloat(predictedScore.toFixed(1)),
        currentScore: parseFloat(currentScore.toFixed(1)),
        trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
        confidence: Math.min(85, recentMetrics.length * 12),
        recommendation
      };
      
      res.json({ success: true, forecast });
    } catch (error) {
      console.error('Error getting wellness forecast:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}; 