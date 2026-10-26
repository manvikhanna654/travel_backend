const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const healthRouter = require('./routes/health.routes');
const authRouter = require('./routes/auth.routes');
const tripsRouter = require('./routes/trips.routes');
const expensesRouter = require('./routes/expenses.routes');
const uploadsRouter = require('./routes/uploads.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON request bodies.
app.use(express.json());
app.use(cors());

// API routes.
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/uploads', uploadsRouter);

// Unknown routes.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Central error handler.
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

async function startServer() {
  app.listen(PORT, () => {
    console.log(`TripSplit backend running at http://localhost:${PORT}`);
  });

  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('MongoDB connected');
    } catch (error) {
      console.warn('MongoDB is unavailable. Database-backed features will be unavailable until it starts:', error.message);
    }
  } else {
    console.warn('MONGODB_URI is not configured. Database routes will not work yet.');
  }
}

startServer().catch((error) => {
  console.error('Could not start backend:', error.message);
  process.exit(1);
});

