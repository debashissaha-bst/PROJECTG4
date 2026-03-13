import { useEffect, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import { Link } from 'react-router-dom'

const Profile = () => {
  const { user, dispatch } = useAuthContext()

  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('')
  const [dietaryPreference, setDietaryPreference] = useState('')
  const [nutritionGoal, setNutritionGoal] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState([])
  const [cuisinePreference, setCuisinePreference] = useState('')
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(2000)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
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
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
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
    <div className="profile-page">
      <div className="profile-header">
        <h3>Profile</h3>
        <Link to="/favourites">
          <button type="button">Favourite</button>
        </Link>
      </div>

      <div className="profile-forms">
        <form className="profile-form" onSubmit={handleSubmit}>
          <h4>Basic Information</h4>

          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Date of Birth:</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />

          <label>Gender:</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <label>City:</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <label>Dietary preferences:</label>
          <select
            value={dietaryPreference}
            onChange={(e) => setDietaryPreference(e.target.value)}
          >
            <option value="">Select preference</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Non-vegetarian">Non-vegetarian</option>
            <option value="Pescatarian">Pescatarian</option>
          </select>

          <button type="submit">Save Profile</button>
        </form>

        <form className="profile-form" onSubmit={handleSubmit}>
          <h4>Nutrition Preferences</h4>

          <label>Nutrition Goal:</label>
          <select
            value={nutritionGoal}
            onChange={(e) => setNutritionGoal(e.target.value)}
          >
            <option value="">Select goal</option>
            <option value="Weight loss">Weight loss</option>
            <option value="High protein">High protein</option>
            <option value="Quick meals">Quick meals</option>
            <option value="Balanced diet">Balanced diet</option>
            <option value="Gourmet">Gourmet</option>
          </select>

          <fieldset style={{ border: 'none', padding: 0, marginBottom: 20 }}>
            <legend>Dietary Restrictions:</legend>
            {['Nuts', 'Gluten', 'Dairy', 'Seafood', 'Eggs', 'Soy', 'None'].map((item) => (
              <label key={item} style={{ display: 'block', marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={dietaryRestrictions.includes(item)}
                  onChange={() => toggleRestriction(item)}
                  style={{ width: 'auto', marginRight: 8 }}
                />
                {item}
              </label>
            ))}
          </fieldset>

          <label>Cuisine Preference:</label>
          <select
            value={cuisinePreference}
            onChange={(e) => setCuisinePreference(e.target.value)}
          >
            <option value="">Select cuisine</option>
            <option value="Italian">Italian</option>
            <option value="Asian">Asian</option>
            <option value="Mediterranean">Mediterranean</option>
            <option value="Mexican">Mexican</option>
            <option value="Indian">Indian</option>
          </select>

          <label>Daily Calorie Target: {dailyCalorieTarget} kcal</label>
          <input
            type="range"
            min="1000"
            max="4000"
            step="100"
            value={dailyCalorieTarget}
            onChange={(e) => setDailyCalorieTarget(Number(e.target.value))}
          />

          <button type="submit">Save Nutrition</button>
        </form>
      </div>

      <div className="profile-messages">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </div>
    </div>
  )
}

export default Profile

