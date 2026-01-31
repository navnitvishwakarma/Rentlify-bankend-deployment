const Joi = require('joi');

const createProduct = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required(),
        category: Joi.string().required(),
        images: Joi.array().items(Joi.string().uri()),
        pricing: Joi.object().keys({
            hourly: Joi.number(),
            daily: Joi.number().required(),
            weekly: Joi.number(),
            deposit: Joi.number(),
        }).required(),
        totalQuantity: Joi.number().required().min(0),
        attributes: Joi.array().items(
            Joi.object().keys({
                key: Joi.string().required(),
                value: Joi.string().required(),
            })
        ),
    }),
};

module.exports = {
    createProduct,
};
