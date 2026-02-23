import { useState } from "react"
import { useLogin } from "../hooks/useLogin"

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const {login, error, isLoading} = useLogin()

  const handleSubmit = async (e) => {
    e.preventDefault()

    await login(email, password)
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h3>Log In</h3>
      
      <label>Email address:</label>
      <input 
        type="email" 
        onChange={(e) => setEmail(e.target.value)} 
        value={email} 
      />
      <label>Password:</label>
      <div className="password-input-wrapper">
        <input 
          type={showPassword ? 'text' : 'password'} 
          onChange={(e) => setPassword(e.target.value)} 
          value={password} 
        />
        <button
          type="button"
          className="toggle-password"
          onClick={() => setShowPassword(prev => !prev)}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      <button disabled={isLoading}>Log in</button>
      {error && <div className="error">{error}</div>}
    </form>
  )
}

export default Login