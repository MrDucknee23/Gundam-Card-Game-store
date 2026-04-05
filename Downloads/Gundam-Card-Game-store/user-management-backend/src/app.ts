import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/user.routes';
import errorHandler from './middleware/error.middleware';
import { config } from 'dotenv';

config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
// mongoose.connect(process.env.MONGODB_URI as string, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;