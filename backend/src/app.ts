import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { config } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';
import { authRouter } from './modules/auth';
import { campaignRouter } from './modules/campaigns';
import { earningsRouter } from './modules/earnings';
import { submissionRouter } from './modules/submissions';

const app = express();
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/campaigns', campaignRouter);
app.use('/api', submissionRouter);
app.use('/api/earnings', earningsRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
