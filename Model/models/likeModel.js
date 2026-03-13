const mongoose = require('mongoose')

const Schema = mongoose.Schema

const likeSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipe_id: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true }
  },
  { timestamps: true }
)

likeSchema.index({ user_id: 1, recipe_id: 1 }, { unique: true })

module.exports = mongoose.model('Like', likeSchema)

