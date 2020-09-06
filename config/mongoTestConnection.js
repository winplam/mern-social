import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongoServer = new MongoMemoryServer()

module.exports = {
  connect: () => {
    mongoServer.getUri().then((mongoUri) => {
      const mongooseOpts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }

      mongoose.connect(mongoUri, mongooseOpts)

      mongoose.connection.on('error', e => {
        if (e.message.code === 'ETIMEDOUT') {
          console.log(e)
          mongoose.connect(mongoUri, mongooseOpts)
        }
        console.log(e)
      })

      mongoose.connection.once('open', () => {
        // console.log(`MongoDB successfully connected to ${mongoUri}`)
      })
    })
  },

  disconnect: async (done) => {
    mongoose.disconnect(done)
    await mongoServer.stop()
  }
}
