import Joi from 'joi'
import dayjs from 'dayjs';

const roomSchema = Joi.object({
  single: Joi.number().integer().min(1),
  double: Joi.number().integer().min(1),
  suite: Joi.number().integer().min(1),
}).or('single', 'double', 'suite')

const postSchema = Joi.object({
  guests: Joi.number().integer().min(1).required(),
  rooms: roomSchema.required(),
  checkIn: Joi.date()
    .iso()
    .min(dayjs().format('YYYY-MM-DD'))
    .required(),
  checkOut: Joi.date()
    .iso()
    .greater(Joi.ref('checkIn'))
    .required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
}).required()
  .and('checkIn', 'checkOut')
  .with('guests', 'rooms');

const updateSchema = Joi.object({
  guests: Joi.number().integer().min(1),
  rooms: roomSchema,
  checkIn: Joi.date()
    .iso()
    .min(dayjs().format('YYYY-MM-DD')),
  checkOut: Joi.date()
    .iso()
    .greater(Joi.ref('checkIn'))
}).and('checkIn', 'checkOut')

export function validatePost(data) {
  return postSchema.validateAsync(data);
}

export function validateUpdate(data) {
  return updateSchema.validateAsync(data);
}