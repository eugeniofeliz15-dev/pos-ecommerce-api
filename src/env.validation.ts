import Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  PORT: Joi.number().default(3000),
  MOCKPAY_API_URL: Joi.string().optional(),
  MOCKPAY_API_KEY: Joi.string().optional(),
});