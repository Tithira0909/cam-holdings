const request = require('supertest');
const app = require('../index');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../db', () => ({
  execute: jest.fn(),
  promise: jest.fn().mockReturnThis()
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

describe('POST /api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if username or password is missing', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username and password are required');
  });

  it('should return 401 if user does not exist', async () => {
    db.execute.mockResolvedValue([[]]); // No rows found

    const response = await request(app)
      .post('/api/login')
      .send({ username: 'nonexistent', password: 'password' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid username or password');
  });

  it('should return 401 if password does not match', async () => {
    const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword', role: 'CLIENT' };
    db.execute.mockResolvedValue([[mockUser]]);
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid username or password');
  });

  it('should return 200 and a token if login is successful', async () => {
    const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword', role: 'CLIENT' };
    db.execute.mockResolvedValue([[mockUser]]);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocktoken');

    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.role).toBe('CLIENT');
    // Check if cookie is set
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain('token=mocktoken');
  });
});
