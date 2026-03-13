const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI. Create controller/.env with:')
  console.error('  MONGO_URI=mongodb://...')
  console.error('  PORT=4000')
  console.error('  SECRET=your-jwt-secret')
  process.exit(1)
}

const express = require('express')
const mongoose = require('mongoose')
const dns = require('node:dns')
const recipeRoutes = require('./routes/recipes')
const userRoutes = require('./routes/user')
const socialRoutes = require('./routes/social')
const chatRoutes = require('./routes/chat')

dns.setServers(['8.8.8.8', '8.8.4.4'])

const app = express()
app.use(express.json())
app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

app.use('/api/recipes', recipeRoutes)
app.use('/api/user', userRoutes)
app.use('/api/social', socialRoutes)
app.use('/api/chat', chatRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to Host:', mongoose.connection.host)
    app.listen(process.env.PORT, () => {
      console.log('listening for requests on port', process.env.PORT)
    })
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:')
    console.error(err.message)
  })
