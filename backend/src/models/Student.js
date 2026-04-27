const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
  student_code:       { type: String, required: true, unique: true, maxlength: 20, trim: true },
  first_name:         { type: String, required: true, maxlength: 100, trim: true },
  last_name:          { type: String, required: true, maxlength: 100, trim: true },
  email:              { type: String, required: true, unique: true, maxlength: 150, trim: true, lowercase: true },
  semester:           { type: Number, required: true },
  is_active:          { type: Boolean, default: true },
  max_credits:        { type: Number, default: 22 },
  academic_status:    { type: String, enum: ['active', 'probation', 'resting'], default: 'active' },
  mandatory_course_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  created_at:         { type: Date, default: Date.now },
  updated_at:         { type: Date, default: Date.now },
}, { timestamps: false, versionKey: false })

studentSchema.pre('save', function (next) {
  this.updated_at = new Date()
  next()
})

studentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    if (ret.mandatory_course_id) ret.mandatory_course_id = ret.mandatory_course_id.toString()
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('Student', studentSchema)
