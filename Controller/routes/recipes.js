const express = require('express')
const {
  getRecipes,
  getRecipe,
  createRecipe,
  deleteRecipe,
  updateRecipe
} = require('../controllers/recipeControllers')
const requireAuth = require('../middleware/requireAuth')
const router = express.Router()
router.use(requireAuth)
router.get('/', getRecipes)
router.get('/:id', getRecipe)
router.post('/', createRecipe)
router.delete('/:id', deleteRecipe)
router.patch('/:id', updateRecipe)
module.exports = router
