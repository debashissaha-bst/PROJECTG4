import { useRecipesContext } from '../hooks/useRecipesContext'
import { useAuthContext } from '../hooks/useAuthContext'

// date fns
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const RecipeDetails = ({ recipe }) => {
  const { dispatch } = useRecipesContext()
  const { user } = useAuthContext()

  const handleClick = async () => {
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
    }
  }

  return (
    <div className="recipe-details">
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
      <p>{formatDistanceToNow(new Date(recipe.createdAt), { addSuffix: true })}</p>
      <span className="material-symbols-outlined" onClick={handleClick}>delete</span>
    </div>
  )
}

export default RecipeDetails
