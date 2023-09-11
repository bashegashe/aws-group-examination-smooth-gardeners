import { db } from '../services/db.js'
import validatePost from '../validations/postValidation.js'
import { sendResponse } from '../responses/index.js'
import { getAvailableRooms } from '../services/bookings.js'

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body)

    await validatePost(body)

    const { guests, rooms, startDate, endDate, name, email } = body

    const availableRooms = await getAvailableRooms(startDate, endDate)

    return sendResponse(200, { success: true, availableRooms })
  } catch (error) {
    const message = error.details.message || error.message || 'Something went wrong'
    return sendResponse(400, { error: message })
  }
}