import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice único para evitar duplicados (un usuario no puede marcar el mismo post como favorito dos veces)
favoriteSchema.index({ user: 1, post: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema); 