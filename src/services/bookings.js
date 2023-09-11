import { db } from './db.js';
import { MAX_ROOMS } from '../misc/constants.js';

function sumTotalRooms(bookings) {
  return bookings.reduce((acc, booking) => acc + booking.totalRooms, 0);
}

export async function getAvailableRooms(startDate, endDate) {
  const params = {
    TableName: process.env.TABLE_NAME,
    IndexName: "GSI1",
    KeyConditionExpression: '#pk = :pk AND #sk <= :endDate',
    ExpressionAttributeNames: {
      '#pk': 'pk',
      '#sk': 'sk'
    },
    ExpressionAttributeValues: {
      ':pk': startDate,
      ':endDate': endDate
    }
  }

  const { Items: bookings } = await db.query(params).promise();

  const bookedRooms = sumTotalRooms(bookings);
  const availableRooms = MAX_ROOMS - bookedRooms;

  return availableRooms;
}