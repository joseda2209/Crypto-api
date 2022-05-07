const Joi = require('joi')
const { PrismaClient } = require('@prisma/client')

const { validationErrorDetails } = require('../../../utils/validation-error.details')

const prisma = new PrismaClient()

const userId = Joi.object({
  id: Joi.string().guid({ version: 'uuidv4' }).required()
})

const uniqueDocument = async (document) => {
  const user = await prisma.user.findUnique({
    where: {
      document
    }
  })
  if (user) {
    const message = `User with document ${document} aleady exist.`
    throw new Joi.ValidationError(
      message,
      validationErrorDetails('document', message)
    )
  }
  return true
}


const uniqueUsername = async (username) => {
  const user = await prisma.user.findUnique({
    where: {
      username
    }
  })
  if (user) {
    const message = `User with username ${username} aleady exist.`
    throw new Joi.ValidationError(
      message,
      validationErrorDetails('username', message)
    )
  }
  return true
}


module.exports = {
  // POST /v1.0/users
  create: {
    payload: Joi.object({
      name:     Joi.string().required(),     
      lastname: Joi.string().required(),
      password: Joi.string().required().min(8).max(36),
      username: Joi.string().required().external((username) => uniqueUsername(username)),
      document: Joi.string().required().external((document) => uniqueDocument(document))
    }).unknown(false)
  },
  deleteDyId: {
    // DELETE /v1.0/users/:id
    params: userId
  },
  getById: {
    // GET /v1.0/users/:id
    params: userId
  },
  // PATCH /v1.0/users/:id
  update: {
    params: userId,
    payload: Joi.object({
      name: Joi.string(),
      lastname: Joi.string(),
      password: Joi.string().min(8).max(36),
      username: Joi.string().external((username) => uniqueUsername(username)),
      document: Joi.string().external((document) => uniqueDocument(document))
    }).unknown(false)
  }
}
