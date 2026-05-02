const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userChallengeSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    challenge_id: { type: Schema.Types.ObjectId, ref: 'CookingChallenge', required: true },
    status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },

    // Progress model for daily streaks
    lastCookedDayKey: { type: String }, // YYYY-MM-DD (UTC)
    streakDays: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
)

userChallengeSchema.index({ user_id: 1, challenge_id: 1 }, { unique: true })
userChallengeSchema.index({ user_id: 1, status: 1, startedAt: -1 })

module.exports = mongoose.model('UserChallenge', userChallengeSchema)

