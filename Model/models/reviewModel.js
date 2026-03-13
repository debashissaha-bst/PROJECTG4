const mongoose = require('mongoose')

const Schema = mongoose.Schema

const reviewSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipe_id: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    comment: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
)

reviewSchema.index({ recipe_id: 1, createdAt: -1 })

module.exports = mongoose.model('Review', reviewSchema)

