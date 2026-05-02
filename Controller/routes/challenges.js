const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const {
  listChallenges,
  joinChallengeByCode,
  quitChallengeByCode,
  getMyChallenges,
  getMyBadges,
  getBadgeCatalog
} = require('../controllers/challengeController')

const router = express.Router()

router.use(requireAuth)

router.get('/', listChallenges)
router.get('/my', getMyChallenges)
router.get('/badges', getMyBadges)
router.get('/badges/catalog', getBadgeCatalog)
router.post('/:code/join', joinChallengeByCode)
router.delete('/:code/quit', quitChallengeByCode)

module.exports = router

