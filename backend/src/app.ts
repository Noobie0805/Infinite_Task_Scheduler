import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './db/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import routes from './routes/index.js';

dotenv.config(
  {
    path: "../.env"
  }
);

const app = express();
const port = process.env.PORT || 8000;

connectDB();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(routes);


app.get('/', (req, res) => {
  res.send('API is running...');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler); // last me ..

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const shutdown = async () => {
  console.log('Shutting down server...');
  await closeDB();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default app;



