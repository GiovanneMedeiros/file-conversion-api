import { loginUser, registerUser } from './auth.service.js';
import { sendSuccess } from '../../shared/http/response.js';

export async function register(req, res, next) {
  try {
    const user = await registerUser(req.body);
    return sendSuccess(res, 201, {
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const loginResult = await loginUser(req.body);
    return sendSuccess(res, 200, loginResult);
  } catch (error) {
    return next(error);
  }
}
