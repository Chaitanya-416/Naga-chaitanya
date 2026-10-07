import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isTest ? 10000 : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 10000 : 25,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts, please try again later.'
  }
});

export const gatewayLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: isTest ? 10000 : 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded for ScopeSeal gateway evaluation.'
  }
});
