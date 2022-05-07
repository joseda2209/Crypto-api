const axios = require('axios').default
const { PrismaClient } = require('@prisma/client')
const { StatusCodes } = require('http-status-codes')
const fs = require('fs').promises;
const { logger } = require('./../../../utils')

const prisma = new PrismaClient()
const CACHE_LIFE = 60000
const COIN_FILE_PATH = './cache/coins.json';

const getAllCoins = async (req, res) => {
    let coinFile;
    try {
        coinFile = await fs.open(COIN_FILE_PATH)
    } catch {
        logger.info('no existe el archivo')
        const data = await getAllCoinsFromCoinlore(req.param.start, req.param.limit);
        await fs.writeFile(COIN_FILE_PATH, JSON.stringify(data))
        return res.status(StatusCodes.OK).json(data);
    }

    try {
        if (coinFile) {
            const statsCoinFile = await coinFile.stat();
            if (statsCoinFile.mtimeMs > Date.now() - CACHE_LIFE) {
                const readCoinFile = await coinFile.readFile();
                res.status(StatusCodes.OK).json(JSON.parse(readCoinFile));
            } else {
                logger.info('el archivo supero el tiempo de vida')
               const data = await getAllCoinsFromCoinlore(req.param.start, req.param.limit);
               await fs.writeFile(COIN_FILE_PATH, JSON.stringify(data))
               res.status(StatusCodes.OK).json(data);
            }
            
        }
    } catch (error) {
        logger.error(error);
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    } finally {
        await coinFile.close();
    }
}

const getAllCoinsFromCoinlore = async (start, limit) => {
    try {
        logger.info('obteniendo datos de coinlore')

        const response = await axios.get(`https://api.coinlore.net/api/tickers/?start=${start}&limit=${limit}`);
        return response.data.data.map((coin) => {
            coin.nameid = undefined;
            coin.csupply = undefined;
            coin.tsupply = undefined;
            coin.msupply = undefined;
            return coin;
        })
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

const getCoinById = async (req, res) => {
    try {
        const id = req.params.id;

        const response = await axios.get(`https://api.coinlore.net/api/ticker/?id=${id}`)

        if (response.data.legth < 1) {
            return res.sendStatus(StatusCodes.NOT_FOUND)
        }

        const coins = response.data.map((coin) => {
            coin.nameid = undefined;
            coin.csupply = undefined;
            coin.tsupply = undefined;
            coin.msupply = undefined;
            return coin;
        });

        res.status(StatusCodes.OK).json(coins[0])
    } catch (error) {
        logger.error(error)

        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

const getMarketsById = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`https://api.coinlore.net/api/coin/markets/?id=${id}`)

        if (response.data.legth < 1) {
            return res.sendStatus(StatusCodes.NOT_FOUND)
        }

        const markets = response.data.map((market) => {
            market.time = undefined;
            return market;
        });

        res.status(StatusCodes.OK).json(markets)
    } catch (error) {
        logger.error(error)

        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

const getAllExchanges = async (req, res) => {
    try {

        const response = await axios.get(`https://api.coinlore.net/api/exchanges/`)
        console.log(response.data)
        const exchanges = Object.values(response.data).map(({id,name,volume_usd, pairs, url, country}) => {
            return { id, name, volume_usd, pairs, url, country}
        });
        
        res.status(StatusCodes.OK).json(exchanges)
    } catch (error) {
        logger.error(error)

        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

const getExchenge = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`https://api.coinlore.net/api/exchange/?id=${id}`)
        console.log(response.data)
        res.status(StatusCodes.OK).json(response.data)
    } catch (error) {
        logger.error(error)

        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }

}

const getSocialStatsById = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`https://api.coinlore.net/api/coin/social_stats/?id=${id}`)

        if (response.data.legth < 1) {
            return res.sendStatus(StatusCodes.NOT_FOUND)
        }
        console.log(response.data)
        res.status(StatusCodes.OK).json(response.data)
    } catch (error) {
        logger.error(error)

        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

const getAllNews = async (req, res) => {
    try {
        const skip = req.query.start;
        const limit = req.query.limit;

        const response = await axios.get(`https://api.coinstats.app/public/v1/news?skip=${skip}&limit=${limit}`)
        // const news = response.data.data.map((new) => {
        //     coin.nameid = undefined;
        //     coin.csupply = undefined;
        //     coin.tsupply = undefined;
        //     coin.msupply = undefined;
        //     return coin;
        // })
        res.status(StatusCodes.OK).json(response.data.news)
    } catch (error) {
        logger.error(error)

        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

module.exports = {
    getAllCoins,
    getCoinById,
    getAllExchanges,
    getExchenge,
    getAllNews,
    getSocialStatsById,
    getMarketsById
}