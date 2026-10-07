import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { standardLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { passportRouter } from './routes/passport.routes.js';
import { policyRouter } from './routes/policy.routes.js';
import { agentRouter } from './routes/agent.routes.js';
import { gatewayRouter } from './routes/gateway.routes.js';
import { approvalRouter } from './routes/approval.routes.js';
import { ledgerRouter } from './routes/ledger.routes.js';
import { incidentRouter } from './routes/incident.routes.js';
import { testLabRouter } from './routes/testLab.routes.js';
import { simulationRouter } from './routes/simulation.routes.js';
import { demoRouter } from './routes/demo.routes.js';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https:']
        }
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin === config.clientUrl ||
          origin === 'http://localhost:5173' ||
          origin === 'http://localhost:3000' ||
          origin.endsWith('.vercel.app') ||
          origin.endsWith('.onrender.com')
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy does not allow origin: ${origin}`));
      },
      credentials: true
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '1mb' }));

  // Global Rate Limiting
  app.use('/api', standardLimiter);

  // Health and Readiness Routes
  app.use('/api/v1', healthRouter);

  // Core API Routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/passports', passportRouter);
  app.use('/api/v1/policies', policyRouter);
  app.use('/api/v1/agents', agentRouter);
  app.use('/api/v1/gateway', gatewayRouter);
  app.use('/api/v1/approvals', approvalRouter);
  app.use('/api/v1/ledger', ledgerRouter);
  app.use('/api/v1/incidents', incidentRouter);
  app.use('/api/v1/test-lab', testLabRouter);
  app.use('/api/v1/policy-simulation', simulationRouter);
  app.use('/api/v1/demo', demoRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
