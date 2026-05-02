import { useEffect, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

const preferences = ['Vegetarian', 'Gluten-Free', 'Low-Carb', 'Allergy-Specific', 'Balanced']
const ageTypes = ['child', 'teen', 'adult', 'senior']
const HISTORY_KEY = 'personalizedMealHistory'
const toLabel = (value) => value.charAt(0).toUpperCase() + value.slice(1)

const PersonalizedMeals = () => {
  const { user } = useAuthContext()

  const [preference, setPreference] = useState('Balanced')
  const [ageType, setAgeType] = useState('adult')
  const [allergyText, setAllergyText] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      setHistory(Array.isArray(parsed) ? parsed.slice(0, 3) : [])
    } catch {
      setHistory([])
    }
  }, [])

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
      const suggestions = json?.suggestions || {}
      const nextEntry = {
        id: Date.now(),
        breakfast: suggestions.breakfast || '',
        lunch: suggestions.lunch || '',
        dinner: suggestions.dinner || ''
      }
      const nextHistory = [nextEntry, ...history]
        .filter((item, idx, arr) => arr.findIndex((x) => x.breakfast === item.breakfast && x.lunch === item.lunch && x.dinner === item.dinner) === idx)
        .slice(0, 3)
      setHistory(nextHistory)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory))
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
    <div className="pm-shell">
      <div className="pm-hero">
        <div>
          <div className="pm-title">Personalized meals</div>
          <div className="pm-subtitle">Generate daily ideas based on preference, age, and allergies.</div>
        </div>
        <div className="pm-hero-metrics">
          <div className="pm-hero-metric">
            <span className="pm-hero-metric-label">Preference</span>
            <span className="pm-hero-metric-value">{preference}</span>
          </div>
          <div className="pm-hero-metric">
            <span className="pm-hero-metric-label">Age type</span>
            <span className="pm-hero-metric-value">{toLabel(ageType)}</span>
          </div>
        </div>
      </div>

      <div className="pm-layout">
        <aside className="pm-panel">
          <div className="pm-panel-title">Filters</div>
          <form onSubmit={handleGenerate} className="pm-form">
            <div className="pm-field">
              <label>Dietary preference</label>
              <select value={preference} onChange={(e) => setPreference(e.target.value)}>
                {preferences.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="pm-field">
              <label>Age type</label>
              <select value={ageType} onChange={(e) => setAgeType(e.target.value)}>
                {ageTypes.map((item) => (
                  <option key={item} value={item}>
                    {toLabel(item)}
                  </option>
                ))}
              </select>
            </div>

            <div className="pm-field">
              <label>Allergies</label>
              <input
                type="text"
                value={allergyText}
                onChange={(e) => setAllergyText(e.target.value)}
                placeholder="nuts, dairy, egg"
              />
            </div>

            <button type="submit" className="pm-btn pm-btn--primary" disabled={loading || !user}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </form>

          {!user && <div className="pm-note">Login to generate a meal plan.</div>}
          {error && <div className="error">{error}</div>}
        </aside>

        <main className="pm-content">
          <div className="pm-results-head">
            <div className="pm-panel-title">Today’s suggestions</div>
            {result?.meta && (
              <div className="pm-pill">
                {result.meta.preference || preference} • {toLabel(result.meta.ageType || ageType)}
              </div>
            )}
          </div>

          {loading && (
            <div className="pm-grid">
              {['Breakfast', 'Lunch', 'Dinner'].map((t) => (
                <div className="pm-card pm-card--skeleton" key={t}>
                  <div className="pm-card-top">
                    <div className="pm-card-title">{t}</div>
                  </div>
                  <div className="pm-skel-line" />
                  <div className="pm-skel-line pm-skel-line--short" />
                </div>
              ))}
            </div>
          )}

          {!loading && cards.length === 0 && (
            <div className="pm-empty">
              <div className="pm-empty-title">No plan yet</div>
              <div className="pm-empty-subtitle">Choose your filters and generate your meal suggestions.</div>
            </div>
          )}

          {!loading && cards.length > 0 && (
            <div className="pm-grid">
              {cards.map((card) => (
                <div className="pm-card" key={card.title}>
                  <div className="pm-card-top">
                    <div className="pm-card-title">{card.title}</div>
                  </div>
                  <div className="pm-meal">{card.mealName || 'No suggestion available'}</div>
                </div>
              ))}
            </div>
          )}

          {!loading && history.length > 0 && (
            <div className="pm-history">
              <div className="pm-history-title">Previously suggested</div>
              <div className="pm-history-grid">
                {history.map((item) => (
                  <div className="pm-history-card" key={item.id}>
                    <div className="pm-history-card-title">Saved plan</div>
                    <div><strong>Breakfast:</strong> {item.breakfast || '—'}</div>
                    <div><strong>Lunch:</strong> {item.lunch || '—'}</div>
                    <div><strong>Dinner:</strong> {item.dinner || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default PersonalizedMeals
