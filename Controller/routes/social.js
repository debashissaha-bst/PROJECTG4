const express = require('express')
const {
  listUsers,
  listRequestsAndFriends,
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  getMessages,
  sendMessage,
  unfriend
} = require('../controllers/socialController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.use(requireAuth)

router.get('/users', listUsers)
router.get('/requests', listRequestsAndFriends)
router.post('/requests', sendFriendRequest)
router.patch('/requests/:id/accept', acceptFriendRequest)
router.delete('/requests/:id', cancelFriendRequest)
router.get('/messages/:friendId', getMessages)
router.post('/messages/:friendId', sendMessage)
router.delete('/friends/:friendId', unfriend)

module.exports = router

