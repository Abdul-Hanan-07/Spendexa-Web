import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import transactionsRouter from './routes/transactions';
import investmentsRouter from './routes/investments';
import loansRouter from './routes/loans';
import budgetsRouter from './routes/budgets';
import goalsRouter from './routes/goals';
import { generalApiLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = process.env.PORT || 4000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(
  helmet({
    // The API is intentionally consumed cross-origin (frontend runs on a
    // different port/domain), so the default same-origin CORP would block
    // legitimate fetches even with correct CORS headers.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', generalApiLimiter);

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/investments', investmentsRouter);
app.use('/api/loans', loansRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/goals', goalsRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
