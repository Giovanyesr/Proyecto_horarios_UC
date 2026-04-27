const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema({
  student_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  academic_period:  { type: String, required: true, maxlength: 20 },
  status:           { type: String, enum: ['enrolled', 'completed', 'dropped', 'failed'], default: 'enrolled' },
  enrolled_at:      { type: Date, default: Date.now },
}, { timestamps: false, versionKey: false })

enrollmentSchema.index({ student_id: 1, course_id: 1, academic_period: 1 }, { unique: true })

enrollmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    ret.student_id = ret.student_id?.toString?.() ?? ret.student_id
    ret.course_id  = ret.course_id?.toString?.()  ?? ret.course_id
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('Enrollment', enrollmentSchema)
