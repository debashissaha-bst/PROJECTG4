import { useEffect, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

const Profile = () => {
  const { user, dispatch } = useAuthContext()

  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('')
  const [dietaryPreference, setDietaryPreference] = useState('')
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
        body: JSON.stringify({ name, dob, gender, city, dietaryPreference })
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
        dietaryPreference: json.dietaryPreference || ''
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

  return (
    <form className="signup" onSubmit={handleSubmit}>
      <h3>Profile</h3>

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
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </form>
  )
}

export default Profile

