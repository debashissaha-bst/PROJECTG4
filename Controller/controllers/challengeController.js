const CookingChallenge = require('../../model/models/cookingChallengeModel')
const UserChallenge = require('../../model/models/userChallengeModel')
const Badge = require('../../model/models/badgeModel')
const UserBadge = require('../../model/models/userBadgeModel')
const User = require('../../model/models/userModel')
const Recipe = require('../../model/models/recipeModel')
const FriendRequest = require('../../model/models/friendRequestModel')
const { BADGE_DEFS } = require('../utils/badges')

const CHALLENGE_SEED = [
  {
    code: 'daily-streak-3',
    title: '3-Day Cooking Challenge',
    description: 'Cook at least one recipe per day for 3 days.',
    durationDays: 3,
    type: 'daily_cook_streak',
    rewardPoints: 15
  },
  {
    code: 'daily-streak-7',
    title: '7-Day Cooking Challenge',
    description: 'Cook at least one recipe per day for 7 days.',
    durationDays: 7,
    type: 'daily_cook_streak',
    rewardPoints: 40
  },
  {
    code: 'daily-streak-14',
    title: '14-Day Cooking Challenge',
    description: 'Cook at least one recipe per day for 14 days.',
    durationDays: 14,
    type: 'daily_cook_streak',
    rewardPoints: 90
  }
]

const BADGE_SEED = BADGE_DEFS

async function ensureSeeded() {
  // Challenges
  const existingChallenges = await CookingChallenge.find({ code: { $in: CHALLENGE_SEED.map((c) => c.code) } })
    .select('code')
    .lean()
  const existingChallengeCodes = new Set(existingChallenges.map((c) => c.code))
  const missingChallenges = CHALLENGE_SEED.filter((c) => !existingChallengeCodes.has(c.code))
  if (missingChallenges.length) {
    await CookingChallenge.insertMany(missingChallenges, { ordered: false })
  }

  // Badges
  const existingBadges = await Badge.find({ code: { $in: BADGE_SEED.map((b) => b.code) } })
    .select('code')
    .lean()
  const existingBadgeCodes = new Set(existingBadges.map((b) => b.code))
  const missingBadges = BADGE_SEED.filter((b) => !existingBadgeCodes.has(b.code))
  if (missingBadges.length) {
    await Badge.insertMany(missingBadges, { ordered: false })
  }
}

const listChallenges = async (req, res) => {
  try {
    await ensureSeeded()

    const user_id = req.user._id
    const [challenges, myChallenges] = await Promise.all([
      CookingChallenge.find({ isActive: true }).sort({ durationDays: 1 }).lean(),
      UserChallenge.find({ user_id }).select('challenge_id status startedAt completedAt streakDays lastCookedDayKey').lean()
    ])

    const mineByChallengeId = new Map(myChallenges.map((uc) => [String(uc.challenge_id), uc]))

    res.status(200).json(
      challenges.map((c) => {
        const mine = mineByChallengeId.get(String(c._id)) || null
        return {
          ...c,
          my: mine
            ? {
                status: mine.status,
                startedAt: mine.startedAt,
                completedAt: mine.completedAt,
                streakDays: mine.streakDays || 0,
                lastCookedDayKey: mine.lastCookedDayKey || null
              }
            : null
        }
      })
    )
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const joinChallengeByCode = async (req, res) => {
  const { code } = req.params
  if (!code) return res.status(400).json({ error: 'Challenge code is required' })

  try {
    await ensureSeeded()

    const challenge = await CookingChallenge.findOne({ code, isActive: true })
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' })

    const user_id = req.user._id
    const existing = await UserChallenge.findOne({ user_id, challenge_id: challenge._id })
    if (existing) {
      return res.status(200).json(existing)
    }

    const created = await UserChallenge.create({
      user_id,
      challenge_id: challenge._id,
      status: 'active',
      startedAt: new Date(),
      streakDays: 0
    })

    res.status(201).json(created)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const quitChallengeByCode = async (req, res) => {
  const { code } = req.params
  if (!code) return res.status(400).json({ error: 'Challenge code is required' })

  try {
    await ensureSeeded()

    const challenge = await CookingChallenge.findOne({ code, isActive: true })
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' })

    const user_id = req.user._id
    const deleted = await UserChallenge.findOneAndDelete({ user_id, challenge_id: challenge._id, status: 'active' })

    if (!deleted) {
      return res.status(404).json({ error: 'Active challenge not found' })
    }

    res.status(200).json({ message: 'Challenge quit successfully' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getMyChallenges = async (req, res) => {
  try {
    await ensureSeeded()
    const user_id = req.user._id
    const rows = await UserChallenge.find({ user_id })
      .populate('challenge_id')
      .sort({ createdAt: -1 })
      .lean()

    res.status(200).json(
      rows.map((uc) => ({
        _id: uc._id,
        status: uc.status,
        startedAt: uc.startedAt,
        completedAt: uc.completedAt || null,
        streakDays: uc.streakDays || 0,
        lastCookedDayKey: uc.lastCookedDayKey || null,
        challenge: uc.challenge_id
      }))
    )
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getMyBadges = async (req, res) => {
  try {
    await ensureSeeded()
    const user_id = req.user._id
    const rows = await UserBadge.find({ user_id })
      .populate('badge_id')
      .sort({ awardedAt: -1, createdAt: -1 })
      .lean()

    res.status(200).json(
      rows
        .filter((r) => r.badge_id)
        .map((r) => ({
          _id: r._id,
          awardedAt: r.awardedAt || r.createdAt,
          badge: r.badge_id
        }))
    )
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getBadgeCatalog = async (req, res) => {
  try {
    await ensureSeeded()

    const user_id = req.user._id
    const user = await User.findById(user_id).select('recipesCookedCount recipesSharedCount').lean()
    if (!user) return res.status(404).json({ error: 'User not found' })

    const likeAgg = await Recipe.aggregate([
      { $match: { user_id: String(user_id) } },
      { $group: { _id: null, totalLikes: { $sum: { $ifNull: ['$likes', 0] } } } }
    ])
    const likesReceived = likeAgg.length ? Number(likeAgg[0].totalLikes || 0) : 0

    const friendsCount = await FriendRequest.countDocuments({
      status: 'accepted',
      $or: [{ from: user_id }, { to: user_id }]
    })

    const awarded = await UserBadge.find({ user_id }).select('badge_id').lean()
    const awardedSet = new Set(awarded.map((r) => String(r.badge_id)))

    const badges = await Badge.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean()

    const getCurrent = (badge) => {
      switch (badge.metric) {
        case 'cook_count':
          return Number(user.recipesCookedCount || 0)
        case 'share_count':
          return Number(user.recipesSharedCount || 0)
        case 'likes_received':
          return likesReceived
        case 'friend_count':
          return friendsCount
        default:
          return awardedSet.has(String(badge._id)) ? 1 : 0
      }
    }

    const catalog = badges.map((b) => {
      const current = getCurrent(b)
      const target = Number(b.target || 0) || 0
      const progressPct = target > 0 ? Math.min(100, Math.round((Math.min(current, target) / target) * 100)) : (awardedSet.has(String(b._id)) ? 100 : 0)
      return {
        _id: b._id,
        code: b.code,
        name: b.name,
        description: b.description,
        icon: b.icon,
        metric: b.metric,
        target,
        current,
        progressPct,
        isAwarded: awardedSet.has(String(b._id))
      }
    })

    res.status(200).json(catalog)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  listChallenges,
  joinChallengeByCode,
  quitChallengeByCode,
  getMyChallenges,
  getMyBadges,
  getBadgeCatalog
}

