import { useEffect, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

const Favourites = () => {
  const { user } = useAuthContext()
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const fetchFavourites = async () => {
      if (!user) return
      setError(null)

      try {
        const response = await fetch('/api/favourites', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        const json = await response.json()

        if (!response.ok) {
          setError(json.error || 'Failed to load favourites')
          return
        }

        setItems(Array.isArray(json) ? json : [])
      } catch (e) {
        setError('Failed to load favourites')
      }
    }

    fetchFavourites()
  }, [user])

  const handleRemove = async (recipeId) => {
    if (!user) return
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/favourites/${recipeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      })
      const json = await response.json()

      if (!response.ok) {
        setError(json.error || 'Failed to remove favourite')
        return
      }

      setItems((prev) => prev.filter((x) => x.recipe?._id !== recipeId))
      setSuccess('Removed from favourites')
    } catch (e) {
      setError('Failed to remove favourite')
    }
  }

  if (!user) return <p>You must be logged in to view this page.</p>

  return (
    <div className="recipes">
      <h2>Favourite Recipes</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {items.length === 0 && !error && <p>No favourites yet.</p>}

      {items.map((item) => (
        <div className="recipe-details" key={item._id}>
          <h4>{item.recipe?.title}</h4>
          <p><strong>Time: </strong>{item.recipe?.time} minutes</p>
          {item.recipe?.difficulty && (
            <p><strong>Difficulty: </strong>{item.recipe.difficulty}</p>
          )}
          {item.recipe?.ownerEmail && (
            <p><strong>Shared by: </strong>{item.recipe.ownerEmail}</p>
          )}
          <div className="recipe-actions">
            <button type="button" onClick={() => handleRemove(item.recipe?._id)}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Favourites

