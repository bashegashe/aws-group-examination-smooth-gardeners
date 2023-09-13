import { db } from '../services/db.js'
import { sendResponse } from '../responses/index.js'
import dayjs from 'dayjs'
import { createBookingResponse } from '../services/bookings.js'

export const handler = async (event) => {
  try {
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: `BOOKING#${event.pathParameters.id}`,
        SK: 'META'
      }
    };

    const { Item: booking } = await db.get(params).promise();

    if (!booking) {
      throw new Error('Booking not found');
    }

    const daysBefore = dayjs(booking.startDate).subtract(1, 'd');

    if (!dayjs().isBefore(daysBefore)) {
      throw new Error('Booking cannot be cancelled less than 2 days before arrival'); s
    }

    await db.delete(params).promise();

    return sendResponse(200, {
      success: true,
      booking: createBookingResponse(booking)
    })
  } catch (error) {
    let message = error?.details?.message || error?.message || 'Something went wrong'

    return sendResponse(400, { error: message })
  }
}