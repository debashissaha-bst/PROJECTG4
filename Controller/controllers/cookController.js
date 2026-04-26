const mongoose = require('mongoose')
const CookSession = require('../../model/models/cookSessionModel')
const Recipe = require('../../model/models/recipeModel')
const User = require('../../model/models/userModel')
const Review = require('../../model/models/reviewModel')

const startCooking = async (req, res) => {
  const { recipeId } = req.body

  if (!recipeId || !mongoose.Types.ObjectId.isValid(recipeId)) {
    return res.status(400).json({ error: 'Valid recipeId is required' })
  }

  try {
    const user_id = req.user._id

    const existingActive = await CookSession.findOne({ user_id, status: 'active' }).sort({ createdAt: -1 })
    if (existingActive) {
      return res.status(409).json({ error: 'You already have an active cooking session. Finish it first.' })
    }

    const recipe = await Recipe.findById(recipeId).select('time title')
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }

    const minutes = Number(recipe.time)
    const durationSeconds = Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes * 60) : 0
    if (!durationSeconds) {
      return res.status(400).json({ error: 'Recipe time is invalid' })
    }

    const session = await CookSession.create({
      user_id,
      recipe_id: recipe._id,
      durationSeconds,
      status: 'active',
      startedAt: new Date()
    })

    res.status(201).json(session)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getActiveCooking = async (req, res) => {
  try {
    const user_id = req.user._id
    const session = await CookSession.findOne({ user_id, status: 'active' })
      .sort({ createdAt: -1 })
      .populate('recipe_id')

    if (!session) return res.status(200).json(null)

    res.status(200).json({
      _id: session._id,
      recipe: session.recipe_id,
      durationSeconds: session.durationSeconds,
      startedAt: session.startedAt,
      status: session.status
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const finishCooking = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No such cooking session' })
  }

  try {
    const user_id = req.user._id
    const session = await CookSession.findOneAndUpdate(
      { _id: id, user_id, status: 'active' },
      { status: 'finished', finishedAt: new Date() },
      { new: true }
    )

    if (!session) {
      return res.status(404).json({ error: 'Active cooking session not found' })
    }

    // award points for cooking a recipe
    await User.findByIdAndUpdate(
      user_id,
      {
        $inc: {
          points: 5,
          recipesCookedCount: 1
        }
      },
      { new: false }
    )

    res.status(200).json(session)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getCookedRecipeIds = async (req, res) => {
  try {
    const user_id = req.user._id
    const rows = await CookSession.find({ user_id, status: 'finished' }).select('recipe_id').lean()
    const cookedRecipeIds = [...new Set(rows.map((r) => String(r.recipe_id)))]
    res.status(200).json({ cookedRecipeIds })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getCookingHistory = async (req, res) => {
  try {
    const user_id = req.user._id

    const sessions = await CookSession.find({ user_id, status: 'finished' })
      .sort({ finishedAt: -1, createdAt: -1 })
      .populate('recipe_id', 'title')
      .lean()

    if (!sessions.length) {
      return res.status(200).json([])
    }

    const history = await Promise.all(
      sessions.map(async (session) => {
        const latestReview = await Review.findOne({
          user_id,
          recipe_id: session.recipe_id?._id || session.recipe_id
        })
          .sort({ createdAt: -1 })
          .select('comment createdAt')
          .lean()

        return {
          sessionId: session._id,
          recipeId: session.recipe_id?._id || null,
          recipeTitle: session.recipe_id?.title || 'Unknown recipe',
          cookedAt: session.finishedAt || session.updatedAt || session.createdAt,
          review: latestReview
            ? {
                comment: latestReview.comment,
                reviewedAt: latestReview.createdAt
              }
            : null
        }
      })
    )

    res.status(200).json(history)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  startCooking,
  getActiveCooking,
  finishCooking,
  getCookedRecipeIds,
  getCookingHistory
}

