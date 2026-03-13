const express = require('express')
const { chatWithAI } = require('../controllers/chatController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()
router.use(requireAuth)

router.post('/', chatWithAI)

module.exports = router
