const express = require('express')

const { validate, verifyToken } = require('./../../../utils')

const controller = require('./user.controller')
const validations = require('./user.validations')

const router = express.Router({
  strict: true
})

router.post('/users', validate(validations.create), controller.create)

router.get('/users', verifyToken, controller.getAll)

router.get('/users/:id', [verifyToken, validate(validations.getById)], controller.getById)

router.delete('/users/:id', [verifyToken, validate(validations.deleteDyId)], controller.deleteById)

router.patch('/users/:id', [verifyToken, validate(validations.update)], controller.update)

router.post('/user/:id/coins/addFavorite', verifyToken, controller.addFavoriteCoins)
router.get('/user/:id/coins/getFavoriteCoins', verifyToken, controller.getFavoriteCoinsByUserId)
router.delete('/user/:id/coin/deleteFavoriteCoin',verifyToken, controller.deleteFavoriteCoin)

router.post('/user/:id/exchange/addFavorite', verifyToken, controller.addFavoriteExchange)
router.get('/user/:id/exchange/getFavorite', verifyToken, controller.getFavoriteExchangeByUserId)
router.delete('/user/:id/exchange/deleteFavorite', verifyToken, controller.deleteFavoriteExchange)
module.exports = {
  router
}
