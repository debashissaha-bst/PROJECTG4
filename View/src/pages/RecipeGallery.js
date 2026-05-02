import { useEffect, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import RecipeDetails from '../components/RecipeDetails'

const RecipeGallery = () => {
  const [recipes, setRecipes] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [cookedIds, setCookedIds] = useState(new Set())
  const [reviewDrafts, setReviewDrafts] = useState({})
  const [openReviewsFor, setOpenReviewsFor] = useState({})
  const [reviewsByRecipe, setReviewsByRecipe] = useState({})
  const [reviewsLoading, setReviewsLoading] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuthContext()

  useEffect(() => {
    const fetchPublicRecipes = async () => {
      try {
        const query = searchTerm.trim()
          ? `?search=${encodeURIComponent(searchTerm.trim())}`
          : ''
        const response = await fetch(`/api/recipes/public${query}`)
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
  }, [searchTerm])

  useEffect(() => {
    const fetchCookedIds = async () => {
      if (!user) return
      try {
        const response = await fetch('/api/cook/cooked-ids', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        const json = await response.json()
        if (!response.ok) return
        const ids = Array.isArray(json.cookedRecipeIds) ? json.cookedRecipeIds : []
        setCookedIds(new Set(ids.map(String)))
      } catch (_) {}
    }

    fetchCookedIds()
  }, [user])

  const handleLike = async (recipeId) => {
    if (!user) {
      setError('You must be logged in to like recipes')
      return
    }

    try {
      setSuccess(null)
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

  const handleFavourite = async (recipeId) => {
    if (!user) {
      setError('You must be logged in to save favourites')
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/favourites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ recipeId })
      })

      const json = await response.json()

      if (!response.ok) {
        setError(json.error || 'Failed to save favourite')
        return
      }

      if (json && json._id) {
        setSuccess('Saved to favourites')
      } else {
        setSuccess('Favourite saved')
      }
    } catch (e) {
      setError('Failed to save favourite')
    }
  }

  const handleCook = async (recipeId) => {
    if (!user) {
      setError('You must be logged in to cook recipes')
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/cook/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ recipeId })
      })
      const json = await response.json()

      if (!response.ok) {
        setError(json.error || 'Failed to start cooking')
        return
      }

      setSuccess('Cooking started. Check Home for the timer.')
    } catch (e) {
      setError('Failed to start cooking')
    }
  }

  const handleSubmitReview = async (recipeId) => {
    if (!user) {
      setError('You must be logged in to review recipes')
      return
    }
    if (!cookedIds.has(String(recipeId))) {
      setError('You can only review after cooking this recipe')
      return
    }

    const comment = (reviewDrafts[recipeId] || '').trim()
    if (!comment) {
      setError('Please write a comment first')
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ recipeId, comment })
      })
      const json = await response.json()
      if (!response.ok) {
        setError(json.error || 'Failed to submit review')
        return
      }

      setSuccess('Review submitted')
      setReviewDrafts((prev) => ({ ...prev, [recipeId]: '' }))
    } catch (e) {
      setError('Failed to submit review')
    }
  }

  const handleTogglePreviousReviews = async (recipeId) => {
    setError(null)
    setSuccess(null)

    setOpenReviewsFor((prev) => ({ ...prev, [recipeId]: !prev[recipeId] }))

    // fetch once (or refetch if empty)
    if (reviewsByRecipe[recipeId]) return

    setReviewsLoading((prev) => ({ ...prev, [recipeId]: true }))
    try {
      const response = await fetch(`/api/reviews/${recipeId}`)
      const json = await response.json()
      if (!response.ok) {
        setError(json.error || 'Failed to load previous reviews')
        return
      }
      setReviewsByRecipe((prev) => ({ ...prev, [recipeId]: Array.isArray(json) ? json : [] }))
    } catch (e) {
      setError('Failed to load previous reviews')
    } finally {
      setReviewsLoading((prev) => ({ ...prev, [recipeId]: false }))
    }
  }

  return (
    <div className="home">
      <div className="recipes gallery-page">
        <div className="recipe-search-bar">
          <input
            type="text"
            value={searchTerm}
            placeholder="Search by recipe name or ingredient..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        {recipes.length === 0 && !error && (
          <p>{searchTerm.trim() ? 'No recipes found for your search.' : 'No public recipes yet.'}</p>
        )}
        {recipes.map((recipe) => (
          <div key={recipe._id} className="gallery-meal-card">
            <div className="gallery-meal-layout">
              <RecipeDetails
                recipe={recipe}
                hideDelete
                onLike={() => handleLike(recipe._id)}
                onFavourite={() => handleFavourite(recipe._id)}
                favouriteLabel="Save to favourite"
              />

              <div className="gallery-side-stack">
              <div className="gallery-side-panel">
                <p className="gallery-panel-title"><strong>Cook</strong></p>
                <div className="recipe-actions">
                  <button type="button" className="btn-cook" onClick={() => handleCook(recipe._id)}>
                    Start Cooking
                  </button>
                  <button
                    type="button"
                    className="btn-previous-reviews"
                    onClick={() => handleTogglePreviousReviews(recipe._id)}
                  >
                    Previous reviews
                  </button>
                </div>

                {openReviewsFor[recipe._id] && (
                  <div className="gallery-previous-reviews">
                    <p className="gallery-panel-subtitle">
                      <strong>Recent reviews:</strong>
                    </p>
                    {reviewsLoading[recipe._id] && <p>Loading...</p>}
                    {!reviewsLoading[recipe._id] &&
                      Array.isArray(reviewsByRecipe[recipe._id]) &&
                      reviewsByRecipe[recipe._id].length === 0 && (
                        <p>No reviews yet.</p>
                      )}
                    {!reviewsLoading[recipe._id] &&
                      Array.isArray(reviewsByRecipe[recipe._id]) &&
                      reviewsByRecipe[recipe._id].length > 0 && (
                        <ul className="review-list">
                          {reviewsByRecipe[recipe._id].slice(0, 5).map((r, idx) => (
                            <li key={r._id || idx} className="review-item">
                              {r.comment}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                )}
              </div>

              <div className="gallery-side-panel">
                <p className="gallery-panel-title"><strong>Review</strong></p>
                <textarea
                  value={reviewDrafts[recipe._id] || ''}
                  onChange={(e) =>
                    setReviewDrafts((prev) => ({ ...prev, [recipe._id]: e.target.value }))
                  }
                  placeholder={
                    cookedIds.has(String(recipe._id))
                      ? 'Write your review comment...'
                      : 'Cook this recipe first to unlock reviews.'
                  }
                  disabled={!cookedIds.has(String(recipe._id))}
                />
                <div className="recipe-actions">
                  <button
                    type="button"
                    className="btn-submit-review"
                    onClick={() => handleSubmitReview(recipe._id)}
                    disabled={!cookedIds.has(String(recipe._id))}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecipeGallery

