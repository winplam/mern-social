import config from '../config/config'
import mongoose from 'mongoose'
import app from './express'

// MongoDB Database Connection
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}
mongoose
  .connect(config.mongoUri, options)
  .catch(error => console.error(error))
mongoose.connection
  .on('error', error => { throw new Error(`Unable to connect to database: ${config.mongoUri}`) })
// mongoose.connection.on('error', console.error.bind(console, 'mongo connection error'))

app.listen(config.port, (err) => {
  if (err) {console.log(err)}
  console.log(`Example app listening at http://localhost:${config.port}`)
})
