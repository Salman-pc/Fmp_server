import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Game title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['MULTIPLAYER', 'SINGLEPLAYER'],
      default: 'SINGLEPLAYER'
    },
    enabled: {
      type: Boolean,
      default: true
    },
    maxPlayers: {
      type: Number,
      default: 4
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

gameSchema.index({ enabled: 1 });

export const Game = mongoose.model('Game', gameSchema);
