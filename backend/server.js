require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const dns = require('node:dns'); // Add this
const workoutRoutes = require('./routes/workouts')

// FORCE GOOGLE DNS: This bypasses Dot Internet's DNS issues
dns.setServers(['8.8.8.8', '8.8.4.4']); 

// express app
const app = express()

// middleware
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/workouts', workoutRoutes)

// connect to db
// Added a few options to help with stable connections
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