const mongoose = require('mongoose')
const Review = require('../../model/models/reviewModel')
const Recipe = require('../../model/models/recipeModel')
const CookSession = require('../../model/models/cookSessionModel')

const addReview = async (req, res) => {
  const { recipeId, comment } = req.body

  if (!recipeId || !mongoose.Types.ObjectId.isValid(recipeId)) {
    return res.status(400).json({ error: 'Valid recipeId is required' })
  }
  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    return res.status(400).json({ error: 'Comment is required' })
  }

  try {
    const user_id = req.user._id

    const cooked = await CookSession.findOne({ user_id, recipe_id: recipeId, status: 'finished' }).select('_id')
    if (!cooked) {
      return res.status(403).json({ error: 'You can only review a recipe after cooking it.' })
    }

    const recipe = await Recipe.findById(recipeId).select('_id')
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }

    const review = await Review.create({
      user_id,
      recipe_id: recipeId,
      comment: comment.trim()
    })

    res.status(201).json(review)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const listReviewsForRecipe = async (req, res) => {
  const { recipeId } = req.params

  if (!mongoose.Types.ObjectId.isValid(recipeId)) {
    return res.status(400).json({ error: 'No such recipe' })
  }

  try {
    const reviews = await Review.find({ recipe_id: recipeId })
      .sort({ createdAt: -1 })
      .select('comment createdAt user_id')
      .lean()

    res.status(200).json(reviews)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  addReview,
  listReviewsForRecipe
}

