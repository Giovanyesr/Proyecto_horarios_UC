const mongoose = require('mongoose')

const teacherAvailabilitySchema = new mongoose.Schema({
  teacher_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  day_of_week: { type: Number, required: true },
  start_time:  { type: String, required: true, maxlength: 5 },
  end_time:    { type: String, required: true, maxlength: 5 },
}, { timestamps: false, versionKey: false })

teacherAvailabilitySchema.index(
  { teacher_id: 1, day_of_week: 1, start_time: 1, end_time: 1 },
  { unique: true }
)

teacherAvailabilitySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    ret.teacher_id = ret.teacher_id?.toString?.() ?? ret.teacher_id
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('TeacherAvailability', teacherAvailabilitySchema)
