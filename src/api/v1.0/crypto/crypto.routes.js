const express = require('express')
const { validate, verifyToken } = require('./../../../utils')
const controller = require('./crypto.controller')

const router = express.Router({
    strict: true
});

router.get('/coins', verifyToken, controller.getAllCoins)

router.get('/coins/:id',verifyToken, controller.getCoinById)

router.get('/markets/:id', verifyToken, controller.getMarketsById)

router.get('/exchanges', verifyToken, controller.getAllExchanges)

router.get('/exchange/:id',verifyToken, controller.getExchenge)

router.get('/socialstats/:id', verifyToken, controller.getSocialStatsById)

router.get('/news', verifyToken, controller.getAllNews)

module.exports = {
    router
}