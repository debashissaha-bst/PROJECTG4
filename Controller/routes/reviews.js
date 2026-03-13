const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { addReview, listReviewsForRecipe } = require('../controllers/reviewController')

const router = express.Router()

router.get('/:recipeId', listReviewsForRecipe)

router.use(requireAuth)
router.post('/', addReview)

module.exports = router

