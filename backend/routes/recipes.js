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


// all recipe routes require auth 
router.use(requireAuth)

// get all recipes
router.get('/', getRecipes)

// get a single recipe
router.get('/:id', getRecipe)

// post a new recipe
router.post('/', createRecipe)

// delete a recipe
router.delete('/:id', deleteRecipe)

// update a recipe
router.patch('/:id', updateRecipe)



module.exports = router