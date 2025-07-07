import mongoose from 'mongoose';

const wellnessMetricsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  metrics: {
    wellnessScore: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    emotionalBalance: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    writingConsistency: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    positivityRatio: {
      type: Number,
      required: true
    },
    selfReflectionDepth: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    }
  },
  emotionalHealth: {
    balance: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 }
    },
    volatility: {
      score: { type: Number, min: 0, max: 10 },
      level: { type: String, enum: ['low', 'medium', 'high'] }
    },
    recovery: {
      averageTime: { type: Number }, // días promedio para recuperarse de emociones negativas
      description: { type: String }
    }
  },
  trends: {
    direction: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      required: true
    },
    changePercentage: {
      type: Number
    },
    comparedToPrevious: {
      type: String,
      enum: ['better', 'same', 'worse']
    }
  },
  patterns: {
    bestDays: [String],
    bestTimes: [String],
    emotionalCycles: {
      weekly: String,
      monthly: String
    },
    triggers: {
      positive: [String],
      negative: [String]
    }
  },
  streaks: {
    currentWriting: { type: Number, default: 0 },
    currentPositive: { type: Number, default: 0 },
    recordWriting: { type: Number, default: 0 },
    recordPositive: { type: Number, default: 0 }
  },
  goals: {
    weekly: {
      target: { type: Number, default: 5 },
      achieved: { type: Number, default: 0 },
      status: { type: String, enum: ['achieved', 'in_progress', 'missed'], default: 'in_progress' }
    },
    monthly: {
      target: { type: Number, default: 20 },
      achieved: { type: Number, default: 0 },
      status: { type: String, enum: ['achieved', 'in_progress', 'missed'], default: 'in_progress' }
    }
  }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas eficientes
wellnessMetricsSchema.index({ userId: 1, period: 1, date: -1 });

export const WellnessMetrics = mongoose.model('WellnessMetrics', wellnessMetricsSchema); 