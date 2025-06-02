import express from 'express';
import hospitalImagesRouter from './hospitalImages';

const app = express();

app.use(express.json());

// API routes
app.use('/api/hospitals', hospitalImagesRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    details: err.message
  });
});

export default app;