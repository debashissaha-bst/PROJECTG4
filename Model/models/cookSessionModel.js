const mongoose = require('mongoose')

const Schema = mongoose.Schema

const cookSessionSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipe_id: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    durationSeconds: { type: Number, required: true },
    status: { type: String, enum: ['active', 'finished'], default: 'active' },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date }
  },
  { timestamps: true }
)

cookSessionSchema.index({ user_id: 1, status: 1, startedAt: -1 })

module.exports = mongoose.model('CookSession', cookSessionSchema)

