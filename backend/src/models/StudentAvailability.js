const mongoose = require('mongoose')

const studentAvailabilitySchema = new mongoose.Schema({
  student_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  day_of_week: { type: Number, required: true },
  start_time:  { type: String, required: true, maxlength: 5 },
  end_time:    { type: String, required: true, maxlength: 5 },
}, { timestamps: false, versionKey: false })

studentAvailabilitySchema.index(
  { student_id: 1, day_of_week: 1, start_time: 1, end_time: 1 },
  { unique: true }
)

studentAvailabilitySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    ret.student_id = ret.student_id?.toString?.() ?? ret.student_id
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('StudentAvailability', studentAvailabilitySchema)
