const mongoose = require('mongoose')

const scheduledSectionSchema = new mongoose.Schema({
  run_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduleRun', required: true },
  course_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  classroom_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  day_of_week:    { type: Number, required: true },
  start_time:     { type: String, required: true, maxlength: 5 },
  end_time:       { type: String, required: true, maxlength: 5 },
  section_number: { type: Number, default: 1 },
}, { timestamps: false, versionKey: false })

scheduledSectionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    ret.run_id       = ret.run_id?.toString?.()       ?? ret.run_id
    ret.course_id    = ret.course_id?.toString?.()    ?? ret.course_id
    ret.teacher_id   = ret.teacher_id?.toString?.()   ?? ret.teacher_id
    ret.classroom_id = ret.classroom_id?.toString?.() ?? ret.classroom_id
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('ScheduledSection', scheduledSectionSchema)
