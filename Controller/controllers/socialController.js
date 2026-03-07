const User = require('../../model/models/userModel')
const FriendRequest = require('../../model/models/friendRequestModel')
const Message = require('../../model/models/messageModel')
const mongoose = require('mongoose')

// GET /api/social/users - list all other users
const listUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      'email name city dietaryPreference'
    )
    res.status(200).json(users)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// GET /api/social/requests - incoming, outgoing, friends
const listRequestsAndFriends = async (req, res) => {
  try {
    const userId = req.user._id

    const [incoming, outgoing, friends] = await Promise.all([
      FriendRequest.find({ to: userId, status: 'pending' }).populate('from', 'email name'),
      FriendRequest.find({ from: userId, status: 'pending' }).populate('to', 'email name'),
      FriendRequest.find({
        status: 'accepted',
        $or: [{ from: userId }, { to: userId }]
      }).populate('from to', 'email name')
    ])

    res.status(200).json({ incoming, outgoing, friends })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// POST /api/social/requests  { toUserId }
const sendFriendRequest = async (req, res) => {
  const { toUserId } = req.body
  const fromUserId = req.user._id

  if (!toUserId || !mongoose.Types.ObjectId.isValid(toUserId)) {
    return res.status(400).json({ error: 'Invalid recipient user id' })
  }

  if (toUserId === String(fromUserId)) {
    return res.status(400).json({ error: 'Cannot send friend request to yourself' })
  }

  try {
    const existing = await FriendRequest.findOne({
      $or: [
        { from: fromUserId, to: toUserId },
        { from: toUserId, to: fromUserId }
      ]
    })

    if (existing) {
      return res.status(400).json({ error: 'Friend request already exists' })
    }

    const request = await FriendRequest.create({
      from: fromUserId,
      to: toUserId
    })

    res.status(200).json(request)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// PATCH /api/social/requests/:id/accept
const acceptFriendRequest = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid request id' })
  }

  try {
    const request = await FriendRequest.findOneAndUpdate(
      { _id: id, to: req.user._id, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    )

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' })
    }

    res.status(200).json(request)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// DELETE /api/social/friends/:friendId
const unfriend = async (req, res) => {
  const { friendId } = req.params
  const currentUserId = req.user._id

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).json({ error: 'Invalid friend id' })
  }

  try {
    const relation = await FriendRequest.findOneAndDelete({
      status: 'accepted',
      $or: [
        { from: currentUserId, to: friendId },
        { from: friendId, to: currentUserId }
      ]
    })

    if (!relation) {
      return res.status(404).json({ error: 'Friendship not found' })
    }

    res.status(200).json({ message: 'Unfriended successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// helper to check friendship
const ensureFriends = async (currentUserId, otherUserId) => {
  const relation = await FriendRequest.findOne({
    status: 'accepted',
    $or: [
      { from: currentUserId, to: otherUserId },
      { from: otherUserId, to: currentUserId }
    ]
  })
  return !!relation
}

// GET /api/social/messages/:friendId
const getMessages = async (req, res) => {
  const { friendId } = req.params
  const currentUserId = req.user._id

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).json({ error: 'Invalid friend id' })
  }

  try {
    const areFriends = await ensureFriends(currentUserId, friendId)
    if (!areFriends) {
      return res.status(403).json({ error: 'You must be friends to view messages' })
    }

    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: friendId },
        { from: friendId, to: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .lean()

    res.status(200).json(messages)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// POST /api/social/messages/:friendId  { text }
const sendMessage = async (req, res) => {
  const { friendId } = req.params
  const { text } = req.body
  const currentUserId = req.user._id

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).json({ error: 'Invalid friend id' })
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required' })
  }

  try {
    const areFriends = await ensureFriends(currentUserId, friendId)
    if (!areFriends) {
      return res.status(403).json({ error: 'You must be friends to send messages' })
    }

    const message = await Message.create({
      from: currentUserId,
      to: friendId,
      text: text.trim()
    })

    res.status(200).json(message)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  listUsers,
  listRequestsAndFriends,
  sendFriendRequest,
  acceptFriendRequest,
  getMessages,
  sendMessage,
  unfriend
}

