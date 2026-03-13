const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {
  startCooking,
  getActiveCooking,
  finishCooking,
  getCookedRecipeIds
} = require('../controllers/cookController')

const router = express.Router()

router.use(requireAuth)

router.get('/active', getActiveCooking)
router.get('/cooked-ids', getCookedRecipeIds)
router.post('/start', startCooking)
router.patch('/:id/finish', finishCooking)

module.exports = router

