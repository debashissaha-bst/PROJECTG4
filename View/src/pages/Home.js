import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="home">
      <button className="go-recipes-btn" onClick={() => navigate('/recipes')}>
        Go to Recipe Page
      </button>
    </div>
  )
}

export default Home
