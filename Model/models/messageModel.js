const mongoose = require('mongoose')

const Schema = mongoose.Schema

const messageSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Message', messageSchema)

