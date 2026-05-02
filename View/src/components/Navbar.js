import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useLogout } from '../hooks/useLogout'
import { useAuthContext } from '../hooks/useAuthContext'
import ConfirmDialog from './ConfirmDialog'

const Navbar = () => {
  const { logout } = useLogout()
  const { user } = useAuthContext()
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false)

  const handleClick = () => {
    setConfirmLogoutOpen(true)
  }

  const handleConfirmLogout = () => {
    setConfirmLogoutOpen(false)
    logout()
  }

  return (
    <>
      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Confirm logout?"
        confirmText="Log out"
        cancelText="Cancel"
        tone="primary"
        onCancel={() => setConfirmLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
      <header className="app-header">
      <div className="container navbar-container">
        <Link to="/" className="brand-link">
          <h1>Recipe and Cooking Platform</h1>
        </Link>
        <nav className="top-nav">
          {user && (
            <div className="nav-signed-in">
              <div className="nav-links">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/recipes">Recipes</NavLink>
                <NavLink to="/gallery">Gallery</NavLink>
                <NavLink to="/personalized-meals">Meals</NavLink>
                <NavLink to="/favourites">Favourites</NavLink>
                <NavLink to="/cooking-history">History</NavLink>
                <NavLink to="/challenges">Challenges</NavLink>
                <NavLink to="/social">Social</NavLink>
                <NavLink to="/chat">AI Chat</NavLink>
              </div>
              <div className="nav-user">
                <span>{user.email}</span>
                <NavLink to="/profile" className="profile-link">Profile</NavLink>
                <button type="button" onClick={handleClick}>Log out</button>
              </div>
            </div>
          )}
          {!user && (
            <div className="nav-auth-links">
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </div>
          )}
        </nav>
      </div>
      </header>
    </>
  )
}

export default Navbar




