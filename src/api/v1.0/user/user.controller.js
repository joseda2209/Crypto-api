const { createHash } = require('crypto')
const axios = require('axios').default;
const { PrismaClient } = require('@prisma/client')
const { ReasonPhrases, StatusCodes } = require('http-status-codes')

const { logger } = require('./../../../utils')

const prisma = new PrismaClient()

const getUserById = (id) => {
  return prisma.user.findUnique({
    where: {
      id
    },
  })
}

const create = async (req, res) => {
  logger.error('entro a create')
  try {
    const password = createHash('sha256', req.body.password).digest('hex')

    const user = await prisma.user.create({
      data: {
        ...req.body,
        password
      }
    })

    res.status(StatusCodes.CREATED).json(user)
  } catch (error) {
    logger.error(error)

    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  } finally {
    await prisma.$disconnect()
  }
}

const deleteById = async (req, res) => {
  try {
    const user = await getUserById(req.params.id)

    if (!user) {
      return res.sendStatus(StatusCodes.NOT_FOUND)
    }

    await prisma.user.delete({
      where: {
        id: req.params.id
      }
    })

    res.sendStatus(StatusCodes.NO_CONTENT)
  } catch (error) {
    logger.error(error)

    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  } finally {
    await prisma.$disconnect()
  }
}

const getAll = async (req, res) => {
  try {
    const users = await prisma.user.findMany()

    res.json(users)
  } catch (error) {
    logger.error(error)

    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  } finally {
    await prisma.$disconnect()
  }
}

const getById = async (req, res) => {
  try {
    const user = await getUserById(req.params.id)

    if (!user) {
      return res.sendStatus(StatusCodes.NOT_FOUND)
    }

    res.json(user)
  } catch (error) {
    logger.error(error)

    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  } finally {
    await prisma.$disconnect()
  }
}

const update = async (req, res) => {
  try {
    let user = await getUserById(req.params.id)

    if (!user) {
      return res.sendStatus(StatusCodes.NOT_FOUND)
    }

    user = await prisma.user.update({
      where: {
        id: req.params.id
      },
      data: req.body,
    })

    res.json(user)
  } catch (error) {
    logger.error(error)

    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  } finally {
    await prisma.$disconnect()
  }
}

const addFavoriteCoins = async (req, res) => {
  logger.error('entro a setFavoviteCoin')
  try {
    const userId = req.params.id;
    const coins = []
    for (const coinId of req.body) {
      const coinSaved = await getFavoriteCoin(userId, coinId)
      if (!coinSaved) {
        const coin = await prisma.favCoin.create({
          data: {
            userId,
            coinId
          }
        });
        coins.push(coin);
      } else {
        coins.push('la cryptomoneda ya se encuentra guardada como favorita')
      }
    }
    res.status(StatusCodes.CREATED).json(coins)
  } catch (error) {
    logger.error(error)
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  } finally {
    prisma.$disconnect()
  }

}

const getFavoriteCoinsByUserId = async (req, res) => {
  logger.info('entro a getFavoriteCoinsByUserId');
  try {
    const userId = req.params.id;
    const coins = await getFavoriteCoins(userId);
    const response = [];
    for (let coin of coins) {
      const coinloreResponse = await axios.get(`https://api.coinlore.net/api/ticker/?id=${coin.coinId}`)
      const coins = coinloreResponse.data.map((item) => {
        item.nameid = undefined;
        item.csupply = undefined;
        item.tsupply = undefined;
        item.msupply = undefined;
        return coin;
      });
      response.push(coins[0]);
    }
    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    logger.error(error);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  } finally {
    await prisma.$disconnect()
  }
}

const deleteFavoriteCoin = async (req, res) => {
  logger.info('entro a deleteFavoriteCoin');
  try {
    const userId = req.params.id;
    const coinId = req.body.coinId
    const coin = await getFavoriteCoin(userId, coinId)
    if (!coin) {
      res.sendStatus(StatusCodes.NOT_FOUND);
    }
    await prisma.favCoin.delete({
      where: {
        id: coin.id
      }
    });
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    logger.error(error);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  } finally {
    await prisma.$disconnect()
  }
}

const getFavoriteCoin = (userId, coinId) => {
  return prisma.favCoin.findFirst({
    where: {
      userId,
      coinId
    }
  })
}

const getFavoriteCoins = (userId) => {
  return prisma.favCoin.findMany({
    where: {
      userId
    }
  });
}

const getFavoriteExchange = (userId, exchangeId) => {
  return prisma.favExchange.findFirst({
    where: {
      userId,
      exchangeId
    }
  })
}

const getFavoriteExchanges = (userId) => {
  return prisma.favExchange.findMany({
    where: {
      userId
    }
  })
}

const addFavoriteExchange = async (req, res) => {
  try {
    const userId = req.params.id;
    const exchangeId = req.body.exchangeId
    const favoriteExchange = await getFavoriteExchange(userId,exchangeId)
    if(!favoriteExchange) {
      const favExchange = await prisma.favExchange.create({
        data: {
          userId,
          exchangeId
        }
      })
      res.status(StatusCodes.CREATED).json(favExchange);
    } else {
      res.status(StatusCodes.OK).send('exchange favorito ya existe')
    }
  } catch (error) {
    logger.error(error);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  } finally {
    await prisma.$disconnect()
  }
}

const getFavoriteExchangeByUserId = async (req, res) => {
  logger.info('entro a getFavoriteExchangeByUserId');
  try {
    const userId = req.params.id;
    const exchanges = await getFavoriteExchanges(userId);
    const response = [];
    for (let exchange of exchanges) {
      const coinloreResponse = await axios.get(`https://api.coinlore.net/api/exchange/?id=${exchange.exchangeId}`)
      coinloreResponse.data.pairs.length = 2;
      response.push(coinloreResponse.data);
    }
    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    logger.error(error);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  } finally {
    await prisma.$disconnect()
  }
}

const deleteFavoriteExchange = async (req, res) => {
  logger.info('entro a deleteFavoriteExchange');
  try {
    const userId = req.params.id;
    const exchangeId = req.body.exchangeId
    const exchange = await getFavoriteExchange(userId, exchangeId)
    if (!exchange) {
      res.sendStatus(StatusCodes.NOT_FOUND);
    }
    await prisma.favExchange.delete({
      where: {
        id: exchange.id
      }
    });
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    logger.error(error);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  } finally {
    await prisma.$disconnect()
  }
}

module.exports = {
  create,
  deleteById,
  getAll,
  getById,
  update,
  addFavoriteCoins,
  getFavoriteCoinsByUserId,
  deleteFavoriteCoin,
  addFavoriteExchange,
  getFavoriteExchangeByUserId,
  deleteFavoriteExchange
}
