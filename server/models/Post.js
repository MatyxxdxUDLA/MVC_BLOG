import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentiment: {
    score: Number,
    comparative: Number,
    tokens: [String],
    words: [String],
    positive: [String],
    negative: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Post = mongoose.model('Post', postSchema);