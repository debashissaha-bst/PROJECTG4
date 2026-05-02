const mongoose = require('mongoose')

const Schema = mongoose.Schema

const badgeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, default: '🏅' },
    metric: {
      type: String,
      enum: ['cook_count', 'share_count', 'likes_received', 'friend_count', 'challenge'],
      default: 'challenge'
    },
    target: { type: Number, default: 0, min: 0 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

badgeSchema.index({ isActive: 1 })

module.exports = mongoose.model('Badge', badgeSchema)

