import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    condition: {
      type: String, // e.g. "WIN_5_GAMES", "FIRST_CHECKIN", "PERFECT_ATTENDANCE"
      required: true
    },
    icon: {
      type: String,
      default: '🏆'
    },
    points: {
      type: Number,
      default: 50
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Achievement = mongoose.model('Achievement', achievementSchema);
