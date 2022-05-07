const http = require('http');

const app = require('../../src/app');
const { logger } = require('./../../src/utils');

// Get port from environment and store in Express.
const port = process.env.PORT || 3000

app.set('port', port)

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')

  app.close(() => {
    logger.info('HTTP server closed')
  })
})

/**
 * Event listener for HTTP server "error" event.
 */
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`)

      process.exit(1)
      break
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`)

      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
  const address = server.address()
  const bind = typeof address === 'string'
    ? `pipe ${address}`
    : `port ${address.port}`

  logger.info(`Listening on ${address.address} ${bind}`)
}

// Create HTTP server.
const server = http.createServer(app)

server.listen(port, '::')
server.on('error', onError)
server.on('listening', onListening)