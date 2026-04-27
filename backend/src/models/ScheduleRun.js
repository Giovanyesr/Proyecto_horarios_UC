const mongoose = require('mongoose')

const scheduleRunSchema = new mongoose.Schema({
  academic_period: { type: String, required: true, maxlength: 20 },
  status:          { type: String, enum: ['running', 'completed', 'failed'], required: true, default: 'running' },
  solver_config:   { type: String, default: '{}' },
  nodes_explored:  { type: Number, default: null },
  duration_ms:     { type: Number, default: null },
  error_message:   { type: String, default: null },
  created_at:      { type: Date, default: Date.now },
}, { timestamps: false, versionKey: false })

scheduleRunSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('ScheduleRun', scheduleRunSchema)
