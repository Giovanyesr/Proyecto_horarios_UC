const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username:      { type: String, required: true, unique: true, maxlength: 50, trim: true },
  email:         { type: String, required: true, unique: true, maxlength: 150, trim: true, lowercase: true },
  password_hash: { type: String, required: true },
  role:          { type: String, enum: ['admin', 'student'], required: true },
  is_active:     { type: Boolean, default: true },
  student_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  created_at:    { type: Date, default: Date.now },
}, { timestamps: false, versionKey: false })

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    if (ret.student_id) ret.student_id = ret.student_id.toString()
    delete ret._id
    delete ret.password_hash
    return ret
  },
})

module.exports = mongoose.model('User', userSchema)
