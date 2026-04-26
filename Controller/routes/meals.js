const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const { getPersonalizedMeals } = require('../controllers/mealController')

const router = express.Router()

router.use(requireAuth)
router.post('/personalized', getPersonalizedMeals)

module.exports = router
