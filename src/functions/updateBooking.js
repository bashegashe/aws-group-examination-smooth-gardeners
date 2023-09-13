import { db } from '../services/db.js'
import validatePost from '../validations/postValidation.js'
import { sendResponse } from '../responses/index.js'
import { validateBooking, calculateBookingTotalRooms, createBookingResponse, createBookingItem } from '../services/bookings.js'

export const handler = async (event) => {
  try {
    const booking = JSON.parse(event.body)

    await validatePost(booking)
    await validateBooking({
      ...booking,
      id: event.pathParameters.id
    })

    const bookingItem = {
      ...createBookingItem(booking),
      PK: `BOOKING#${event.pathParameters.id}`,
    }

    const params = {
      TableName: process.env.TABLE_NAME,
      Item: bookingItem,
      ConditionExpression: 'attribute_exists(PK)',
    }

    await db.put(params).promise()

    return sendResponse(200, {
      success: true,
      booking: createBookingResponse(bookingItem)
    })
  } catch (error) {
    const message = error?.details?.message || error?.message || 'Something went wrong'
    return sendResponse(400, { error: message })
  }
}