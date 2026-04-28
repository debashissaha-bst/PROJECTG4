const mongoose = require('mongoose')
const Schema = mongoose.Schema
const recipeSchema = new Schema({
  title: { type: String, required: true },
  time: { type: Number, required: true },
  ingredients: [
    {
      name: { type: String, required: true },
      quantity: { type: String, required: true }
    }
  ],
  instructions: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  ownerEmail: { type: String },
  likes: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: false },
  isTrashed: { type: Boolean, default: false },
  trashedAt: { type: Date, default: null },
  user_id: { type: String, required: true }
}, { timestamps: true })
module.exports = mongoose.model('Recipe', recipeSchema)
