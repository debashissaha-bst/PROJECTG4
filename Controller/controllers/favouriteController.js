const mongoose = require('mongoose')
const Favourite = require('../../model/models/favouriteModel')
const Recipe = require('../../model/models/recipeModel')

const listFavourites = async (req, res) => {
  try {
    const user_id = req.user._id
    const favourites = await Favourite.find({ user_id })
      .sort({ createdAt: -1 })
      .populate('recipe_id')

    const result = favourites
      .filter((f) => !!f.recipe_id)
      .map((f) => ({
        _id: f._id,
        recipe: f.recipe_id,
        createdAt: f.createdAt
      }))

    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const addFavourite = async (req, res) => {
  const { recipeId } = req.body

  if (!recipeId || !mongoose.Types.ObjectId.isValid(recipeId)) {
    return res.status(400).json({ error: 'Valid recipeId is required' })
  }

  try {
    const user_id = req.user._id

    const recipe = await Recipe.findById(recipeId).select('_id')
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }

    const existing = await Favourite.findOne({ user_id, recipe_id: recipeId })
    if (existing) {
      return res.status(200).json(existing)
    }

    const favourite = await Favourite.create({ user_id, recipe_id: recipeId })
    res.status(201).json(favourite)
  } catch (error) {
    if (error && error.code === 11000) {
      const favourite = await Favourite.findOne({ user_id: req.user._id, recipe_id: recipeId })
      return res.status(200).json(favourite)
    }
    res.status(400).json({ error: error.message })
  }
}

const removeFavourite = async (req, res) => {
  const { recipeId } = req.params

  if (!mongoose.Types.ObjectId.isValid(recipeId)) {
    return res.status(400).json({ error: 'No such recipe' })
  }

  try {
    const user_id = req.user._id
    const deleted = await Favourite.findOneAndDelete({ user_id, recipe_id: recipeId })
    if (!deleted) {
      return res.status(404).json({ error: 'Favourite not found' })
    }
    res.status(200).json(deleted)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  listFavourites,
  addFavourite,
  removeFavourite
}

