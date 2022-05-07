const { Router } = require('express')

const { router: userRouter } = require('./user/user.routes')
const { router: loginRouter} = require('./auth/auth.routes')
const { router: cryptoRouter} = require('./crypto/crypto.routes')
const {logger} = require('../../utils')

const router = Router()

/**
 * GET v1.0/status
 */
router.get('/status', (req, res) => {
  res.json({ status: 'OK' })
  logger.error('entro a status')

})

router.use('/', userRouter)
router.use('/',loginRouter)
router.use('/',cryptoRouter);

module.exports = {
  router
}
