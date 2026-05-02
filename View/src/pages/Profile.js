import { useEffect, useMemo, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import { Link } from 'react-router-dom'

const Profile = () => {
  const { user, dispatch } = useAuthContext()

  const [activeSection, setActiveSection] = useState('basic')
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('')
  const [dietaryPreference, setDietaryPreference] = useState('')
  const [nutritionGoal, setNutritionGoal] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState([])
  const [cuisinePreference, setCuisinePreference] = useState('')
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(2000)
  const [progress, setProgress] = useState({ points: 0, recipesCookedCount: 0, recipesSharedCount: 0, likesReceived: 0, friendsCount: 0 })
  const [progressLoading, setProgressLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const authHeaders = useMemo(() => {
    if (!user?.token) return {}
    return { Authorization: `Bearer ${user.token}` }
  }, [user])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/user/profile', {
          headers: authHeaders
        })
        const json = await response.json()

        if (!response.ok) {
          setError(json.error || 'Failed to load profile')
          return
        }

        setName(json.name || '')
        setDob(json.dob || '')
        setGender(json.gender || '')
        setCity(json.city || '')
        setDietaryPreference(json.dietaryPreference || '')
        setNutritionGoal(json.nutritionGoal || '')
        setDietaryRestrictions(Array.isArray(json.dietaryRestrictions) ? json.dietaryRestrictions : [])
        setCuisinePreference(json.cuisinePreference || '')
        setDailyCalorieTarget(
          typeof json.dailyCalorieTarget === 'number' && !Number.isNaN(json.dailyCalorieTarget)
            ? json.dailyCalorieTarget
            : 2000
        )
      } catch (err) {
        setError('Failed to load profile')
      }
    }

    fetchProfile()
  }, [authHeaders, user])

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return
      setProgressLoading(true)
      try {
        const res = await fetch('/api/user/progress', { headers: authHeaders })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load progress')
        setProgress({
          points: Number(json.points || 0),
          recipesCookedCount: Number(json.recipesCookedCount || 0),
          recipesSharedCount: Number(json.recipesSharedCount || 0),
          likesReceived: Number(json.likesReceived || 0),
          friendsCount: Number(json.friendsCount || 0)
        })
      } catch {
        // non-blocking
      } finally {
        setProgressLoading(false)
      }
    }

    fetchProgress()
  }, [authHeaders, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          name,
          dob,
          gender,
          city,
          dietaryPreference,
          nutritionGoal,
          dietaryRestrictions,
          cuisinePreference,
          dailyCalorieTarget
        })
      })

      const json = await response.json()

      if (!response.ok) {
        setError(json.error || 'Failed to update profile')
        return
      }

      // update stored user profile as well
      const updatedUser = {
        ...user,
        name: json.name || '',
        dob: json.dob || '',
        gender: json.gender || '',
        city: json.city || '',
        dietaryPreference: json.dietaryPreference || '',
        nutritionGoal: json.nutritionGoal || '',
        dietaryRestrictions: Array.isArray(json.dietaryRestrictions) ? json.dietaryRestrictions : [],
        cuisinePreference: json.cuisinePreference || '',
        dailyCalorieTarget:
          typeof json.dailyCalorieTarget === 'number' && !Number.isNaN(json.dailyCalorieTarget)
            ? json.dailyCalorieTarget
            : 2000
      }

      localStorage.setItem('user', JSON.stringify(updatedUser))
      dispatch({ type: 'LOGIN', payload: updatedUser })

      setSuccess('Profile updated successfully')
    } catch (err) {
      setError('Failed to update profile')
    }
  }

  if (!user) {
    return <p>You must be logged in to view this page.</p>
  }

  const toggleRestriction = (value) => {
    setDietaryRestrictions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <div className="profile-shell">
      <div className="profile-top">
        <div className="profile-hero">
          <div className="profile-avatar" aria-hidden="true">
            {(name || user?.email || 'U').trim().slice(0, 1).toUpperCase()}
          </div>
          <div className="profile-hero-text">
            <div className="profile-title">{name || 'Your profile'}</div>
            <div className="profile-subtitle">{user.email}</div>
          </div>
          <div className="profile-hero-actions">
            <Link to="/favourites" className="profile-action-link">
              <button type="button" className="profile-btn profile-btn--ghost">Favourites</button>
            </Link>
            <button type="button" className="profile-btn profile-btn--primary" onClick={handleSubmit}>
              Save changes
            </button>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-label">Points</div>
            <div className="profile-stat-value">{progressLoading ? '—' : progress.points}</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-label">Cooked</div>
            <div className="profile-stat-value">{progressLoading ? '—' : progress.recipesCookedCount}</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-label">Shared</div>
            <div className="profile-stat-value">{progressLoading ? '—' : progress.recipesSharedCount}</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-label">Likes</div>
            <div className="profile-stat-value">{progressLoading ? '—' : progress.likesReceived}</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-label">Friends</div>
            <div className="profile-stat-value">{progressLoading ? '—' : progress.friendsCount}</div>
          </div>
        </div>
      </div>

      <div className="profile-layout">
        <aside className="profile-nav" aria-label="Profile sections">
          <button type="button" className={activeSection === 'basic' ? 'profile-nav-item profile-nav-item--active' : 'profile-nav-item'} onClick={() => setActiveSection('basic')}>
            Basic
          </button>
          <button type="button" className={activeSection === 'preferences' ? 'profile-nav-item profile-nav-item--active' : 'profile-nav-item'} onClick={() => setActiveSection('preferences')}>
            Preferences
          </button>
          <button type="button" className={activeSection === 'nutrition' ? 'profile-nav-item profile-nav-item--active' : 'profile-nav-item'} onClick={() => setActiveSection('nutrition')}>
            Nutrition
          </button>
        </aside>

        <main className="profile-content">
          <form className="profile-card" onSubmit={handleSubmit}>
            {activeSection === 'basic' && (
              <>
                <div className="profile-card-header">
                  <div>
                    <div className="profile-card-title">Basic information</div>
                    <div className="profile-card-subtitle">Keep your details accurate for a better experience.</div>
                  </div>
                </div>

                <div className="profile-form-grid">
                  <div className="profile-field">
                    <label>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="profile-field">
                    <label>Date of birth</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                  </div>

                  <div className="profile-field">
                    <label>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="profile-field">
                    <label>City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>

                  <div className="profile-field">
                    <label>Dietary preference</label>
                    <select value={dietaryPreference} onChange={(e) => setDietaryPreference(e.target.value)}>
                      <option value="">Select preference</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Non-vegetarian">Non-vegetarian</option>
                      <option value="Pescatarian">Pescatarian</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'preferences' && (
              <>
                <div className="profile-card-header">
                  <div>
                    <div className="profile-card-title">Preferences</div>
                    <div className="profile-card-subtitle">Personalize recipes to match what you like.</div>
                  </div>
                </div>

                <div className="profile-form-grid">
                  <div className="profile-field">
                    <label>Cuisine preference</label>
                    <select value={cuisinePreference} onChange={(e) => setCuisinePreference(e.target.value)}>
                      <option value="">Select cuisine</option>
                      <option value="Italian">Italian</option>
                      <option value="Asian">Asian</option>
                      <option value="Mediterranean">Mediterranean</option>
                      <option value="Mexican">Mexican</option>
                      <option value="Indian">Indian</option>
                    </select>
                  </div>

                  <div className="profile-field profile-field--full">
                    <label>Dietary restrictions</label>
                    <div className="profile-chips">
                      {['Nuts', 'Gluten', 'Dairy', 'Seafood', 'Eggs', 'Soy', 'None'].map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={dietaryRestrictions.includes(item) ? 'profile-chip profile-chip--active' : 'profile-chip'}
                          onClick={() => toggleRestriction(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'nutrition' && (
              <>
                <div className="profile-card-header">
                  <div>
                    <div className="profile-card-title">Nutrition</div>
                    <div className="profile-card-subtitle">Set a goal and daily calories for personalized meals.</div>
                  </div>
                </div>

                <div className="profile-form-grid">
                  <div className="profile-field">
                    <label>Nutrition goal</label>
                    <select value={nutritionGoal} onChange={(e) => setNutritionGoal(e.target.value)}>
                      <option value="">Select goal</option>
                      <option value="Weight loss">Weight loss</option>
                      <option value="High protein">High protein</option>
                      <option value="Quick meals">Quick meals</option>
                      <option value="Balanced diet">Balanced diet</option>
                      <option value="Gourmet">Gourmet</option>
                    </select>
                  </div>

                  <div className="profile-field profile-field--full">
                    <label>Daily calorie target</label>
                    <div className="profile-range">
                      <div className="profile-range-value">{dailyCalorieTarget} kcal</div>
                      <input
                        type="range"
                        min="1000"
                        max="4000"
                        step="100"
                        value={dailyCalorieTarget}
                        onChange={(e) => setDailyCalorieTarget(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="profile-card-footer">
              <button type="submit" className="profile-btn profile-btn--primary">Save changes</button>
              <div className="profile-messages">
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

export default Profile

