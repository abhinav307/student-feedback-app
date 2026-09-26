import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

import formRoutes from '../routes/forms.js';
import User from '../models/User.js';
import Form from '../models/Form.js';

const app = express();
app.use(express.json());
app.use('/api/forms', formRoutes);

let mongoServer;
let tokenUser1;
let tokenUser2;
let user1Id;
let user2Id;
let staleToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const user1 = await User.create({ name: 'User 1', email: 'u1@test.com', password: 'password123' });
  const user2 = await User.create({ name: 'User 2', email: 'u2@test.com', password: 'password123' });
  user1Id = user1._id;
  user2Id = user2._id;

  tokenUser1 = jwt.sign({ id: user1._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  tokenUser2 = jwt.sign({ id: user2._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

  // Stale token for a user that does not exist (simulate DB wipe)
  staleToken = jwt.sign({ id: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Draft and Authentication Lifecycle', () => {
  let draftId;
  let publicId;

  it('1. Authenticated user can create draft', async () => {
    const res = await request(app)
      .post('/api/forms')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ title: 'My Draft', type: 'feedback', status: 'draft', fields: [] });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('draft');
    draftId = res.body._id;
    publicId = res.body.publicId;
  });

  it('2. Draft managerId equals authenticated user ID', async () => {
    const form = await Form.findById(draftId);
    expect(form.managerId.toString()).toBe(user1Id.toString());
  });

  it('3. Draft appears in manager\'s form list', async () => {
    const res = await request(app)
      .get('/api/forms')
      .set('Authorization', `Bearer ${tokenUser1}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]._id).toBe(draftId);
  });

  it('5. Manager can reopen draft', async () => {
    const res = await request(app)
      .get(`/api/forms/${draftId}`)
      .set('Authorization', `Bearer ${tokenUser1}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(draftId);
  });

  it('6. Manager can publish draft', async () => {
    const res = await request(app)
      .put(`/api/forms/${draftId}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ title: 'Published Form', status: 'published' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('published');
    expect(res.body.publicId).toBe(publicId); // same public ID
  });

  it('7. Unauthorized manager cannot access another manager\'s draft', async () => {
    const draftRes = await request(app)
      .post('/api/forms')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ title: 'Draft 2', status: 'draft' });
    
    const draft2Id = draftRes.body._id;

    const res = await request(app)
      .get(`/api/forms/${draft2Id}`)
      .set('Authorization', `Bearer ${tokenUser2}`);
    
    expect(res.status).toBe(404); // Or 403, depending on implementation (backend returns 404 for forms not matching managerId)
  });

  it('8. Missing user for valid JWT returns 401', async () => {
    const res = await request(app)
      .post('/api/forms')
      .set('Authorization', `Bearer ${staleToken}`)
      .send({ title: 'Ghost Draft', status: 'draft' });
    
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('User not found');
  });
});
