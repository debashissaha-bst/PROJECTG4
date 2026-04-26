import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

const preferences = ['Vegetarian', 'Gluten-Free', 'Low-Carb', 'Allergy-Specific', 'Balanced']
const ageTypes = ['child', 'teen', 'adult', 'senior']

const PersonalizedMeals = () => {
  const { user } = useAuthContext()

  const [preference, setPreference] = useState('Balanced')
  const [ageType, setAgeType] = useState('adult')
  const [allergyText, setAllergyText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)
    setResult(null)

    const allergies = allergyText
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    try {
      const response = await fetch('/api/meals/personalized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          preference,
          ageType,
          allergies
        })
      })

      const json = await response.json()
      if (!response.ok) {
        setError(json.error || 'Failed to generate personalized meals')
        return
      }

      setResult(json)
    } catch (err) {
      setError('Failed to generate personalized meals')
    } finally {
      setLoading(false)
    }
  }

  const cards = result?.suggestions
    ? [
        { title: 'Breakfast', mealName: result.suggestions.breakfast },
        { title: 'Lunch', mealName: result.suggestions.lunch },
        { title: 'Dinner', mealName: result.suggestions.dinner }
      ]
    : []

  return (
    <div className="recipes">
      <div className="recipe-details">
        <h4>Personalized Meal Suggestions</h4>
        <p>Generate daily meal ideas using dietary preference, age type, and allergy filters.</p>

        <form onSubmit={handleGenerate}>
          <label>Dietary Preference</label>
          <select value={preference} onChange={(e) => setPreference(e.target.value)}>
            {preferences.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label>Age Type</label>
          <select value={ageType} onChange={(e) => setAgeType(e.target.value)}>
            {ageTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label>Allergies (comma separated)</label>
          <input
            type="text"
            value={allergyText}
            onChange={(e) => setAllergyText(e.target.value)}
            placeholder="example: nuts, dairy, egg"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Meal Plan'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}
      </div>

      {cards.map((card) => (
        <div className="recipe-details" key={card.title}>
          <h4>{card.title}</h4>
          <p><strong>Meal:</strong> {card.mealName || 'No suggestion available'}</p>
        </div>
      ))}
    </div>
  )
}

export default PersonalizedMeals
