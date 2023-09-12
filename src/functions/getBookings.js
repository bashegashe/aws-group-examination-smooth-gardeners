import { db } from '../services/db.js'
import { sendResponse } from '../responses/index.js'
import { createBookingResponse } from '../services/bookings.js'

export const handler = async (event) => {
  const params = {
    TableName: process.env.TABLE_NAME
  }

  const { Items: bookings } = await db.scan(params).promise()

  return sendResponse(200, {
    success: true,
    bookings: bookings.map(booking => createBookingResponse(booking))
  })
}