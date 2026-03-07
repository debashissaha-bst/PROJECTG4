import { useState } from "react"
import { useRecipesContext } from "../hooks/useRecipesContext"
import { useAuthContext } from '../hooks/useAuthContext'

const RecipeForm = () => {
  const { dispatch } = useRecipesContext()
  const { user } = useAuthContext()

  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '' }])
  const [instructions, setInstructions] = useState('')
  const [difficulty, setDifficulty] = useState('')
   const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState(null)
  const [emptyFields, setEmptyFields] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError('You must be logged in')
      return
    }

    // filter out completely empty ingredient rows
    const cleanedIngredients = ingredients.filter(
      (ing) => ing.name.trim() !== '' || ing.quantity.trim() !== ''
    )

    // front-end validation for ingredients
    const localEmptyFields = []
    if (!title) localEmptyFields.push('title')
    if (!time) localEmptyFields.push('time')
    if (cleanedIngredients.length === 0) localEmptyFields.push('ingredients')
    if (!instructions) localEmptyFields.push('instructions')
    if (!difficulty) localEmptyFields.push('difficulty')

    if (localEmptyFields.length > 0) {
      setEmptyFields(localEmptyFields)
      setError('Please fill in all required fields')
      return
    }

    const recipe = { title, time: Number(time), ingredients: cleanedIngredients, instructions, difficulty, isPublic }

    const response = await fetch('/api/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      }
    })
    const json = await response.json()

    if (!response.ok) {
      setError(json.error)
      setEmptyFields(json.emptyFields)
    }
    if (response.ok) {
      setTitle('')
      setTime('')
      setIngredients([{ name: '', quantity: '' }])
      setInstructions('')
      setDifficulty('')
      setIsPublic(false)
      setError(null)
      setEmptyFields([])
      dispatch({type: 'CREATE_RECIPE', payload: json})
    }
  }

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Add a New Recipe</h3>

      <label>Recipe name:</label>
      <input 
        type="text"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
        className={emptyFields.includes('title') ? 'error' : ''}
      />

      <label>Time (min):</label>
      <input 
        type="number"
        onChange={(e) => setTime(e.target.value)}
        value={time}
        className={emptyFields.includes('time') ? 'error' : ''}
      />

      <label>Ingredients:</label>
      {ingredients.map((row, index) => (
        <div key={index} className="ingredient-row">
          <input
            type="text"
            placeholder="Ingredient name"
            value={row.name}
            onChange={(e) => {
              const newIngredients = [...ingredients]
              newIngredients[index].name = e.target.value
              setIngredients(newIngredients)
            }}
            className={emptyFields.includes('ingredients') && !row.name ? 'error' : ''}
          />
          <input
            type="text"
            placeholder="Quantity"
            value={row.quantity}
            onChange={(e) => {
              const newIngredients = [...ingredients]
              newIngredients[index].quantity = e.target.value
              setIngredients(newIngredients)
            }}
            className={emptyFields.includes('ingredients') && !row.quantity ? 'error' : ''}
          />
          <button
            type="button"
            onClick={() => {
              if (ingredients.length === 1) return
              setIngredients(ingredients.filter((_, i) => i !== index))
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setIngredients([...ingredients, { name: '', quantity: '' }])}
      >
        Add Ingredient
      </button>

      <label>Instructions:</label>
      <textarea
        onChange={(e) => setInstructions(e.target.value)}
        value={instructions}
        className={emptyFields.includes('instructions') ? 'error' : ''}
      />

      <label>Difficulty level:</label>
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className={emptyFields.includes('difficulty') ? 'error' : ''}
      >
        <option value="">Select difficulty</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          style={{ width: 'auto', marginRight: '8px' }}
        />
        Make this recipe public
      </label>

      <button>Add Recipe</button>
      {error && <div className="error">{error}</div>}
    </form>
  )
}

export default RecipeForm
