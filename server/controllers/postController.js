import { Post } from '../models/Post.js';
import { Emotion } from '../models/Emotion.js';


export const postController = {
  // Crear un nuevo post y su emoción asociada
  create: async (req, res) => {
    try {
      const post = new Post({
        ...req.body,
        author: req.user.id,  // Asigna el ID del usuario autenticado
      });
      await post.save();

      // Guarda la emoción con un score (Positivo: 2, Negativo: -2, Neutral: 0)
      const emotion = new Emotion({
        name: req.body.emotion,
        score: req.body.emotion === 'Positivo' ? 2 : req.body.emotion === 'Negativo' ? -2 : 0,
        post: post._id
      });
      await emotion.save();

      // Retornar emoción junto con el post
      const postWithEmotion = {
        ...post.toObject(),
        emotion: emotion
      };
      
      res.json({ success: true, post: postWithEmotion });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Obtener todos los posts del usuario con sus emociones
  getAll: async (req, res) => {
    try {
      const posts = await Post.find({ author: req.user.id })
        .sort({ createdAt: -1 });

      // Busca las emociones asociadas a los posts
      const emotions = await Emotion.find({ post: { $in: posts.map(post => post._id) } });

      // Combina posts con sus emociones
      const postsWithEmotions = posts.map(post => ({
        ...post.toObject(),
        emotion: emotions.find(e => e.post.toString() === post._id.toString())
      }));

      res.json({ success: true, posts: postsWithEmotions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Buscar posts por query (título/contenido) o emoción
  search: async (req, res) => {
    try {
      const { query, emotion } = req.query;
      let posts = [];

      // Filtra por emoción si se especifica
      if (emotion) {
        const emotions = await Emotion.find({ 
          name: emotion
        }).populate('post');
        posts = emotions.map(e => e.post).filter(post => post && post.author.toString() === req.user.id);
      }

      // Filtra por búsqueda de texto (regex insensible a mayúsculas)
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

      // Combina posts con emociones
      const emotions = await Emotion.find({
        post: { $in: posts.map(post => post._id) }
      });

      const postsWithEmotions = posts.map(post => ({
        ...post.toObject(),
        emotion: emotions.find(e => e.post.toString() === post._id.toString())
      }));

      res.json({ success: true, posts: postsWithEmotions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Actualizar un post y su emoción
  update: async (req, res) => {
    try {
      const post = await Post.findOneAndUpdate(
        { _id: req.params.id, author: req.user.id },  // Solo permite actualizar posts del usuario autenticado
        { ...req.body},
        { new: true } // Devuelve el post actualizado
      );
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post no encontrado' });
      }

      // Actualiza o crea la emoción asociada
      await Emotion.findOneAndUpdate(
        { post: post._id },
        {
          name: req.body.emotion,
          score: req.body.emotion === 'Positivo' ? 2 : req.body.emotion === 'Negativo' ? -2 : 0
        },
        { upsert: true, new: true }  // Si no existe, la crea
      );

      // Return the post with the updated emotion
      const postWithEmotion = {
        ...post.toObject(),
        emotion: updatedEmotion
      };

      res.json({ success: true, post: postWithEmotion });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Eliminar un post y su emoción asociada
  delete: async (req, res) => {
    try {
      const post = await Post.findOneAndDelete({
        _id: req.params.id,
        author: req.user.id // Solo permite borrar posts del usuario autenticado
      });

      if (!post) {
        return res.status(404).json({ success: false, message: 'Post no encontrado' });
      }

      await Emotion.deleteOne({ post: post._id });
      res.json({ success: true, message: 'Post eliminado' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};