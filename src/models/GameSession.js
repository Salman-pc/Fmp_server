import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true
    },
    players: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number, default: 0 },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    status: {
      type: String,
      enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'WAITING'
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: Date,
    endedAt: Date
  },
  {
    timestamps: true
  }
);

gameSessionSchema.index({ game: 1, status: 1 });

export const GameSession = mongoose.model('GameSession', gameSessionSchema);
