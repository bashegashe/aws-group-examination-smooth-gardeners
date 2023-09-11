import Joi from 'joi'

const roomSchema = Joi.object({
  single: Joi.number().integer().min(0),
  double: Joi.number().integer().min(0),
  suite: Joi.number().integer().min(0),
})
  .or('single', 'double', 'suite')
  .required();

const mainSchema = Joi.object({
  guests: Joi.number().integer().min(1).required(),
  rooms: roomSchema,
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
}).required()
  .and('startDate', 'endDate')
  .with('guests', 'rooms');

export default function validatePost(data) {
  return mainSchema.validateAsync(data);
}