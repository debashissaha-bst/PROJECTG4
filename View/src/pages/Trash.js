import { useEffect, useState } from 'react'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useAuthContext } from '../hooks/useAuthContext'
import ConfirmDialog from '../components/ConfirmDialog'

const Trash = () => {
  const { user } = useAuthContext()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [confirmPermanentId, setConfirmPermanentId] = useState(null)

  useEffect(() => {
    const fetchTrash = async () => {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/recipes/trash', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        const json = await response.json()
        if (!response.ok) {
          setError(json.error || 'Failed to load trash')
          return
        }
        setRecipes(Array.isArray(json) ? json : [])
      } catch (e) {
        setError('Failed to load trash')
      } finally {
        setLoading(false)
      }
    }

    fetchTrash()
  }, [user])

  const handleRestore = async (recipeId) => {
    if (!user) return
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`/api/recipes/${recipeId}/restore`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user.token}` }
      })
      const json = await response.json()
      if (!response.ok) {
        setError(json.error || 'Failed to restore recipe')
        return
      }
      setRecipes((prev) => prev.filter((r) => r._id !== json._id))
      setSuccess('Recipe restored')
    } catch (e) {
      setError('Failed to restore recipe')
    }
  }

  const handlePermanentDelete = async (recipeId) => {
    if (!user) return

    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`/api/recipes/${recipeId}/permanent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      })
      const json = await response.json()
      if (!response.ok) {
        setError(json.error || 'Failed to permanently delete recipe')
        return
      }
      setRecipes((prev) => prev.filter((r) => r._id !== json._id))
      setSuccess('Recipe permanently deleted')
      setConfirmPermanentId(null)
    } catch (e) {
      setError('Failed to permanently delete recipe')
    }
  }

  return (
    <div className="recipes-page">
      <div className="recipes recipes-list-column">
        <ConfirmDialog
          open={!!confirmPermanentId}
          title="Delete permanently?"
          message="This will permanently delete the recipe. This action cannot be undone."
          confirmText="Delete permanently"
          cancelText="Cancel"
          tone="danger"
          onCancel={() => setConfirmPermanentId(null)}
          onConfirm={() => handlePermanentDelete(confirmPermanentId)}
        />
        <h2>Trash</h2>
        {loading && <p>Loading...</p>}
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {!loading && recipes.length === 0 && !error && (
          <p>Trash is empty.</p>
        )}

        {recipes.map((recipe) => (
          <div key={recipe._id} className="recipe-details">
            <h4>{recipe.title}</h4>
            <p>
              <strong>Deleted: </strong>
              {recipe.trashedAt
                ? formatDistanceToNow(new Date(recipe.trashedAt), { addSuffix: true })
                : '—'}
            </p>
            <div className="recipe-actions">
              <button type="button" onClick={() => handleRestore(recipe._id)}>
                Restore
              </button>
              <button type="button" onClick={() => setConfirmPermanentId(recipe._id)}>
                Delete permanently
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Trash

