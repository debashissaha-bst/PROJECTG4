const Recipe = require('../../model/models/recipeModel')
const mongoose = require('mongoose')

const getRecipes = async (req, res) => {
  const user_id = req.user._id
  const recipes = await Recipe.find({user_id}).sort({createdAt: -1})
  res.status(200).json(recipes)
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
  const { title, time, ingredients, instructions, difficulty } = req.body

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
    const recipe = await Recipe.create({
      title,
      time,
      ingredients: validIngredients,
      instructions,
      difficulty,
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
  const recipe = await Recipe.findOneAndUpdate({_id: id}, { ...req.body })
  if (!recipe) return res.status(400).json({error: 'No such recipe'})
  res.status(200).json(recipe)
}

module.exports = {
  getRecipes,
  getRecipe,
  createRecipe,
  deleteRecipe,
  updateRecipe
}
