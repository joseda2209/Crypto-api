const Joi = require('joi')

module.exports = {
    // Get /v1.0/users
    login: {
        payload: Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
        }).unknown(false)
    }
}