const cors = require('cors')
const express = require('express')
const helmet = require('helmet')

const { router } = require('./api/v1.0')

/**
* Express instance
* @public
*/
const app = express()

// parse body params and attache them to req.body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// secure apps by setting various HTTP headers
app.use(helmet())

// enable CORS - Cross Origin Resource Sharing
app.use(cors())

// mount api v1 routes
app.use('/v1.0', router)

module.exports = app
