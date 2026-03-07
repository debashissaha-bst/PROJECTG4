const Recipe = require('../../model/models/recipeModel')
const User = require('../../model/models/userModel')
const mongoose = require('mongoose')

const getRecipes = async (req, res) => {
  const user_id = req.user._id
  const recipes = await Recipe.find({ user_id }).sort({ createdAt: -1 })
  res.status(200).json(recipes)
}

const getPublicRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ isPublic: true }).sort({ createdAt: -1 })
    res.status(200).json(recipes)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getRecipe = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such recipe'})
  }
  const recipe = await Recipe.findById(id)
  if (!recipe) return res.status(404).json({error: 'No such recipe'})
  res.status(200).json(recipe)
}

const createRecipe = async (req, res) => {
  const { title, time, ingredients, instructions, difficulty, isPublic } = req.body

  let emptyFields = []
  if (!title) emptyFields.push('title')
  if (!time) emptyFields.push('time')

  // ensure we have at least one ingredient with both fields filled
  const validIngredients = Array.isArray(ingredients)
    ? ingredients.filter(
        (ing) =>
          ing &&
          typeof ing.name === 'string' &&
          typeof ing.quantity === 'string' &&
          ing.name.trim() !== '' &&
          ing.quantity.trim() !== ''
      )
    : []

  if (validIngredients.length === 0) {
    emptyFields.push('ingredients')
  }

  if (!instructions) emptyFields.push('instructions')
  if (!difficulty) emptyFields.push('difficulty')

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all fields', emptyFields })
  }

  try {
    const user_id = req.user._id
    const owner = await User.findById(user_id).select('email')
    const recipe = await Recipe.create({
      title,
      time,
      ingredients: validIngredients,
      instructions,
      difficulty,
      ownerEmail: owner ? owner.email : '',
      isPublic: !!isPublic,
      user_id
    })
    res.status(200).json(recipe)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const deleteRecipe = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'No such recipe'})
  }
  const recipe = await Recipe.findOneAndDelete({_id: id})
  if (!recipe) return res.status(400).json({error: 'No such recipe'})
  res.status(200).json(recipe)
}

const updateRecipe = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'No such recipe'})
  }
  const recipe = await Recipe.findOneAndUpdate({_id: id}, { ...req.body }, { new: true })
  if (!recipe) return res.status(400).json({error: 'No such recipe'})
  res.status(200).json(recipe)
}

const updateVisibility = async (req, res) => {
  const { id } = req.params
  const { isPublic } = req.body

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No such recipe' })
  }

  try {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: id, user_id: String(req.user._id) },
      { isPublic: !!isPublic },
      { new: true }
    )

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found or not owned by user' })
    }

    res.status(200).json(recipe)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const likeRecipe = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No such recipe' })
  }

  try {
    const recipe = await Recipe.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    )

    if (!recipe) {
      return res.status(404).json({ error: 'No such recipe' })
    }

    res.status(200).json(recipe)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  getRecipes,
  getRecipe,
  createRecipe,
  deleteRecipe,
  updateRecipe,
  getPublicRecipes,
  updateVisibility,
  likeRecipe
}
