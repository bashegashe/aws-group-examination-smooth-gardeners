import { DocumentClient } from 'aws-sdk/clients/dynamodb.js';

export const db = new DocumentClient({
  region: process.env.AWS_REGION
});