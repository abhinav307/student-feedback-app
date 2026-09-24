import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import formRoutes from './routes/forms.js';
import responseRoutes from './routes/responses.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

import { MongoMemoryServer } from 'mongodb-memory-server';

// Connect to MongoDB
let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  const mongoServer = await MongoMemoryServer.create();
  MONGODB_URI = mongoServer.getUri();
  console.log('No MONGODB_URI provided. Started in-memory MongoDB at:', MONGODB_URI);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});