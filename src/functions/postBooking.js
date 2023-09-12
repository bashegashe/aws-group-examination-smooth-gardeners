import { db } from '../services/db.js'
import validatePost from '../validations/postValidation.js'
import { sendResponse } from '../responses/index.js'
import { validateBookingDates, calculateBookingTotalRooms, createBookingResponse } from '../services/bookings.js'
import { nanoid } from 'nanoid'

export const handler = async (event) => {
  try {
    const booking = JSON.parse(event.body)

    await validatePost(booking)

    const { guests, rooms, startDate, endDate, name, email } = booking

    const roomsNeeded = calculateBookingTotalRooms(booking)

    await validateBookingDates({ startDate, endDate, roomsNeeded })

    const item = {
      PK: `BOOKING#${nanoid()}`,
      SK: `BOOKINGS#META`,
      guests,
      rooms,
      startDate,
      endDate,
      name,
      email
    }

    const params = {
      TableName: process.env.TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)',
    }

    await db.put(params).promise()

    return sendResponse(200, {
      success: true,
      booking: createBookingResponse(item)
    })
  } catch (error) {
    const message = error?.details?.message || error?.message || 'Something went wrong'
    return sendResponse(400, { error: message })
  }
}