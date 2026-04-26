import { useEffect, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

const CookingHistory = () => {
  const { user } = useAuthContext()
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return

      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/cook/history', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        const json = await response.json()

        if (!response.ok) {
          setError(json.error || 'Failed to load cooking history')
          return
        }

        setHistory(Array.isArray(json) ? json : [])
      } catch (e) {
        setError('Failed to load cooking history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user])

  return (
    <div className="recipes">
      <div className="recipe-details">
        <h4>Cooking History</h4>
        {loading && <p>Loading cooking history...</p>}
        {!loading && error && <div className="error">{error}</div>}
        {!loading && !error && history.length === 0 && (
          <p>No cooking history yet. Finish a recipe from the timer to see it here.</p>
        )}
      </div>

      {!loading &&
        !error &&
        history.map((item) => (
          <div className="recipe-details" key={item.sessionId}>
            <p><strong>Recipe:</strong> {item.recipeTitle}</p>
            <p><strong>Cooked date:</strong> {new Date(item.cookedAt).toLocaleString()}</p>
            <p>
              <strong>Review:</strong>{' '}
              {item.review?.comment ? item.review.comment : 'No review added yet'}
            </p>
          </div>
        ))}
    </div>
  )
}

export default CookingHistory
