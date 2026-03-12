import { jest } from '@jest/globals';
import request from 'supertest';

const registerUserMock = jest.fn();
const loginUserMock = jest.fn();

jest.unstable_mockModule('../src/modules/auth/auth.service.js', () => ({
  registerUser: registerUserMock,
  loginUser: loginUserMock,
}));

const { default: app } = await import('../src/app.js');

describe('Auth routes', () => {
  beforeEach(() => {
    registerUserMock.mockReset();
    loginUserMock.mockReset();
  });

  it('POST /auth/register creates a user', async () => {
    registerUserMock.mockResolvedValue({
      id: 'user_test_1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date('2026-03-11T00:00:00.000Z'),
    });

    const payload = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app).post('/auth/register').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.user).toMatchObject({
      id: 'user_test_1',
      name: payload.name,
      email: payload.email,
    });
    expect(registerUserMock).toHaveBeenCalledWith(payload);
  });

  it('POST /auth/register returns validation error when required field is missing', async () => {
    const response = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation error');
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'name',
        }),
      ]),
    );
    expect(registerUserMock).not.toHaveBeenCalled();
  });
});
