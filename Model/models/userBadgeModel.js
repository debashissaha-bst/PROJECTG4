const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userBadgeSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    badge_id: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
    awardedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

userBadgeSchema.index({ user_id: 1, badge_id: 1 }, { unique: true })
userBadgeSchema.index({ user_id: 1, awardedAt: -1 })

module.exports = mongoose.model('UserBadge', userBadgeSchema)

