import mongoose from 'mongoose';
import { config } from './env';

export function connectDatabase() {
  return mongoose.connect(config.mongoUri);
}
