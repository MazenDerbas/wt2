import httpContext from 'express-http-context'
import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import helmet from 'helmet'
import { randomUUID } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { router } from './api/routers/router.js'
import cors from 'cors'


try {
  // Creates an Express application.
  const app = express()

  // Get the directory name of this module's path.
  const directoryFullName = dirname(fileURLToPath(import.meta.url))

  const baseURL = process.env.BASE_URL || '/'

  // Serve static frontend files from the 'frontend' folder
  app.use(express.static(join(directoryFullName, '..', 'frontend')))


  // Parse requests of the content type application/x-www-form-urlencoded.
  // Populates the request object with a body object (req.body).
  app.use(express.urlencoded({ extended: false }))

  // --------------------------------------------------------------------------
  //
  // Webhook: Parse incoming requests with JSON payloads (application/json).
  // Populates the request object with a body object (req.body).
  //
  app.use(express.json())
  // --------------------------------------------------------------------------

  app.use(cors())

  // Serve static files.
  app.use(express.static(join(directoryFullName, '..', 'public')))

  // Setup and use session middleware (https://github.com/expressjs/session)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1) // trust first proxy
  }

  // Add the request-scoped context.
  // NOTE! Must be placed before any middle that needs access to the context!
  //       See https://www.npmjs.com/package/express-http-context.
  app.use(httpContext.middleware)


  // Middleware to be executed before the routes.
  app.use((req, res, next) => {
    // Add a request UUID to each request and store information about
    // each request in the request-scoped context.
    req.requestUuid = randomUUID()
    httpContext.set('request', req)


    res.locals.baseURL = baseURL

    next()
  })



  // Register routes.
  app.use('/', router)

  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
  }))


  // Starts the HTTP server listening for connections.
  const server = app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${server.address().port}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.log(err.message, { error: err })
  process.exitCode = 1
}
