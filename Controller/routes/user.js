const express = require('express')
const { loginUser, signupUser, getProfile, updateProfile, getFriendProfile, getProgress, getLeaderboard } = require('../controllers/userController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.post('/login', loginUser)
router.post('/signup', signupUser)

router.use(requireAuth)
router.get('/profile', getProfile)
router.get('/profile/:id', getFriendProfile)
router.patch('/profile', updateProfile)
router.get('/progress', getProgress)
router.get('/leaderboard', getLeaderboard)

module.exports = router
