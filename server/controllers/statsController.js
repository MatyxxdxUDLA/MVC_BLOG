import { Post } from '../models/Post.js';
import { Emotion } from '../models/Emotion.js';

export const statsController = {
  // Obtiene estadísticas emocionales agrupadas por fecha
  getEmotionalStats: async (req, res) => {
    try {
      const emotions = await Emotion.aggregate([
        // Filtra emociones de posts del usuario actual
        { $match: { post: { $in: await Post.find({ author: req.user.id }).distinct('_id') } } },
        // Agrupa por fecha y emoción
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              name: "$name"
            },
            count: { $sum: 1 },               // Cuenta ocurrencias
            averageScore: { $avg: "$score" }  // Calcula puntuación media
          }
        },
        // Reagrupa por fecha para consolidar emociones
        {
          $group: {
            _id: "$_id.date",
            emotionCounts: {
              $push: {
                name: "$_id.name",
                count: "$count"
              }
            },
            averageScore: { $avg: "$averageScore" }
          }
        },
        { $sort: { "_id": 1 } } // Ordena por fecha ascendente
      ]);

      // Transforma los datos para el frontend
      const stats = emotions.map(day => ({
        date: day._id,
        averageScore: day.averageScore,
        emotionCounts: {
          Positivo: day.emotionCounts.find(e => e.name === 'Positivo')?.count || 0,
          Neutral: day.emotionCounts.find(e => e.name === 'Neutral')?.count || 0,
          Negativo: day.emotionCounts.find(e => e.name === 'Negativo')?.count || 0
        }
      }));

      res.json({ success: true, stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getEmotionsRangeDate: async (req, res) => {
    try{
      const { startDate, endDate } = req.query;
      const emotions = await Emotion.aggregate([
        // Filtra emociones de posts del usuario actual y por rango de fechas
        { $match: { 
            post: { $in: await Post.find({ author: req.user.id }).distinct('_id') },
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          } 
        },
        // Agrupa por fecha y emoción
        {
          $group: {
            _id: "name",
            count: { $sum: 1 },               // Cuenta ocurrencias
          }
        },
        { $sort: { count: -1 } } // Ordena por cantidad de emociones
      ]);

      const mostFrequent = emotions.reduce((max, emotion) => {
        return (emotion.count > max.count) ? emotion : max;
      }, { count: 0 });

      res.json({ 
        success: true, 
        emotions,
        mostFrequent,
        period: {startDate, endDate}
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });

    }
  }
};