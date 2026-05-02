const mongoose = require('mongoose')

const Schema = mongoose.Schema

const cookingChallengeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true, min: 1 },
    type: {
      type: String,
      enum: ['daily_cook_streak'],
      default: 'daily_cook_streak'
    },
    isActive: { type: Boolean, default: true },
    rewardPoints: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
)

cookingChallengeSchema.index({ isActive: 1, durationDays: 1 })

module.exports = mongoose.model('CookingChallenge', cookingChallengeSchema)

