const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  dob: { type: String },
  gender: { type: String },
  city: { type: String },
  dietaryPreference: { type: String },
  nutritionGoal: {
    type: String,
    enum: ['Weight loss', 'High protein', 'Quick meals', 'Balanced diet', 'Gourmet', ''],
    default: ''
  },
  dietaryRestrictions: {
    type: [String],
    default: []
  },
  cuisinePreference: {
    type: String,
    enum: ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'Indian', ''],
    default: ''
  },
  dailyCalorieTarget: { type: Number },
  points: { type: Number, default: 0 },
  recipesSharedCount: { type: Number, default: 0 },
  recipesCookedCount: { type: Number, default: 0 }
})

userSchema.statics.signup = async function(email, password, name, dob, gender, city, dietaryPreference) {
  if (!email || !password) throw Error('Email and password must be filled')
  if (!validator.isEmail(email)) throw Error('Email not valid')
  if (!validator.isStrongPassword(password)) throw Error('Password not strong enough')
  const exists = await this.findOne({ email })
  if (exists) throw Error('Email already in use')
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  return await this.create({ email, password: hash, name, dob, gender, city, dietaryPreference })
}

userSchema.statics.login = async function(email, password) {
  if (!email || !password) throw Error('All fields must be filled')
  const user = await this.findOne({ email })
  if (!user) throw Error('Incorrect email')
  const match = await bcrypt.compare(password, user.password)
  if (!match) throw Error('Incorrect password')
  return user
}

module.exports = mongoose.model('User', userSchema)
