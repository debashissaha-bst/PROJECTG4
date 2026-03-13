import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="home">
      <button className="go-recipes-btn" onClick={() => navigate('/recipes')}>
        Go to Recipe Page
      </button>
      <button className="go-recipes-btn" onClick={() => navigate('/gallery')}>
        Recipe Gallery
      </button>
      <button
        className="go-recipes-btn ai-chatbot-btn ai-chatbot-floating"
        onClick={() => navigate('/chat')}
      >
        AI Chatbot
      </button>
    </div>
  )
}

export default Home
