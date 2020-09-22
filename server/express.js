import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import compress from 'compression'
import helmet from 'helmet'
import path from 'path'
import devBundle from './devBundle'
import template from './template'
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
import postRoutes from './routes/post.routes'
/* BEGIN: modules for server side rendering */
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles'
import theme from './../client/theme'
import MainRouter from '../client/MainRouter'
/* END: modules for server side rendering */

const app = express()
const CURRENT_WORKING_DIR = process.cwd()
devBundle.compile(app)

app.use(bodyParser.json()) // for parsing application/json
// app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())
app.use(cors())
app.use(compress())
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')))

app.use('/', userRoutes)
app.use('/', authRoutes)
app.use('/', postRoutes)

app.get('*', (req, res) => {
  const sheets = new ServerStyleSheets()
  const context = {}
  const markup = ReactDOMServer.renderToString(
    sheets.collect(
      <StaticRouter location={req.url} context={context}>
         <ThemeProvider theme={theme}>
           <MainRouter/>
         </ThemeProvider>
       </StaticRouter>
    )
  )
  if (context.url) {
    return res.redirect(303, context.url)
  }
  const css = sheets.toString()
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
