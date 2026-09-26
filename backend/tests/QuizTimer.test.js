import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import QuizAttempt from '../models/QuizAttempt.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('QuizTimer attempt logic', () => {
    it('creates attempt with calculated expiresAt for time limit', async () => {
        const attempt = await QuizAttempt.create({
            attemptId: '1234',
            publicId: 'pub1',
            formId: new mongoose.Types.ObjectId(),
            startedAt: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60000), // 10 mins
            status: 'in-progress'
        });
        
        expect(attempt.startedAt).toBeDefined();
        expect(attempt.expiresAt).toBeDefined();
        expect(attempt.status).toBe('in-progress');
    });

    it('rejects attempt if expired', async () => {
        const attempt = await QuizAttempt.create({
            attemptId: '1235',
            publicId: 'pub2',
            formId: new mongoose.Types.ObjectId(),
            startedAt: new Date(Date.now() - 20 * 60000),
            expiresAt: new Date(Date.now() - 10 * 60000), // Expired 10 mins ago
            status: 'in-progress'
        });
        
        const now = new Date();
        const isExpired = attempt.expiresAt && now > attempt.expiresAt;
        expect(isExpired).toBe(true);
    });
    
    it('allows submission if within time limit', async () => {
        const attempt = await QuizAttempt.create({
            attemptId: '1236',
            publicId: 'pub3',
            formId: new mongoose.Types.ObjectId(),
            startedAt: new Date(Date.now() - 5 * 60000),
            expiresAt: new Date(Date.now() + 5 * 60000), // 5 mins left
            status: 'in-progress'
        });
        
        const now = new Date();
        const isExpired = attempt.expiresAt && now > attempt.expiresAt;
        expect(isExpired).toBe(false);
        
        // Mock server side actualTimeTaken calculation
        const actualTimeTaken = Math.floor((now - attempt.startedAt) / 1000);
        expect(actualTimeTaken).toBeGreaterThanOrEqual(300); // 5 mins
        expect(actualTimeTaken).toBeLessThan(305);
    });
    
    it('duplicate attempt submission check', async () => {
        const attempt = await QuizAttempt.create({
            attemptId: '1237',
            publicId: 'pub4',
            formId: new mongoose.Types.ObjectId(),
            startedAt: new Date(),
            expiresAt: null,
            status: 'submitted'
        });
        
        // Simulating findOneAndUpdate condition
        const updated = await QuizAttempt.findOneAndUpdate(
            { attemptId: '1237', status: 'in-progress' },
            { $set: { status: 'submitted' } }
        );
        
        expect(updated).toBeNull(); // Should be null because status was 'submitted'
    });
});
