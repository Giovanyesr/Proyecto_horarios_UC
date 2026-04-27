const mongoose = require('mongoose')

const classroomSchema = new mongoose.Schema({
  room_code:     { type: String, required: true, unique: true, maxlength: 20, trim: true },
  building:      { type: String, required: true, maxlength: 100, trim: true },
  capacity:      { type: Number, required: true },
  room_type:     { type: String, required: true, maxlength: 50, default: 'lecture' },
  has_projector: { type: Boolean, default: false },
  has_computers: { type: Boolean, default: false },
  is_active:     { type: Boolean, default: true },
}, { timestamps: false, versionKey: false })

classroomSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('Classroom', classroomSchema)
