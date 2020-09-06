import express from 'express'
import bodyParser from 'body-parser'
// import cookieParser from 'cookie-parser'
import cors from 'cors'
import compress from 'compression'
import helmet from 'helmet'
// import path from 'path'
import devBundle from './devBundle'
import template from './template'
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
// import postRoutes from './routes/post.routes'
// modules for server side rendering
// import MainRouter from '../client/MainRouter'

const app = express()
// const CURRENT_WORKING_DIR = process.cwd()
devBundle.compile(app)

app.use(bodyParser.json()) // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
// app.use(cookieParser())
app.use(cors())
app.use(compress())
app.use(helmet())
// app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')))

app.use('/', userRoutes)
app.use('/', authRoutes)
// app.use('/', postRoutes)

app.get('*', (req, res) => {
  const markup = ('<h1>Markup from express.js 0</h1>')
  const css = ('body {background-color: #ffffff;}')
  res.status(200).send(template({
    markup: markup,
    css: css
  }))
})

// catch unauthorised errors
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ 'error': err.name + ': ' + err.message })
  } else if (err) {
    res.status(400).json({ 'error': err.name + ': ' + err.message })
    console.log(err)
  }
})

export default app
