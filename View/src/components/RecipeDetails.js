import { useRecipesContext } from '../hooks/useRecipesContext'
import { useAuthContext } from '../hooks/useAuthContext'
import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

// date fns
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const RecipeDetails = ({ recipe, hideDelete, onLike, onFavourite, favouriteLabel = 'Save to favourite' }) => {
  const { dispatch } = useRecipesContext()
  const { user } = useAuthContext()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleTrash = async () => {
    if (!user) {
      return
    }

    const response = await fetch('/api/recipes/' + recipe._id, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    })
    const json = await response.json()

    if (response.ok) {
      dispatch({type: 'DELETE_RECIPE', payload: json})
      setConfirmOpen(false)
    }
  }

  const handleToggleVisibility = async () => {
    if (!user) {
      return
    }

    const response = await fetch('/api/recipes/' + recipe._id + '/visibility', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify({ isPublic: !recipe.isPublic })
    })

    const json = await response.json()

    if (response.ok) {
      dispatch({ type: 'UPDATE_RECIPE', payload: json })
    }
  }

  return (
    <div className="recipe-details">
      <ConfirmDialog
        open={confirmOpen}
        title="Move to Trash?"
        message="This recipe will be moved to Trash. You can restore it later from the Trash page."
        confirmText="Move to Trash"
        cancelText="Cancel"
        tone="danger"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleTrash}
      />
      <h4>{recipe.title}</h4>
      <p><strong>Time: </strong>{recipe.time} minutes</p>
      {Array.isArray(recipe.ingredients) && (
        <div>
          <p><strong>Ingredients Required:</strong></p>
          <ul>
            {recipe.ingredients.map((ing, index) => (
              <li key={index}>
                {ing.name} - {ing.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}
      {recipe.instructions && (
        <p><strong>Instructions: </strong>{recipe.instructions}</p>
      )}
      {recipe.difficulty && (
        <p><strong>Difficulty: </strong>{recipe.difficulty}</p>
      )}
      {recipe.ownerEmail && (
        <p><strong>Shared by: </strong>{recipe.ownerEmail}</p>
      )}
      {typeof recipe.isPublic === 'boolean' && (
        <p><strong>Visibility: </strong>{recipe.isPublic ? 'Public' : 'Private'}</p>
      )}
      {typeof recipe.likes === 'number' && (
        <p><strong>Likes: </strong>{recipe.likes}</p>
      )}
      <p>{formatDistanceToNow(new Date(recipe.createdAt), { addSuffix: true })}</p>
      <div className="recipe-actions">
        {!hideDelete && (
          <span className="material-symbols-outlined" onClick={() => setConfirmOpen(true)}>delete</span>
        )}
        {!hideDelete && typeof recipe.isPublic === 'boolean' && (
          <button type="button" onClick={handleToggleVisibility}>
            {recipe.isPublic ? 'Make Private' : 'Make Public'}
          </button>
        )}
        {onLike && (
          <button type="button" className="btn-like" onClick={onLike}>
            Like
          </button>
        )}
        {onFavourite && (
          <button type="button" className="btn-favourite" onClick={onFavourite}>
            {favouriteLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default RecipeDetails
