import { useEffect, useMemo, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

function pct(n, d) {
  const denom = Number(d) || 0
  if (!denom) return 0
  const num = Math.max(0, Number(n) || 0)
  return Math.min(100, Math.round((num / denom) * 100))
}

const CookingChallenges = () => {
  const { user } = useAuthContext()
  const [challenges, setChallenges] = useState([])
  const [badgeCatalog, setBadgeCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joiningCode, setJoiningCode] = useState(null)
  const [quittingCode, setQuittingCode] = useState(null)

  const authHeaders = useMemo(() => {
    if (!user?.token) return {}
    return { Authorization: `Bearer ${user.token}` }
  }, [user])

  const fetchAll = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [cRes, catalogRes] = await Promise.all([
        fetch('/api/challenges', { headers: authHeaders }),
        fetch('/api/challenges/badges/catalog', { headers: authHeaders })
      ])

      const [cJson, catalogJson] = await Promise.all([cRes.json(), catalogRes.json()])

      if (!cRes.ok) throw new Error(cJson?.error || 'Failed to load challenges')
      if (!catalogRes.ok) throw new Error(catalogJson?.error || 'Failed to load badge catalog')

      setChallenges(Array.isArray(cJson) ? cJson : [])
      setBadgeCatalog(Array.isArray(catalogJson) ? catalogJson : [])
    } catch (e) {
      setError(e?.message || 'Failed to load challenges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const joinChallenge = async (code) => {
    if (!code || !user) return
    setJoiningCode(code)
    setError(null)
    try {
      const res = await fetch(`/api/challenges/${encodeURIComponent(code)}/join`, {
        method: 'POST',
        headers: { ...authHeaders }
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to join challenge')
      await fetchAll()
    } catch (e) {
      setError(e?.message || 'Failed to join challenge')
    } finally {
      setJoiningCode(null)
    }
  }

  const quitChallenge = async (code) => {
    if (!code || !user) return
    setQuittingCode(code)
    setError(null)
    try {
      const res = await fetch(`/api/challenges/${encodeURIComponent(code)}/quit`, {
        method: 'DELETE',
        headers: { ...authHeaders }
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to quit challenge')
      await fetchAll()
    } catch (e) {
      setError(e?.message || 'Failed to quit challenge')
    } finally {
      setQuittingCode(null)
    }
  }

  return (
    <div className="cc-page">
      {loading && (
        <div className="cc-hero">
          <div className="cc-status">
            <span className="cc-chip">Loading...</span>
          </div>
        </div>
      )}

      {!loading && error && <div className="error">{error}</div>}

      <div className="cc-grid">
        <section className="cc-column cc-column--challenges">
          <div className="cc-section-header">
            <h3>Cooking Challenges</h3>
          </div>

          <div className="cc-column-body">
            {!loading && !error && challenges.length === 0 && <p className="cc-empty">No challenges available.</p>}

            {!loading &&
              !error &&
              challenges.map((c) => {
                const joined = Boolean(c.my)
                const streak = c.my?.streakDays || 0
                const duration = c.durationDays || 0
                const progress = pct(streak, duration)
                const canQuit = joined && c.my?.status === 'active'

                return (
                  <div className="cc-card" key={c._id}>
                    <div className="cc-card-top">
                      <div>
                        <div className="cc-card-title">{c.title}</div>
                        <div className="cc-card-desc">{c.description}</div>
                      </div>
                      <div className="cc-pill">{duration} days</div>
                    </div>

                    {joined ? (
                      <div className="cc-meta">
                        <div><strong>Status:</strong> {c.my.status}</div>
                        <div><strong>Progress:</strong> {streak}/{duration} days ({progress}%)</div>
                        {c.my.lastCookedDayKey && (
                          <div><strong>Last counted:</strong> {c.my.lastCookedDayKey}</div>
                        )}
                      </div>
                    ) : (
                      <div className="cc-meta">
                        <div><strong>Status:</strong> Not joined</div>
                      </div>
                    )}

                    <div className="cc-actions">
                      {joined ? (
                        <>
                          {canQuit && (
                            <button
                              type="button"
                              className="cc-btn cc-btn--danger"
                              onClick={() => quitChallenge(c.code)}
                              disabled={quittingCode === c.code}
                            >
                              {quittingCode === c.code ? 'Quitting...' : 'Quit'}
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          className="cc-btn cc-btn--primary"
                          onClick={() => joinChallenge(c.code)}
                          disabled={joiningCode === c.code}
                        >
                          {joiningCode === c.code ? 'Joining...' : 'Join'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </section>

        <section className="cc-column cc-column--badges">
          <div className="cc-section-header">
            <h3>Badges</h3>
          </div>

          <div className="cc-column-body cc-column-body--scroll">
            {!loading && !error && badgeCatalog.length === 0 && <p className="cc-empty">No badges available.</p>}

            {!loading &&
              !error &&
              badgeCatalog.map((b) => {
                const pct = Number(b.progressPct) || 0
                const isComplete = Boolean(b.isAwarded) || pct >= 100

                return (
                <div className={isComplete ? 'cc-card cc-card--unlocked' : 'cc-card'} key={b._id}>
                  <div className="cc-card-top">
                    <div>
                      <div className={isComplete ? 'cc-card-title cc-card-title--unlocked' : 'cc-card-title'}>
                        {b.name}
                      </div>
                      <div className="cc-card-desc">{b.description}</div>
                    </div>
                    <div className={isComplete ? 'cc-pill cc-pill--unlocked' : 'cc-pill'}>
                      {isComplete ? 'Completed' : `${b.progressPct}%`}
                    </div>
                  </div>

                  <div className="cc-progress">
                    <div className="cc-progress-bar" style={{ width: `${b.progressPct}%` }} />
                  </div>

                  <div className="cc-progress-footer">
                    <span className={isComplete ? 'badge-progress badge-progress--unlocked' : 'badge-progress'}>
                      Progress
                    </span>
                    {!isComplete && <span>{`${b.progressPct}% (${b.current}/${b.target || 1})`}</span>}
                  </div>
                </div>
                )
              })}
          </div>
        </section>
      </div>
    </div>
  )
}

export default CookingChallenges

