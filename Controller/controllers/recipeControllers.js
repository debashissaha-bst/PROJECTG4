const Recipe = require('../../model/models/recipeModel')
const User = require('../../model/models/userModel')
const Like = require('../../model/models/likeModel')
const mongoose = require('mongoose')

const getRecipes = async (req, res) => {
  const user_id = req.user._id
  const rawSearch = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const query = { user_id, isTrashed: { $ne: true } }

  if (rawSearch) {
    query.$or = [
      { title: { $regex: rawSearch, $options: 'i' } },
      { 'ingredients.name': { $regex: rawSearch, $options: 'i' } }
    ]
  }

  const recipes = await Recipe.find(query).sort({ createdAt: -1 })
  res.status(200).json(recipes)
}

const getPublicRecipes = async (req, res) => {
  try {
    const rawSearch = typeof req.query.search === 'string' ? req.query.search.trim() : ''
    const query = { isPublic: true, isTrashed: { $ne: true } }

    if (rawSearch) {
      query.$or = [
        { title: { $regex: rawSearch, $options: 'i' } },
        { 'ingredients.name': { $regex: rawSearch, $options: 'i' } }
      ]
    }

    const recipes = await Recipe.find(query).sort({ createdAt: -1 })
    res.status(200).json(recipes)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getTrashedRecipes = async (req, res) => {
  const user_id = req.user._id
  const recipes = await Recipe.find({ user_id, isTrashed: true }).sort({ trashedAt: -1, updatedAt: -1 })
  res.status(200).json(recipes)
}

const getRecipe = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'No such recipe'})
  }
  const recipe = await Recipe.findById(id)
  if (!recipe) return res.status(404).json({error: 'No such recipe'})
  if (recipe.isTrashed) return res.status(404).json({ error: 'No such recipe' })
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

    // award points for sharing a new recipe
    await User.findByIdAndUpdate(
      user_id,
      {
        $inc: {
          points: 10,
          recipesSharedCount: 1
        }
      },
      { new: false }
    )

    res.status(200).json(recipe)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const trashRecipe = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'No such recipe'})
  }
  const recipe = await Recipe.findOneAndUpdate(
    { _id: id, user_id: String(req.user._id) },
    { isTrashed: true, trashedAt: new Date(), isPublic: false },
    { new: true }
  )
  if (!recipe) return res.status(400).json({error: 'No such recipe'})
  res.status(200).json(recipe)
}

const restoreRecipe = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No such recipe' })
  }

  const recipe = await Recipe.findOneAndUpdate(
    { _id: id, user_id: String(req.user._id), isTrashed: true },
    { isTrashed: false, trashedAt: null },
    { new: true }
  )
  if (!recipe) return res.status(404).json({ error: 'Recipe not found in trash' })
  res.status(200).json(recipe)
}

const permanentlyDeleteRecipe = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No such recipe' })
  }

  const recipe = await Recipe.findOneAndDelete({ _id: id, user_id: String(req.user._id), isTrashed: true })
  if (!recipe) return res.status(404).json({ error: 'Recipe not found in trash' })
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
    const user_id = req.user._id

    const existing = await Like.findOne({ user_id, recipe_id: id }).select('_id')
    if (existing) {
      return res.status(400).json({ error: 'You have already liked this recipe' })
    }

    const like = await Like.create({ user_id, recipe_id: id })

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
  trashRecipe,
  getTrashedRecipes,
  restoreRecipe,
  permanentlyDeleteRecipe,
  updateRecipe,
  getPublicRecipes,
  updateVisibility,
  likeRecipe
}
