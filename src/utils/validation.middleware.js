const { ReasonPhrases, StatusCodes } = require('http-status-codes')

const validateOptions = {
  abortEarly: false // include all errors
}

/**
 * Give format to the Joi error object
 *
 * @param {object} error
 * @param {string} source
 * @returns {object}
 */
const formatError = (error, source) => {
  const { details } = error
  const errors = details.map((item) => {
    return {
      key: item.context.key,
      message: item.message
    }
  })

  return {
    status: StatusCodes.BAD_REQUEST,
    title: ReasonPhrases.BAD_REQUEST,
    details: {
      source,
      errors
    }
  }
}

/**
 *
 * @param {object} schema Joi schema
 * @returns {Function} The validation middleware
 */
const validate = (schema) => {
  return async (req, res, next) => {
    if (schema.params !== undefined) {
      const { error } = await schema.params
        .validateAsync(req.params, validateOptions)
        .catch(error => {
          return { error }
        })

      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json(formatError(error, 'params'))
      }
    }

    if (schema.query !== undefined) {
      const { error } = await schema.query
        .validateAsync(req.query, validateOptions)
        .catch(error => {
          return { error }
        })

      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json(formatError(error, 'query'))
      }
    }

    if (schema.payload !== undefined) {
      const { error } = await schema.payload
        .validateAsync(req.body, validateOptions)
        .catch(error => {
          return { error }
        })

      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json(formatError(error, 'payload'))
      }
    }

    next()
  }
}

module.exports = {
  validate
}
