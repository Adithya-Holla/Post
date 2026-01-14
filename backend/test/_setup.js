import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo;

export const connectTestDb = async () => {
  process.env.NODE_ENV = 'test';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
};

export const disconnectTestDb = async () => {
  await mongoose.disconnect();
  if (mongo) {
    await mongo.stop();
  }
};

export const clearTestDb = async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
};
