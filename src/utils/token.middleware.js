const { StatusCodes } = require('http-status-codes')
const jwt = require('jsonwebtoken')
const {PrismaClient} = require('@prisma/client')
const { logger } = require('./logger')
const prisma = new PrismaClient();


const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader? authHeader.split(' ')[1] : undefined
  const authToken = await getToken(token);
  if (authToken) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (error, token2) => {
      if (error) {
        await deleteToken(authToken)
        console.log(error.message)
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: "la sesion ha expirado" })
      }
      logger.info('token verificado')
      next()
    })
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "no existe una sesion" })
  }
}

const getToken = (token) => {
  if (token) {
    return prisma.authToken.findFirst({
       where: {
         token
       }
     })
  }
}
const deleteToken = (authToken) => {
   prisma.authToken.delete({
    where: {
        id: authToken.id
    }
});
}

module.exports = { verifyToken }