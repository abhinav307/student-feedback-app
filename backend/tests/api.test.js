import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js'; // Need to make sure server.js exports app

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // We must ensure mongoose connects to this test URI. 
    // In server.js, if MONGODB_URI is not set, it starts its own. 
    // So we should set process.env.MONGODB_URI before importing server.js if possible,
    // or disconnect and reconnect.
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth & Forms API Integration', () => {
    let token = '';
    let formPublicId = '';
    
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test', email: 'test@ci.com', password: 'password123' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
    });

    it('should login', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@ci.com', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    it('should fail protected route without token', async () => {
        const res = await request(app).get('/api/forms');
        expect(res.status).toBe(401);
    });

    it('should create a form', async () => {
        const res = await request(app)
            .post('/api/forms')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Form',
                type: 'feedback',
                fields: [
                    { id: 'f_text', type: 'text', label: 'Name', required: true }
                ],
                settings: { allowAnonymous: true },
                status: 'published'
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('publicId');
        formPublicId = res.body.publicId;
    });

    it('should reject invalid submission (missing required)', async () => {
        const res = await request(app)
            .post(`/api/responses/submit/${formPublicId}`)
            .send({ answers: [] });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should accept valid submission', async () => {
        const res = await request(app)
            .post(`/api/responses/submit/${formPublicId}`)
            .send({ answers: [{ fieldId: 'f_text', value: 'Hello' }] });
        expect(res.status).toBe(201);
    });
});
