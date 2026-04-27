const mongoose = require('mongoose')

const loginAttemptSchema = new mongoose.Schema({
  username:     { type: String, required: true, maxlength: 100, index: true },
  ip_address:   { type: String, required: true, maxlength: 45 },
  success:      { type: Boolean, required: true, default: false },
  attempted_at: { type: Date, default: Date.now },
}, { timestamps: false, versionKey: false })

loginAttemptSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema)
