import { useEffect, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import RecipeDetails from '../components/RecipeDetails'

const RecipeGallery = () => {
  const [recipes, setRecipes] = useState([])
  const [error, setError] = useState(null)
  const { user } = useAuthContext()

  useEffect(() => {
    const fetchPublicRecipes = async () => {
      try {
        const response = await fetch('/api/recipes/public')
        const json = await response.json()

        if (!response.ok) {
          setError(json.error || 'Failed to load public recipes')
          return
        }

        setRecipes(json)
      } catch (e) {
        setError('Failed to load public recipes')
      }
    }

    fetchPublicRecipes()
  }, [])

  const handleLike = async (recipeId) => {
    if (!user) {
      setError('You must be logged in to like recipes')
      return
    }

    try {
      const response = await fetch(`/api/recipes/${recipeId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      const json = await response.json()

      if (!response.ok) {
        setError(json.error || 'Failed to like recipe')
        return
      }

      setRecipes(prev =>
        prev.map(r => (r._id === json._id ? json : r))
      )
    } catch (e) {
      setError('Failed to like recipe')
    }
  }

  return (
    <div className="home">
      <div className="recipes">
        {error && <div className="error">{error}</div>}
        {recipes.length === 0 && !error && <p>No public recipes yet.</p>}
        {recipes.map((recipe) => (
          <RecipeDetails
            key={recipe._id}
            recipe={recipe}
            hideDelete
            onLike={() => handleLike(recipe._id)}
          />
        ))}
      </div>
    </div>
  )
}

export default RecipeGallery

