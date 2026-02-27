import { useState } from "react"
import { useSignup } from "../hooks/useSignup"

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('')
  const [dietaryPreference, setDietaryPreference] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const {signup, error, isLoading} = useSignup()

  const handleSubmit = async (e) => {
    e.preventDefault()

    await signup(email, password, name, dob, gender, city, dietaryPreference)
  }

  return (
    <form className="signup" onSubmit={handleSubmit}>
      <h3>Sign Up</h3>
      
      <label>Name:</label>
      <input 
        type="text" 
        onChange={(e) => setName(e.target.value)} 
        value={name} 
      />

      <label>Date of Birth:</label>
      <input 
        type="date" 
        onChange={(e) => setDob(e.target.value)} 
        value={dob} 
      />

      <label>Gender:</label>
      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      >
        <option value="">Select gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <label>City:</label>
      <input 
        type="text" 
        onChange={(e) => setCity(e.target.value)} 
        value={city} 
      />

      <label>Dietary preferences:</label>
      <select
        value={dietaryPreference}
        onChange={(e) => setDietaryPreference(e.target.value)}
      >
        <option value="">Select preference</option>
        <option value="Vegetarian">Vegetarian</option>
        <option value="Vegan">Vegan</option>
        <option value="Non-vegetarian">Non-vegetarian</option>
        <option value="Pescatarian">Pescatarian</option>
      </select>

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

      <button disabled={isLoading}>Sign up</button>
      {error && <div className="error">{error}</div>}
    </form>
  )
}

export default Signup
