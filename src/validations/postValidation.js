import Joi from 'joi'
import dayjs from 'dayjs';

const roomSchema = Joi.object({
  single: Joi.number().integer().min(1),
  double: Joi.number().integer().min(1),
  suite: Joi.number().integer().min(1),
})
  .or('single', 'double', 'suite')
  .required();

const mainSchema = Joi.object({
  guests: Joi.number().integer().min(1).required(),
  rooms: roomSchema,
  startDate: Joi.date()
    .iso()
    .min(dayjs().format('YYYY-MM-DD'))
    .required(),
  endDate: Joi.date()
    .iso()
    .greater(Joi.ref('startDate'))
    .required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
}).required()
  .and('startDate', 'endDate')
  .with('guests', 'rooms');

export default function validatePost(data) {
  return mainSchema.validateAsync(data);
}