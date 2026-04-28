import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import coverImage from '../images/cover.png'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const [active, setActive] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [clockNow, setClockNow] = useState(Date.now())
  const [progress, setProgress] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])

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

    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/user/leaderboard', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        const json = await response.json()
        if (!response.ok) {
          return
        }
        setLeaderboard(Array.isArray(json) ? json : [])
      } catch (_) {}
    }

    fetchActive()
    fetchProgress()
    fetchLeaderboard()
  }, [user])

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [active])

  useEffect(() => {
    const id = setInterval(() => setClockNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const dashboardClock = useMemo(
    () =>
      new Date(clockNow).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
    [clockNow]
  )


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

  const timerProgress = useMemo(() => {
    if (!active) return 0

    const durationSeconds = Number(active.durationSeconds) || 0
    if (durationSeconds <= 0) return 0

    const started = new Date(active.startedAt).getTime()
    const durationMs = durationSeconds * 1000
    const elapsedMs = Math.max(0, now - started)
    const percent = Math.min(100, (elapsedMs / durationMs) * 100)

    return Number(percent.toFixed(1))
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
      <section className="home-hero">
        <img src={coverImage} alt="Cooking cover" className="home-hero-image" />
        <div className="home-hero-overlay">
          <h1>Discover recipes, learn, connect with communities, and track progress.</h1>
        </div>
        <div className="home-hero-actions">
          <button
            className="home-primary-btn home-ai-btn"
            onClick={() => navigate('/chat')}
          >
            AI Cooking Assistant
          </button>
          <button className="home-primary-btn" onClick={() => navigate('/recipes')}>
            Explore Recipes
          </button>
          <button className="home-secondary-btn" onClick={() => navigate('/gallery')}>
            Open Gallery
          </button>
        </div>
      </section>

      <section className="home-quick-links">
        <button className="home-quick-link-card" onClick={() => navigate('/recipes')}>
          <h3>Recipes</h3>
          <p>Browse community and personal recipes.</p>
        </button>
        <button className="home-quick-link-card" onClick={() => navigate('/gallery')}>
          <h3>Gallery</h3>
          <p>Start a cooking session with timer support.</p>
        </button>
        <button className="home-quick-link-card" onClick={() => navigate('/personalized-meals')}>
          <h3>Meal Plans</h3>
          <p>Get suggestions based on your preferences.</p>
        </button>
        <button className="home-quick-link-card" onClick={() => navigate('/social')}>
          <h3>Social</h3>
          <p>Connect with friends and share ideas.</p>
        </button>
      </section>

      <div className="home-sections">
        <div className="home-panel home-panel-progress">
          <div className="home-panel-progress-header">
            <h4>Progress Dashboard</h4>
            <span className="home-dashboard-clock" aria-label="Current time">
              {dashboardClock}
            </span>
          </div>
          {!user && <p className="home-muted">Login to see your progress.</p>}
          {user && progress && (
            <div className="home-stats-grid">
              <div className="home-stat-card">
                <span>Points</span>
                <strong>{progress.points}</strong>
              </div>
              <div className="home-stat-card">
                <span>Shared</span>
                <strong>{progress.recipesSharedCount}</strong>
              </div>
              <div className="home-stat-card">
                <span>Cooked</span>
                <strong>{progress.recipesCookedCount}</strong>
              </div>
              <div className="home-stat-card">
                <span>Likes</span>
                <strong>{progress.likesReceived ?? 0}</strong>
              </div>
            </div>
          )}
          {user && !progress && <p className="home-muted">Loading progress...</p>}
        </div>

        <div className="home-panel">
          <h4>Cooking Timer</h4>
          {!user && <p className="home-muted">Login to start cooking from the Gallery.</p>}

          {user && !active && (
            <p className="home-muted">
              No active cooking session. Start one from the <Link to="/gallery">Gallery</Link>.
            </p>
          )}

          {user && active && (
            <>
              <div className="home-timer-chip">{remaining ? `${remaining.minutes}:${String(remaining.seconds).padStart(2, '0')}` : '...'}</div>
              <div className="home-timer-progress" aria-label="Cooking progress">
                <span className="home-timer-progress-float">
                  {timerProgress.toFixed(1)}%
                </span>
                <div className="home-timer-progress-wrap">
                  <div
                    className="home-timer-progress-fill"
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
              </div>
              <p><strong>Recipe:</strong> {active.recipe?.title || 'Recipe'}</p>
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

        <div className="home-panel">
          <h4>Leaderboard</h4>
          <div className="home-leaderboard-list">
            {leaderboard.length === 0 && (
              <p className="home-muted">No leaderboard data yet.</p>
            )}
            {leaderboard.slice(0, 3).map((entry, idx) => (
              <div key={entry._id} className="home-leaderboard-item">
                <div>
                  <strong>#{idx + 1}</strong>{' '}
                  <span>{entry.name || entry.email}</span>
                </div>
                <span className="home-leaderboard-points">{entry.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Home
