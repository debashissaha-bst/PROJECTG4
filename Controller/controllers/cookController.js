const mongoose = require('mongoose')
const CookSession = require('../../model/models/cookSessionModel')
const Recipe = require('../../model/models/recipeModel')
const User = require('../../model/models/userModel')
const Review = require('../../model/models/reviewModel')
const CookingChallenge = require('../../model/models/cookingChallengeModel')
const UserChallenge = require('../../model/models/userChallengeModel')
const { awardBadgeOnce } = require('../utils/badges')

function utcDayKey(date) {
  return new Date(date).toISOString().slice(0, 10) // YYYY-MM-DD
}

function dayKeyToUtcMs(dayKey) {
  // dayKey: YYYY-MM-DD
  return Date.parse(`${dayKey}T00:00:00.000Z`)
}

async function awardMilestoneBadgesForUser(user) {
  if (!user) return
  const user_id = user._id
  const cooked = Number(user.recipesCookedCount || 0)

  if (cooked >= 1) await awardBadgeOnce({ user_id, badgeCode: 'badge-cook-1' })
  if (cooked >= 5) await awardBadgeOnce({ user_id, badgeCode: 'badge-cook-5' })
  if (cooked >= 10) await awardBadgeOnce({ user_id, badgeCode: 'badge-cook-10' })
  if (cooked >= 100) await awardBadgeOnce({ user_id, badgeCode: 'badge-cook-100' })
}

async function progressDailyStreakChallenges({ user_id, cookedAt }) {
  const dayKey = utcDayKey(cookedAt)
  const todayMs = dayKeyToUtcMs(dayKey)
  const yesterdayKey = utcDayKey(new Date(todayMs - 24 * 60 * 60 * 1000))

  const activeRows = await UserChallenge.find({ user_id, status: 'active' }).lean()
  if (!activeRows.length) return

  const challengeIds = [...new Set(activeRows.map((r) => String(r.challenge_id)))]
  const challenges = await CookingChallenge.find({ _id: { $in: challengeIds }, isActive: true }).lean()
  const challengeById = new Map(challenges.map((c) => [String(c._id), c]))

  for (const row of activeRows) {
    const challenge = challengeById.get(String(row.challenge_id))
    if (!challenge) continue
    if (challenge.type !== 'daily_cook_streak') continue

    // Only count 1 cook per day for streak purposes
    if (row.lastCookedDayKey === dayKey) continue

    const nextStreak =
      !row.lastCookedDayKey
        ? 1
        : row.lastCookedDayKey === yesterdayKey
          ? (row.streakDays || 0) + 1
          : 1

    const isCompleted = nextStreak >= Number(challenge.durationDays || 1)

    const update = {
      lastCookedDayKey: dayKey,
      streakDays: nextStreak,
      status: isCompleted ? 'completed' : 'active'
    }
    if (isCompleted) {
      update.completedAt = new Date(cookedAt)
    }

    await UserChallenge.findByIdAndUpdate(row._id, update, { new: false })

    if (isCompleted) {
      // award bonus points
      const rewardPoints = Number(challenge.rewardPoints || 0)
      if (rewardPoints > 0) {
        await User.findByIdAndUpdate(user_id, { $inc: { points: rewardPoints } }, { new: false })
      }

      // award badge
      const badgeCode =
        challenge.durationDays === 3
          ? 'badge-streak-3'
          : challenge.durationDays === 7
            ? 'badge-streak-7'
            : null

      if (badgeCode) {
        await awardBadgeOnce({ user_id, badgeCode })
      }
    }
  }
}

const startCooking = async (req, res) => {
  const { recipeId } = req.body

  if (!recipeId || !mongoose.Types.ObjectId.isValid(recipeId)) {
    return res.status(400).json({ error: 'Valid recipeId is required' })
  }

  try {
    const user_id = req.user._id

    const existingActive = await CookSession.findOne({ user_id, status: 'active' }).sort({ createdAt: -1 })
    if (existingActive) {
      return res.status(409).json({ error: 'You already have an active cooking session. Finish it first.' })
    }

    const recipe = await Recipe.findById(recipeId).select('time title')
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }

    const minutes = Number(recipe.time)
    const durationSeconds = Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes * 60) : 0
    if (!durationSeconds) {
      return res.status(400).json({ error: 'Recipe time is invalid' })
    }

    const session = await CookSession.create({
      user_id,
      recipe_id: recipe._id,
      durationSeconds,
      status: 'active',
      startedAt: new Date()
    })

    res.status(201).json(session)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getActiveCooking = async (req, res) => {
  try {
    const user_id = req.user._id
    const session = await CookSession.findOne({ user_id, status: 'active' })
      .sort({ createdAt: -1 })
      .populate('recipe_id')

    if (!session) return res.status(200).json(null)

    res.status(200).json({
      _id: session._id,
      recipe: session.recipe_id,
      durationSeconds: session.durationSeconds,
      startedAt: session.startedAt,
      status: session.status
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const finishCooking = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'No such cooking session' })
  }

  try {
    const user_id = req.user._id
    const session = await CookSession.findOneAndUpdate(
      { _id: id, user_id, status: 'active' },
      { status: 'finished', finishedAt: new Date() },
      { new: true }
    )

    if (!session) {
      return res.status(404).json({ error: 'Active cooking session not found' })
    }

    // award points for cooking a recipe
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      {
        $inc: {
          points: 5,
          recipesCookedCount: 1
        }
      },
      { new: true }
    )

    await awardMilestoneBadgesForUser(updatedUser)

    // progress any active cooking challenges based on this finished cook
    const cookedAt = session.finishedAt || new Date()
    await progressDailyStreakChallenges({ user_id, cookedAt })

    res.status(200).json(session)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getCookedRecipeIds = async (req, res) => {
  try {
    const user_id = req.user._id
    const rows = await CookSession.find({ user_id, status: 'finished' }).select('recipe_id').lean()
    const cookedRecipeIds = [...new Set(rows.map((r) => String(r.recipe_id)))]
    res.status(200).json({ cookedRecipeIds })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getCookingHistory = async (req, res) => {
  try {
    const user_id = req.user._id

    const sessions = await CookSession.find({ user_id, status: 'finished' })
      .sort({ finishedAt: -1, createdAt: -1 })
      .populate('recipe_id', 'title')
      .lean()

    const validSessions = sessions.filter((s) => s.recipe_id && s.recipe_id.title)

    if (!validSessions.length) {
      return res.status(200).json([])
    }

    const history = await Promise.all(
      validSessions.map(async (session) => {
        const latestReview = await Review.findOne({
          user_id,
          recipe_id: session.recipe_id?._id || session.recipe_id
        })
          .sort({ createdAt: -1 })
          .select('comment createdAt')
          .lean()

        return {
          sessionId: session._id,
          recipeId: session.recipe_id?._id || null,
          recipeTitle: session.recipe_id?.title || '',
          cookedAt: session.finishedAt || session.updatedAt || session.createdAt,
          review: latestReview
            ? {
                comment: latestReview.comment,
                reviewedAt: latestReview.createdAt
              }
            : null
        }
      })
    )

    res.status(200).json(history)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  startCooking,
  getActiveCooking,
  finishCooking,
  getCookedRecipeIds,
  getCookingHistory
}

