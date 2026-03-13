const mongoose = require('mongoose')

const Schema = mongoose.Schema

const favouriteSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipe_id: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true }
  },
  { timestamps: true }
)

favouriteSchema.index({ user_id: 1, recipe_id: 1 }, { unique: true })

module.exports = mongoose.model('Favourite', favouriteSchema)

