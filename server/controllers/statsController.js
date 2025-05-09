import { Post } from '../models/Post.js';
import { Emotion } from '../models/Emotion.js';

export const statsController = {
  getEmotionalStats: async (req, res) => {
    try {
      const emotions = await Emotion.aggregate([
        { $match: { post: { $in: await Post.find({ author: req.user.id }).distinct('_id') } } },
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

      // Transform the data for frontend consumption
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
  }
};