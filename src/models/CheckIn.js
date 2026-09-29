import mongoose from 'mongoose';
import { CHECKIN_STATUS, REJECTION_REASONS } from '../config/constants.js';

const checkInSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(CHECKIN_STATUS),
      required: true
    },
    checkedInAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      }
    },
    accuracy: {
      type: Number, // Accuracy in meters reported by device
      required: true
    },
    distance: {
      type: Number, // Calculated distance from meeting location in meters
      required: true
    },
    verificationMethod: {
      type: String,
      default: 'GPS_HAVERSINE'
    },
    rejectionReason: {
      type: String,
      enum: [...Object.values(REJECTION_REASONS), null],
      default: null
    },
    userNotes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters']
    },
    userAgent: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate PRESENT check-ins for the same user and meeting
// Note: Partial index ensures users can retry if a previous attempt was REJECTED due to poor accuracy or outside radius
checkInSchema.index(
  { user: 1, meeting: 1 },
  { unique: true, partialFilterExpression: { status: CHECKIN_STATUS.PRESENT } }
);

checkInSchema.index({ meeting: 1, checkedInAt: -1 });
checkInSchema.index({ user: 1, checkedInAt: -1 });

export const CheckIn = mongoose.model('CheckIn', checkInSchema);
