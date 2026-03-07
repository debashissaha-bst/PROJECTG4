const mongoose = require('mongoose')

const Schema = mongoose.Schema

const friendRequestSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
)

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true })

module.exports = mongoose.model('FriendRequest', friendRequestSchema)

