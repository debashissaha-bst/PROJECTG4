const { generatePersonalizedMeals } = require('../../model/models/mealPlannerModel')

const VALID_PREFERENCES = [
  'Vegetarian',
  'Gluten-Free',
  'Low-Carb',
  'Allergy-Specific',
  'Balanced'
]

const VALID_AGE_TYPES = ['child', 'teen', 'adult', 'senior']

const getPersonalizedMeals = async (req, res) => {
  try {
    const { preference, ageType, allergies } = req.body || {}

    if (!VALID_PREFERENCES.includes(preference)) {
      return res.status(400).json({ error: 'Invalid dietary preference selected' })
    }

    if (!VALID_AGE_TYPES.includes(ageType)) {
      return res.status(400).json({ error: 'Invalid age type selected' })
    }

    const normalizedAllergies = Array.isArray(allergies)
      ? allergies
      : typeof allergies === 'string'
        ? allergies.split(',').map((value) => value.trim()).filter(Boolean)
        : []

    const result = generatePersonalizedMeals({
      preference,
      ageType,
      allergies: normalizedAllergies
    })

    res.status(200).json({
      preference: result.preference,
      ageType: result.ageType,
      allergies: result.allergies,
      suggestions: {
        breakfast: result.suggestions.breakfast?.name || null,
        lunch: result.suggestions.lunch?.name || null,
        dinner: result.suggestions.dinner?.name || null
      }
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  getPersonalizedMeals
}
