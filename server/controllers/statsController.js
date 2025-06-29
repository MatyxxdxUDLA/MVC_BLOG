import { Post } from '../models/Post.js';
import { Emotion } from '../models/Emotion.js';

export const statsController = {
  // Obtiene estadísticas emocionales agrupadas por fecha
  getEmotionalStats: async (req, res) => {
    try {
      // Obtener post de usuarios
      const userPosts = await Post.find({ author: req.user.id }).select('_id');
      const postIds = userPosts.map(post => post._id);

      const emotions = await Emotion.aggregate([
        { $match: { post: { $in: postIds } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              name: "$name"
            },
            count: { $sum: 1 },
            averageScore: { $avg: "$score" }
          }
        },
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
        { $sort: { "_id": 1 } }
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
      if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Rango de fechas inválido' });
      }
      // Obtener posts del usuario autenticado
      const userPosts = await Post.find({ author: req.user.id }).select('_id');
      const postIds = userPosts.map(post => post._id);

      console.log('Post usuario:', postIds.length);
      console.log('Rango fechas:', startDate, 'to', endDate);


      const emotions = await Emotion.aggregate([
        {
          $match: {
            post: { $in: postIds },
            createdAt: {
              $gte: new Date(startDate + 'T00:00:00.000Z'),
              $lte: new Date(endDate + 'T23:59:59.999Z')
            }
          }
        },
        {
          $group: {
            _id: "$name",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      console.log('Emotions found:', emotions);

      //Encontrar la emoción más frecuente
      const mostFrequent = emotions.length > 0 ? emotions[0] : { _id: 'No se encontró emociones', count: 0 };

      res.json({ 
        success: true, 
        emotions,
        mostFrequent,
        period: {startDate, endDate}
      });
    } catch (error) {
      console.error('Error en getEmotionsByDateRange:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};