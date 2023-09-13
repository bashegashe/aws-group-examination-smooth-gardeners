import { db } from '../services/db.js'
import { validateUpdate } from '../validations/postValidation.js'
import { sendResponse } from '../responses/index.js'
import { validateBooking, createBookingResponse, createBookingItem, getBooking, validateCancellation } from '../services/bookings.js'

export const handler = async (event) => {
  try {
    const booking = JSON.parse(event.body)
    const oldBooking = await getBooking(event.pathParameters.id)

    await validateUpdate(booking)
    if (booking.startDate || booking.endDate) {
      validateCancellation(oldBooking)
    }

    const updatedBooking = { ...oldBooking, ...booking }

    await validateBooking({
      ...updatedBooking,
      id: event.pathParameters.id
    })

    const bookingItem = {
      ...createBookingItem(updatedBooking),
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