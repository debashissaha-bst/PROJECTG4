import { useEffect, useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import ConfirmDialog from '../components/ConfirmDialog'

const Favourites = () => {
  const { user } = useAuthContext()
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmRemoveId, setConfirmRemoveId] = useState(null)

  useEffect(() => {
    const fetchFavourites = async () => {
      if (!user) return
      setLoading(true)
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
      } finally {
        setLoading(false)
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
      setConfirmRemoveId(null)
    } catch (e) {
      setError('Failed to remove favourite')
    }
  }

  if (!user) return <p>You must be logged in to view this page.</p>

  return (
    <div className="fav-shell">
      <ConfirmDialog
        open={!!confirmRemoveId}
        title="Remove favourite?"
        message="This recipe will be removed from your favourites list."
        confirmText="Remove"
        cancelText="Cancel"
        tone="danger"
        onCancel={() => setConfirmRemoveId(null)}
        onConfirm={() => handleRemove(confirmRemoveId)}
      />
      <div className="fav-hero">
        <div>
          <h2>Favourite Recipes</h2>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {loading && <p className="fav-empty">Loading favourites...</p>}
      {!loading && items.length === 0 && !error && <p className="fav-empty">No favourites yet.</p>}

      {!loading && items.length > 0 && (
        <div className="fav-grid">
          {items.map((item) => (
            <div className="fav-card" key={item._id}>
              <div className="fav-card-head">
                <h4>{item.recipe?.title || 'Untitled recipe'}</h4>
                <span className="fav-pill">Favourite</span>
              </div>

              <div className="fav-meta">
                <div><strong>Time:</strong> {item.recipe?.time ? `${item.recipe.time} minutes` : '—'}</div>
                <div><strong>Difficulty:</strong> {item.recipe?.difficulty || '—'}</div>
                <div><strong>Shared by:</strong> {item.recipe?.ownerEmail || '—'}</div>
              </div>

              <div className="fav-actions">
                <button type="button" className="fav-btn fav-btn--danger" onClick={() => setConfirmRemoveId(item.recipe?._id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Favourites

