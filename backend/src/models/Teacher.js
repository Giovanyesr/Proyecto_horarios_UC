const mongoose = require('mongoose')

const teacherSchema = new mongoose.Schema({
  teacher_code:       { type: String, required: true, unique: true, maxlength: 20, trim: true },
  first_name:         { type: String, required: true, maxlength: 100, trim: true },
  last_name:          { type: String, required: true, maxlength: 100, trim: true },
  email:              { type: String, required: true, unique: true, maxlength: 150, trim: true, lowercase: true },
  department:         { type: String, required: true, maxlength: 100, trim: true },
  max_hours_per_week: { type: Number, default: 20 },
  is_active:          { type: Boolean, default: true },
  created_at:         { type: Date, default: Date.now },
  updated_at:         { type: Date, default: Date.now },
}, { timestamps: false, versionKey: false })

teacherSchema.pre('save', function (next) {
  this.updated_at = new Date()
  next()
})

teacherSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('Teacher', teacherSchema)
