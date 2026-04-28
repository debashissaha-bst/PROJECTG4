const express = require('express')
const {
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
} = require('../controllers/recipeControllers')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// public gallery endpoint (no auth required)
router.get('/public', getPublicRecipes)

// all routes below require auth
router.use(requireAuth)

router.get('/trash', getTrashedRecipes)
router.get('/', getRecipes)
router.get('/:id', getRecipe)
router.post('/', createRecipe)
router.delete('/:id', trashRecipe)
router.patch('/:id/restore', restoreRecipe)
router.delete('/:id/permanent', permanentlyDeleteRecipe)
router.patch('/:id', updateRecipe)
router.patch('/:id/visibility', updateVisibility)
router.post('/:id/like', likeRecipe)

module.exports = router
