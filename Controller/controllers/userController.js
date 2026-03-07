const User = require('../../model/models/userModel')
const FriendRequest = require('../../model/models/friendRequestModel')
const jwt = require('jsonwebtoken')

const createToken = (_id) => {
  return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' })
}

const loginUser = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.login(email, password)
    const token = createToken(user._id)
    res.status(200).json({
      email,
      token,
      name: user.name || '',
      dob: user.dob || '',
      gender: user.gender || '',
      city: user.city || '',
      dietaryPreference: user.dietaryPreference || ''
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const signupUser = async (req, res) => {
  const { email, password, name, dob, gender, city, dietaryPreference } = req.body
  try {
    const user = await User.signup(email, password, name, dob, gender, city, dietaryPreference)
    const token = createToken(user._id)
    res.status(200).json({
      email,
      token,
      name: user.name || '',
      dob: user.dob || '',
      gender: user.gender || '',
      city: user.city || '',
      dietaryPreference: user.dietaryPreference || ''
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const updateProfile = async (req, res) => {
  const { name, dob, gender, city, dietaryPreference } = req.body
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, dob, gender, city, dietaryPreference },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getFriendProfile = async (req, res) => {
  const { id } = req.params
  const currentUserId = req.user._id

  try {
    const isFriend = await FriendRequest.findOne({
      status: 'accepted',
      $or: [
        { from: currentUserId, to: id },
        { from: id, to: currentUserId }
      ]
    })

    if (!isFriend && String(currentUserId) !== String(id)) {
      return res.status(403).json({ error: 'You can only view profiles of your friends' })
    }

    const user = await User.findById(id).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = { signupUser, loginUser, getProfile, updateProfile, getFriendProfile }
