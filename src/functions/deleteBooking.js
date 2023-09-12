import { db } from '../services/db.js'
import { sendResponse } from '../responses/index.js'
import dayjs from 'dayjs'

export const handler = async (event) => {
  try {
    const params = {
      TableName: process.env.TABLE_NAME,
      Key: {
        PK: event.pathParameters.bookingId,
        SK: `BOOKINGS#META`
      },
      ConditionExpression: '#startDate >= :beforeDate',
      ExpressionAttributeNames: {
        '#startDate': 'startDate'
      },
      ExpressionAttributeValues: {
        ':beforeDate': dayjs().subtract(2, 'd').format('YYYY-MM-DD'),
      },
    }

    await db.delete(params).promise()

    return sendResponse(200, {
      success: true
    })
  } catch (error) {
    return sendResponse(400, { error })
    let message = error?.details?.message || error?.message || 'Something went wrong'

    if (error.code === 'ConditionalCheckFailedException') {
      message = 'This booking cannot be canceled at this time.';
    }

    return sendResponse(400, { error: message })
  }
}