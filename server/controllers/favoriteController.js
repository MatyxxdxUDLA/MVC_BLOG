import { Favorite } from '../models/Favorite.js';
import { Post } from '../models/Post.js';

export const favoriteController = {
  // Toggle favorito - agregar o quitar de favoritos
  toggle: async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      // Verificar que el post existe
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post no encontrado' });
      }

      // Buscar si ya existe el favorito
      const existingFavorite = await Favorite.findOne({ user: userId, post: postId });

      if (existingFavorite) {
        // Si existe, lo eliminamos (quitar de favoritos)
        await Favorite.deleteOne({ _id: existingFavorite._id });
        res.json({ 
          success: true, 
          message: 'Post removido de favoritos',
          isFavorite: false 
        });
      } else {
        // Si no existe, lo creamos (agregar a favoritos)
        await Favorite.create({ user: userId, post: postId });
        res.json({ 
          success: true, 
          message: 'Post agregado a favoritos',
          isFavorite: true 
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Listar todos los posts favoritos del usuario
  list: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const favorites = await Favorite.find({ user: userId })
        .populate('post')
        .sort({ createdAt: -1 });

      // Filtrar solo los posts que aún existen
      const validFavorites = favorites.filter(fav => fav.post);

      res.json({ 
        success: true, 
        favorites: validFavorites.map(fav => fav.post),
        count: validFavorites.length
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Contar total de favoritos del usuario
  count: async (req, res) => {
    try {
      const userId = req.user.id;
      const count = await Favorite.countDocuments({ user: userId });
      
      res.json({ 
        success: true, 
        count 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Verificar si un post específico es favorito del usuario
  checkStatus: async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      const favorite = await Favorite.findOne({ user: userId, post: postId });
      
      res.json({ 
        success: true, 
        isFavorite: !!favorite 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}; 