import { db } from './db.js';
import { MAX_ROOMS, ROOMS } from '../misc/constants.js';
import dayjs from 'dayjs';

export async function validateBookingDates(newBooking) {
  const { startDate, endDate, roomsNeeded } = newBooking;

  const params = {
    TableName: process.env.TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'SK = :sk AND startDate <= :end',
    FilterExpression: 'endDate >= :start',
    ExpressionAttributeValues: {
      ":sk": "BOOKINGS#META",
      ":start": startDate,
      ":end": endDate
    }
  }

  const { Items: intersectingBookings } = await db.query(params).promise();

  const bookedRooms = intersectingBookings.reduce((acc, booking) => {
    if (!dayjs(startDate).isSame(dayjs(booking.endDate))) {
      return acc + calculateBookingTotalRooms(booking);
    }
    return acc;
  }, 0);


  if (bookedRooms + roomsNeeded > MAX_ROOMS) {
    throw new Error('Not enough rooms for the selected period!');
  }
}


export function calculateBookingTotalRooms(booking) {
  return Object.keys(booking.rooms).reduce(
    (acc, key) => acc + booking.rooms[key],
    0
  );
}

export function calculateBookingTotalPrice(booking) {
  const numberOfDays = dayjs(booking.endDate).diff(booking.startDate, 'd');

  return Object.keys(booking.rooms).reduce(
    (acc, key) =>
      acc + ROOMS[key.toUpperCase()].PRICE * booking.rooms[key] * numberOfDays,
    0
  );
}

export function createBookingResponse(booking) {
  return {
    id: booking.PK.replace('BOOKING#', ''),
    name: booking.name,
    email: booking.email,
    rooms: calculateBookingTotalRooms(booking),
    guests: booking.guests,
    dates: {
      checkIn: booking.startDate,
      checkOut: booking.endDate
    },
    totalPrice: calculateBookingTotalPrice(booking)
  }
}