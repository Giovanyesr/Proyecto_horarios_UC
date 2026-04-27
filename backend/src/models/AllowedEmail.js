const mongoose = require('mongoose')

const allowedEmailSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, maxlength: 150, trim: true, lowercase: true },
  student_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  added_by_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  is_used:      { type: Boolean, default: false },
  notes:        { type: String, default: null },
  created_at:   { type: Date, default: Date.now },
}, { timestamps: false, versionKey: false })

allowedEmailSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    if (ret.student_id)  ret.student_id  = ret.student_id.toString()
    if (ret.added_by_id) ret.added_by_id = ret.added_by_id.toString()
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('AllowedEmail', allowedEmailSchema)
