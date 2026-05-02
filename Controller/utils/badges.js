const Badge = require('../../model/models/badgeModel')
const UserBadge = require('../../model/models/userBadgeModel')

const BADGE_DEFS = [
  // challenge badges
  {
    code: 'badge-streak-3',
    name: '3-Day Streak',
    description: 'Completed the 3-Day Cooking Challenge.',
    icon: '🥉',
    metric: 'challenge',
    target: 3,
    sortOrder: 10
  },
  {
    code: 'badge-streak-7',
    name: '7-Day Streak',
    description: 'Completed the 7-Day Cooking Challenge.',
    icon: '🥇',
    metric: 'challenge',
    target: 7,
    sortOrder: 11
  },
  {
    code: 'badge-streak-14',
    name: '14-Day Streak',
    description: 'Completed the 14-Day Cooking Challenge.',
    icon: '🏅',
    metric: 'challenge',
    target: 14,
    sortOrder: 12
  },

  // cook count badges
  { code: 'badge-cook-1', name: 'Cooked 1 Recipe', description: 'Cooked 1 recipe in total.', icon: '🍳', metric: 'cook_count', target: 1, sortOrder: 20 },
  { code: 'badge-cook-5', name: 'Cooked 5 Recipes', description: 'Cooked 5 recipes in total.', icon: '🍳', metric: 'cook_count', target: 5, sortOrder: 21 },
  { code: 'badge-cook-10', name: 'Cooked 10 Recipes', description: 'Cooked 10 recipes in total.', icon: '👨‍🍳', metric: 'cook_count', target: 10, sortOrder: 22 },
  { code: 'badge-cook-100', name: 'Cooked 100 Recipes', description: 'Cooked 100 recipes in total.', icon: '🏆', metric: 'cook_count', target: 100, sortOrder: 23 },

  // share count badges
  { code: 'badge-share-1', name: 'Shared 1 Recipe', description: 'Shared 1 recipe with the community.', icon: '📤', metric: 'share_count', target: 1, sortOrder: 30 },
  { code: 'badge-share-5', name: 'Shared 5 Recipes', description: 'Shared 5 recipes with the community.', icon: '📤', metric: 'share_count', target: 5, sortOrder: 31 },
  { code: 'badge-share-10', name: 'Shared 10 Recipes', description: 'Shared 10 recipes with the community.', icon: '🌟', metric: 'share_count', target: 10, sortOrder: 32 },
  { code: 'badge-share-100', name: 'Shared 100 Recipes', description: 'Shared 100 recipes with the community.', icon: '🏆', metric: 'share_count', target: 100, sortOrder: 33 },

  // likes received badges
  { code: 'badge-likes-1', name: 'Received 1 Like', description: 'Received 1 like on your recipes.', icon: '❤️', metric: 'likes_received', target: 1, sortOrder: 40 },
  { code: 'badge-likes-5', name: 'Received 5 Likes', description: 'Received 5 likes on your recipes.', icon: '❤️', metric: 'likes_received', target: 5, sortOrder: 41 },
  { code: 'badge-likes-10', name: 'Received 10 Likes', description: 'Received 10 likes on your recipes.', icon: '❤️', metric: 'likes_received', target: 10, sortOrder: 42 },
  { code: 'badge-likes-100', name: 'Received 100 Likes', description: 'Received 100 likes on your recipes.', icon: '🏆', metric: 'likes_received', target: 100, sortOrder: 43 },

  // friend count badges
  { code: 'badge-friends-1', name: 'Made 1 Friend', description: 'Made 1 friend.', icon: '🤝', metric: 'friend_count', target: 1, sortOrder: 50 },
  { code: 'badge-friends-5', name: 'Made 5 Friends', description: 'Made 5 friends.', icon: '🤝', metric: 'friend_count', target: 5, sortOrder: 51 },
  { code: 'badge-friends-10', name: 'Made 10 Friends', description: 'Made 10 friends.', icon: '👥', metric: 'friend_count', target: 10, sortOrder: 52 },
  { code: 'badge-friends-100', name: 'Made 100 Friends', description: 'Made 100 friends.', icon: '🏆', metric: 'friend_count', target: 100, sortOrder: 53 }
]

const BADGE_DEF_BY_CODE = new Map(BADGE_DEFS.map((b) => [b.code, b]))

function getBadgeDef(code) {
  return BADGE_DEF_BY_CODE.get(code) || null
}

async function ensureBadgeExists(code) {
  const def = getBadgeDef(code)
  const fallback = {
    code,
    name: code,
    description: code,
    icon: '🏅',
    metric: 'challenge',
    target: 0,
    sortOrder: 9999,
    isActive: true
  }

  const insert = def || fallback

  return await Badge.findOneAndUpdate(
    { code },
    { $setOnInsert: insert },
    { upsert: true, new: true }
  )
}

async function awardBadgeOnce({ user_id, badgeCode }) {
  const badge = await ensureBadgeExists(badgeCode)
  if (!badge || badge.isActive === false) return null
  try {
    return await UserBadge.create({ user_id, badge_id: badge._id, awardedAt: new Date() })
  } catch (e) {
    return null
  }
}

module.exports = {
  BADGE_DEFS,
  getBadgeDef,
  ensureBadgeExists,
  awardBadgeOnce
}

