import { db } from '../services/db.js'
import { sendResponse } from '../responses/index.js'
import dayjs from 'dayjs'

export const handler = async (event) => {
  console.log('event ', event)
  try {
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: event.pathParameters.id
      }
    };

    console.log(params)

    const { Item: booking } = await db.get(params).promise();

    if (!booking) {
      throw new Error('Booking not found')
    }

    const daysBefore = dayjs().subtract(2, 'd')

    if (!dayjs(booking.startDate).isBefore(daysBefore)) {
      throw new Error('Booking cannot be cancelled less than 2 days before arrival')
    }

    // await db.delete(params).promise();

    return sendResponse(200, {
      success: true,
      booking
    })
  } catch (error) {
    let message = error?.details?.message || error?.message || 'Something went wrong'

    if (error.code === 'ConditionalCheckFailedException') {
      message = 'This booking cannot be canceled at this time.';
    }

    return sendResponse(400, { error: message })
  }
}