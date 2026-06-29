const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema({
  student_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  academic_period:  { type: String, required: true, maxlength: 20 },
  status:           { type: String, enum: ['enrolled', 'completed', 'dropped', 'failed'], default: 'enrolled' },
  enrolled_at:      { type: Date, default: Date.now },
}, { timestamps: false, versionKey: false })

enrollmentSchema.index({ student_id: 1, course_id: 1, academic_period: 1 }, { unique: true })

function splitPopulated(ret, idField, docField) {
  const v = ret[idField]
  if (v && typeof v === 'object' && !(v instanceof mongoose.Types.ObjectId)) {
    ret[docField] = v
    ret[idField] = v.id ?? v._id?.toString() ?? String(v)
  } else if (v != null) {
    ret[idField] = v.toString()
  }
}

enrollmentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    splitPopulated(ret, 'student_id', 'student')
    splitPopulated(ret, 'course_id', 'course')
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('Enrollment', enrollmentSchema)
