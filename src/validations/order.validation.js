const Joi = require('joi');

const createOrder = {
    body: Joi.object().keys({
        items: Joi.array().items(
            Joi.object().keys({
                product: Joi.string().required(),
                quantity: Joi.number().required().min(1),
                startDate: Joi.date().required(),
                endDate: Joi.date().required().greater(Joi.ref('startDate')),
            })
        ).required().min(1),
    }),
};

module.exports = {
    createOrder,
};
