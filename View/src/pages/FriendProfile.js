import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'

const FriendProfile = () => {
  const { id } = useParams()
  const { user } = useAuthContext()

  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFriendProfile = async () => {
      if (!user) return
      try {
        const res = await fetch(`/api/user/profile/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
        const json = await res.json()
        if (!res.ok) {
          setError(json.error || 'Failed to load profile')
          return
        }
        setProfile(json)
      } catch (e) {
        setError('Failed to load profile')
      }
    }

    fetchFriendProfile()
  }, [id, user])

  if (!user) {
    return <p>You must be logged in to view this page.</p>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!profile) {
    return <p>Loading profile...</p>
  }

  return (
    <form className="signup">
      <h3>Friend Profile</h3>

      <label>Email:</label>
      <input type="text" value={profile.email} readOnly />

      <label>Name:</label>
      <input type="text" value={profile.name || ''} readOnly />

      <label>Date of Birth:</label>
      <input type="date" value={profile.dob || ''} readOnly />

      <label>Gender:</label>
      <input type="text" value={profile.gender || ''} readOnly />

      <label>City:</label>
      <input type="text" value={profile.city || ''} readOnly />

      <label>Dietary preferences:</label>
      <input type="text" value={profile.dietaryPreference || ''} readOnly />
    </form>
  )
}

export default FriendProfile

