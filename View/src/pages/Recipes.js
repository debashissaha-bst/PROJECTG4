import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecipesContext } from '../hooks/useRecipesContext'
import { useAuthContext } from '../hooks/useAuthContext'

import RecipeDetails from '../components/RecipeDetails'
import RecipeForm from '../components/RecipeForm'

const Recipes = () => {
  const { recipes, dispatch } = useRecipesContext()
  const { user } = useAuthContext()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchRecipes = async () => {
      const query = searchTerm.trim()
        ? `?search=${encodeURIComponent(searchTerm.trim())}`
        : ''

      const response = await fetch(`/api/recipes${query}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      const json = await response.json()

      if (response.ok) {
        dispatch({ type: 'SET_RECIPES', payload: json })
      }
    }

    if (user) {
      fetchRecipes()
    }
  }, [dispatch, user, searchTerm])

  return (
    <div className="recipes-page">
      <div className="recipes recipes-list-column">
        <div className="recipes-toolbar">
          <h2 className="recipes-title">Recipes</h2>
          <Link to="/trash" className="recipes-trash-link">
            Trash
          </Link>
        </div>
        <div className="recipe-search-bar">
          <input
            type="text"
            value={searchTerm}
            placeholder="Search by recipe name or ingredient..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {recipes &&
          recipes.map((recipe) => (
            <RecipeDetails key={recipe._id} recipe={recipe} />
          ))}
        {recipes && recipes.length === 0 && (
          <p>No recipes found for your search.</p>
        )}
      </div>
      <div className="recipes-form-column">
        <RecipeForm />
      </div>
    </div>
  )
}

export default Recipes

