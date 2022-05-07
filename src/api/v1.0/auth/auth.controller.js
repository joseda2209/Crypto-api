const {createHash} = require('crypto')
const { PrismaClient } = require('@prisma/client')
const { ReasonPhrases, StatusCodes } = require('http-status-codes')
const jwt = require('jsonwebtoken')

const { logger } = require('../../../utils')
const { ServerResponse } = require('http')

const prisma = new PrismaClient()

const login = async (req, res) => {
    try {
        const password = createHash('sha256', req.body.password).digest('hex')
        const username = req.body.username;
        const user = await prisma.user.findFirst({
            where: {
                username,
                password
            },
        })
        if(user) {
            const token = generateAccessToken(username, process.env.TOKEN_SECRET, process.env.TOKEN_EXPIRATION);
            await saveToken(token);
            res.json({token: token});
        } else {
            res.status(StatusCodes.NOT_FOUND).send({error: 'Datos de ingreso invalidos'});
        }
    }
    catch(err){
        logger.error(err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({error: ReasonPhrases.INTERNAL_SERVER_ERROR})
    } finally {
        await prisma.$disconnect
    }
}

const generateAccessToken = (email, tokenSecret, tokenExpiration) => {
    return jwt.sign({email: email}, tokenSecret, { expiresIn: process.env.TOKEN_EXPIRATION });
}
const saveToken = token => {
    return prisma.authToken.create({data: {
        token
    }})
}

const logout = async (req,res) => {
    try {
        logger.error('entra al logout')
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const authToken = await getAuthToken(token);
        if (authToken) {
            await prisma.authToken.delete({
                where: {
                    id: authToken.id
                }
            });
        }
        res.sendStatus(StatusCodes.NO_CONTENT)
    } catch (error) {
        logger.error(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    } finally {
        await prisma.$disconnect
    }
}
const getAuthToken = token => {
    return prisma.authToken.findFirst({
        where: {
            token
        }
    })
}

module.exports = { 
    login,
    logout
 }