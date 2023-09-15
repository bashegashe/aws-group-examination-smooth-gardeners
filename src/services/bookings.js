import { db } from './db.js';
import { MAX_ROOMS, ROOMS } from '../misc/constants.js';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

export async function validateBooking(booking) {
  if (validateRoomCapacity(booking)) {
    throw new Error('Selected rooms cannot accommodate the number of guests.');
  }

  const params = {
    TableName: process.env.TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND #checkIn <= :end',
    FilterExpression: `checkOut > :start ${booking.id ? `AND PK <> :id` : ''}`,
    ExpressionAttributeNames: {
      '#checkIn': 'GSI1SK'
    },
    ExpressionAttributeValues: {
      ":pk": "META",
      ":start": booking.checkIn,
      ":end": booking.checkOut,
      ...(booking.id ? { ":id": 'BOOKING#' + booking.id } : {})
    }
  }

  const { Items: intersectingBookings } = await db.query(params).promise();

  const bookedRooms = intersectingBookings.reduce((acc, booking) => acc + calculateBookingTotalRooms(booking), 0);

  if (bookedRooms + calculateBookingTotalRooms(booking) > MAX_ROOMS) {
    throw new Error('Not enough rooms for the selected period!');
  }
}

function validateRoomCapacity(booking) {
  return Object.keys(booking.rooms).reduce(
    (acc, key) =>
      acc + booking.rooms[key] * ROOMS[key.toUpperCase()].MAX_GUESTS,
    0
  ) < booking.guests;
}

export function calculateBookingTotalRooms(booking) {
  return Object.keys(booking.rooms).reduce(
    (acc, key) => acc + booking.rooms[key],
    0
  );
}

export function calculateBookingTotalPrice(booking) {
  const numberOfDays = dayjs(booking.checkOut).diff(booking.checkIn, 'd');

  return Object.keys(booking.rooms).reduce(
    (acc, key) =>
      acc + ROOMS[key.toUpperCase()].PRICE * booking.rooms[key] * numberOfDays,
    0
  );
}

export function createBookingResponse(booking) {
  const { guests, checkIn, checkOut, name, email } = booking;

  return {
    id: booking.PK.replace('BOOKING#', ''),
    name,
    email,
    rooms: calculateBookingTotalRooms(booking),
    guests,
    dates: {
      checkIn: checkIn,
      checkOut: checkOut
    },
    totalPrice: calculateBookingTotalPrice(booking)
  }
}

export function createBookingItem(booking) {
  const { guests, rooms, checkIn, checkOut, name, email } = booking;

  return {
    PK: `BOOKING#${nanoid()}`,
    SK: `META`,
    GSI1PK: `META`,
    GSI1SK: checkIn,
    guests,
    rooms,
    checkIn,
    checkOut,
    name,
    email
  };
}

export async function getBooking(id) {
  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      PK: `BOOKING#${id}`,
      SK: 'META'
    }
  };

  const { Item: booking } = await db.get(params).promise();

  return booking;
}

export function validateCancellation(booking) {
  const daysBefore = dayjs(booking.checkIn).subtract(1, 'd');

  if (!dayjs().isBefore(daysBefore)) {
    throw new Error('Booking cannot be cancelled less than 2 days before arrival');
  }
}