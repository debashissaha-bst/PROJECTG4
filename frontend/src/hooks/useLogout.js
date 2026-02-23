import { useAuthContext } from './useAuthContext'
import { useRecipesContext } from './useRecipesContext'

export const useLogout = () => {
  const { dispatch } = useAuthContext()
  const { dispatch: dispatchRecipes } = useRecipesContext()

  const logout = () => {
    // remove user from storage
    localStorage.removeItem('user')

    // dispatch logout action
    dispatch({ type: 'LOGOUT' })
    dispatchRecipes({ type: 'SET_RECIPES', payload: null })
  }

  return { logout }
}