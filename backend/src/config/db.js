const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/horarios_uc')
    console.log(`[MongoDB] Connected: ${conn.connection.host}`)

    mongoose.set('toJSON', {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    })
  } catch (err) {
    console.error('[MongoDB] Connection error:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
