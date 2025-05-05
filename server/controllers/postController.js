import { Post } from '../models/Post.js';
import { Emotion } from '../models/Emotion.js';


export const postController = {
  create: async (req, res) => {
    try {
      const post = new Post({
        ...req.body,
        author: req.user.id,
      });
      await post.save();

      if (req.sentiment) {
        const emotion = new Emotion({
          name: req.sentiment.score > 1 ? 'Positivo' : req.sentiment.score < -1 ? 'Negativo' : 'Neutral',
          score: req.sentiment.score,
          post: post._id
        });
        await emotion.save();
      }
      
      res.json({ success: true, post });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const posts = await Post.find({ author: req.user.id })
        .sort({ createdAt: -1 });
      res.json({ success: true, posts });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  search: async (req, res) => {
    try {
      const { query, emotion } = req.query;
      let posts = [];

      if (emotion) {
        const emotions = await Emotion.find({ 
          name: emotion,
          score: emotion === 'Positivo' ? { $gt: 1 } : emotion === 'Negativo' ? { $lt: -1 } : { $gte: -1, $lte: 1 }
        }).populate('post');
        posts = emotions.map(e => e.post).filter(post => post.author.toString() === req.user.id);
      }

      if (query) {
        const searchRegex = new RegExp(query, 'i');
        const searchQuery = {
          author: req.user.id,
          $or: [
            { title: searchRegex },
            { content: searchRegex }
          ]
        };
        posts = emotion ? posts.filter(post => 
          searchRegex.test(post.title) || searchRegex.test(post.content)
        ) : await Post.find(searchQuery);
      }

      res.json({ success: true, posts });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const post = await Post.findOneAndUpdate(
        { _id: req.params.id, author: req.user.id },
        { ...req.body},
        { new: true }
      );
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      if (req.sentiment) {
        await Emotion.findOneAndUpdate(
          { post: post._id },
          {
            name: req.sentiment.score > 1 ? 'Positivo' : req.sentiment.score < -1 ? 'Negativo' : 'Neutral',
            score: req.sentiment.score
          },
          { upsert: true }
        );
      }

      res.json({ success: true, post });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const post = await Post.findOneAndDelete({
        _id: req.params.id,
        author: req.user.id
      });

      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      await Emotion.deleteOne({ post: post._id });
      res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};