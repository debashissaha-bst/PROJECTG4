const mongoose = require('mongoose')

const Schema = mongoose.Schema

const recipeSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  ingredients: {
    type: Number,
    required: true
  },
  time: {
    type: Number,
    required: true
  },
  user_id: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Recipe', recipeSchema)