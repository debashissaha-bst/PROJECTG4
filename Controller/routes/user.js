const express = require('express')
const { loginUser, signupUser, getProfile, updateProfile } = require('../controllers/userController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.post('/login', loginUser)
router.post('/signup', signupUser)

router.use(requireAuth)
router.get('/profile', getProfile)
router.patch('/profile', updateProfile)

module.exports = router
