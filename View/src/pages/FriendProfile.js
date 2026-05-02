import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'

const FriendProfile = () => {
  const { id } = useParams()
  const { user } = useAuthContext()

  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)

  const authHeaders = useMemo(() => {
    if (!user?.token) return {}
    return { Authorization: `Bearer ${user.token}` }
  }, [user])

  useEffect(() => {
    const fetchFriendProfile = async () => {
      if (!user) return
      try {
        const res = await fetch(`/api/user/profile/${id}`, {
          headers: authHeaders
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
  }, [authHeaders, id, user])

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
    <div className="friend-profile-shell">
      <div className="friend-profile-hero">
        <div className="friend-profile-avatar" aria-hidden="true">
          {(profile.name || profile.email || 'U').trim().slice(0, 1).toUpperCase()}
        </div>
        <div className="friend-profile-hero-text">
          <div className="friend-profile-title">{profile.name || 'Friend profile'}</div>
          <div className="friend-profile-subtitle">{profile.email}</div>
        </div>
      </div>

      <div className="friend-profile-card">
        <div className="friend-profile-grid">
          <div className="friend-profile-field">
            <label>Email</label>
            <input type="text" value={profile.email || ''} readOnly />
          </div>
          <div className="friend-profile-field">
            <label>Name</label>
            <input type="text" value={profile.name || ''} readOnly />
          </div>
          <div className="friend-profile-field">
            <label>Date of birth</label>
            <input type="text" value={profile.dob || ''} readOnly />
          </div>
          <div className="friend-profile-field">
            <label>Gender</label>
            <input type="text" value={profile.gender || ''} readOnly />
          </div>
          <div className="friend-profile-field">
            <label>City</label>
            <input type="text" value={profile.city || ''} readOnly />
          </div>
          <div className="friend-profile-field">
            <label>Dietary preference</label>
            <input type="text" value={profile.dietaryPreference || ''} readOnly />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FriendProfile

