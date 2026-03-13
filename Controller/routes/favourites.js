const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {
  listFavourites,
  addFavourite,
  removeFavourite
} = require('../controllers/favouriteController')

const router = express.Router()

router.use(requireAuth)

router.get('/', listFavourites)
router.post('/', addFavourite)
router.delete('/:recipeId', removeFavourite)

module.exports = router

