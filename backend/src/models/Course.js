const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  course_code:        { type: String, required: true, unique: true, maxlength: 20, trim: true },
  name:               { type: String, required: true, maxlength: 200, trim: true },
  credits:            { type: Number, required: true },
  hours_per_week:     { type: Number, required: true },
  semester_level:     { type: Number, required: true },
  required_room_type: { type: String, maxlength: 50, default: 'lecture' },
  min_students:       { type: Number, default: 5 },
  max_students:       { type: Number, required: true },
  department:         { type: String, required: true, maxlength: 100, trim: true },
  is_active:          { type: Boolean, default: true },
  prerequisites:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: false, versionKey: false })

courseSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    if (Array.isArray(ret.prerequisites)) {
      ret.prerequisites = ret.prerequisites.map(p =>
        typeof p === 'object' && p._id ? { ...p, id: p._id.toString() } : p.toString()
      )
    }
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('Course', courseSchema)
