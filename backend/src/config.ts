import 'dotenv/config';
export const config = { port: Number(process.env.PORT || 4000), mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/memed-payouts', jwtSecret: process.env.JWT_SECRET || 'development-secret', frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000', nodeEnv: process.env.NODE_ENV || 'development' };
