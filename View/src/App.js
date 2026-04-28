import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './hooks/useAuthContext'

// pages & components
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import RecipeGallery from './pages/RecipeGallery'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Favourites from './pages/Favourites'
import FriendProfile from './pages/FriendProfile'
import Social from './pages/Social'
import CookingHistory from './pages/CookingHistory'
import PersonalizedMeals from './pages/PersonalizedMeals'
import Trash from './pages/Trash'
import Navbar from './components/Navbar'

function App() {
  const { user, authIsReady } = useAuthContext()

  if (!authIsReady) {
    return null
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Home /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/recipes" 
              element={user ? <Recipes /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/gallery" 
              element={user ? <RecipeGallery /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/chat" 
              element={user ? <Chat /> : <Navigate to="/login" />} 
            />
            <Route
              path="/trash"
              element={user ? <Trash /> : <Navigate to="/login" />}
            />
            <Route 
              path="/profile" 
              element={user ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route
              path="/favourites"
              element={user ? <Favourites /> : <Navigate to="/login" />}
            />
            <Route 
              path="/profile/:id" 
              element={user ? <FriendProfile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/social" 
              element={user ? <Social /> : <Navigate to="/login" />} 
            />
            <Route
              path="/cooking-history"
              element={user ? <CookingHistory /> : <Navigate to="/login" />}
            />
            <Route
              path="/personalized-meals"
              element={user ? <PersonalizedMeals /> : <Navigate to="/login" />}
            />
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/signup" 
              element={!user ? <Signup /> : <Navigate to="/" />} 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
