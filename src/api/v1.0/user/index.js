const controller = require('./user.controller')
const router = require('./user.routes')
const validation = require('./user.validations')

module.exports = {
    router,
    controller,
    validation
}