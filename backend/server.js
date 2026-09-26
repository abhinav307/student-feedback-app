import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import formRoutes from './routes/forms.js';
import responseRoutes from './routes/responses.js';
import analyticsRoutes from './routes/analytics.js';
import mediaRoutes from './routes/media.js';
import notificationRoutes from './routes/notifications.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const app = express();
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per window
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', apiLimiter);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
let MONGODB_URI = process.env.MONGODB_URI;

// Self-executing async to avoid top-level await in CommonJS contexts (though we use ES Modules, it's safer for varying node versions)
const connectDB = async () => {
  if (!MONGODB_URI) {
    const mongoServer = await MongoMemoryServer.create();
    MONGODB_URI = mongoServer.getUri();
    console.log('No MONGODB_URI provided. Started in-memory MongoDB at:', MONGODB_URI);
  }
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
};
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
export default app;
