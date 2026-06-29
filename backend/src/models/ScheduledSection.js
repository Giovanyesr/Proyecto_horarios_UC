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

function splitPopulated(ret, idField, docField) {
  const v = ret[idField]
  if (v && typeof v === 'object' && !(v instanceof mongoose.Types.ObjectId)) {
    ret[docField] = v
    ret[idField] = v.id ?? v._id?.toString() ?? String(v)
  } else if (v != null) {
    ret[idField] = v.toString()
  }
}

scheduledSectionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    splitPopulated(ret, 'run_id',       'run')
    splitPopulated(ret, 'course_id',    'course')
    splitPopulated(ret, 'teacher_id',   'teacher')
    splitPopulated(ret, 'classroom_id', 'classroom')
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('ScheduledSection', scheduledSectionSchema)
