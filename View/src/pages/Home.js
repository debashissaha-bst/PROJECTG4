import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const [active, setActive] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    if (!user) return

    const fetchActive = async () => {
      try {
        const response = await fetch('/api/cook/active', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        const json = await response.json()
        if (!response.ok) {
          setError(json.error || 'Failed to load cooking session')
          return
        }
        setActive(json)
      } catch (e) {
        setError('Failed to load cooking session')
      }
    }

    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/user/progress', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        const json = await response.json()
        if (!response.ok) {
          return
        }
        setProgress(json)
      } catch (_) {}
    }

    fetchActive()
    fetchProgress()
  }, [user])

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [active])

  const remaining = useMemo(() => {
    if (!active) return null
    const started = new Date(active.startedAt).getTime()
    const end = started + Number(active.durationSeconds) * 1000
    const ms = Math.max(0, end - now)
    const totalSeconds = Math.ceil(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return { totalSeconds, minutes, seconds }
  }, [active, now])

  const handleFinish = async () => {
    if (!user || !active?._id) return
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/cook/${active._id}/finish`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user.token}` }
      })
      const json = await response.json()
      if (!response.ok) {
        setError(json.error || 'Failed to finish cooking')
        return
      }
      setActive(null)
      setSuccess('Cooking finished. You can now review this recipe in the Gallery.')
    } catch (e) {
      setError('Failed to finish cooking')
    }
  }

  return (
    <div className="home">
      <div>
        <button className="go-recipes-btn" onClick={() => navigate('/recipes')}>
          Go to Recipe Page
        </button>
        <button className="go-recipes-btn" onClick={() => navigate('/gallery')}>
          Recipe Gallery
        </button>
      </div>

      <div className="recipes">
        <div className="recipe-details">
          <h4>Progress Dashboard</h4>
          {!user && <p>Login to see your progress.</p>}
          {user && progress && (
            <>
              <p><strong>Points earned:</strong> {progress.points}</p>
              <p><strong>Recipes shared:</strong> {progress.recipesSharedCount}</p>
              <p><strong>Recipes cooked:</strong> {progress.recipesCookedCount}</p>
              <p><strong>Likes received:</strong> {progress.likesReceived ?? 0}</p>
            </>
          )}
          {user && !progress && <p>Loading progress...</p>}
        </div>

        <div className="recipe-details">
          <h4>Cooking Timer</h4>
          {!user && <p>Login to start cooking from the Gallery.</p>}

          {user && !active && (
            <p>
              No active cooking session. Start one from the <Link to="/gallery">Gallery</Link>.
            </p>
          )}

          {user && active && (
            <>
              <p><strong>Recipe: </strong>{active.recipe?.title || 'Recipe'}</p>
              <p>
                <strong>Remaining: </strong>
                {remaining ? `${remaining.minutes}:${String(remaining.seconds).padStart(2, '0')}` : '...'}
              </p>
              <div className="recipe-actions">
                <button type="button" onClick={handleFinish}>
                  Finish
                </button>
                <Link to="/gallery">
                  <button type="button">Go to Gallery</button>
                </Link>
              </div>
            </>
          )}

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </div>
      </div>

      <button
        className="go-recipes-btn ai-chatbot-btn ai-chatbot-floating"
        onClick={() => navigate('/chat')}
      >
        Ai Cooking Assistant
      </button>
    </div>
  )
}

export default Home
