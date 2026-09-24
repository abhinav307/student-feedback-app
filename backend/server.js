import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import formRoutes from './routes/forms.js';
import responseRoutes from './routes/responses.js';
import analyticsRoutes from './routes/analytics.js';
import mediaRoutes from './routes/media.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});