import { Router } from 'express';
import { login, register } from './auth.controller.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.middleware.js';
import { loginBodySchema, registerBodySchema } from './auth.validation.js';
import { authRateLimiter } from '../../shared/middlewares/rateLimit.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User registration and login endpoints.
 *   - name: Files
 *     description: Authenticated file upload endpoints.
 *   - name: Conversions
 *     description: Conversion request and conversion status endpoints.
 *   - name: Downloads
 *     description: Authenticated download of converted files.
 *   - name: Users
 *     description: Authenticated user resources.
 *
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Validation error
 *         code:
 *           type: string
 *           example: VALIDATION_ERROR
 *         details:
 *           description: Optional extra error data.
 *           oneOf:
 *             - type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                     example: email
 *                   message:
 *                     type: string
 *                     example: email must be a valid email address
 *                   code:
 *                     type: string
 *                     example: invalid_string
 *             - type: string
 *             - type: object
 *
 *     UserPublic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: cmmnabcde00017fm012345678
 *         name:
 *           type: string
 *           example: Smoke User
 *         email:
 *           type: string
 *           format: email
 *           example: smoke_1700000000000@example.com
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-03-12T11:00:00.000Z
 *
 *     AuthRegisterRequest:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           example: Smoke User
 *         email:
 *           type: string
 *           format: email
 *           example: smoke@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           example: password123
 *
 *     AuthRegisterResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: User registered successfully
 *         user:
 *           $ref: '#/components/schemas/UserPublic'
 *
 *     AuthLoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: smoke@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           example: password123
 *
 *     AuthLoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT access token.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: cmmnabcde00017fm012345678
 *             name:
 *               type: string
 *               example: Smoke User
 *             email:
 *               type: string
 *               format: email
 *               example: smoke@example.com
 *
 *     UploadedFile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: cmmnfile000017fm0abc12345
 *         userId:
 *           type: string
 *           example: cmmnabcde00017fm012345678
 *         filename:
 *           type: string
 *           example: 1773309032484-857816573.jpg
 *         originalFormat:
 *           type: string
 *           example: jpg
 *         size:
 *           type: integer
 *           example: 6695
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     UploadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: File uploaded successfully
 *         file:
 *           $ref: '#/components/schemas/UploadedFile'
 *
 *     CreateConversionRequest:
 *       type: object
 *       required: [fileId, targetFormat]
 *       properties:
 *         fileId:
 *           type: string
 *           example: cmmnfile000017fm0abc12345
 *         targetFormat:
 *           type: string
 *           enum: [png, jpg, jpeg, webp, pdf]
 *           example: png
 *
 *     Conversion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: cmmnconv000017fm0abc12345
 *         fileId:
 *           type: string
 *           example: cmmnfile000017fm0abc12345
 *         userId:
 *           type: string
 *           example: cmmnabcde00017fm012345678
 *         targetFormat:
 *           type: string
 *           example: png
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           example: pending
 *         resultFile:
 *           type: string
 *           nullable: true
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     ConversionRequestResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Conversion requested successfully
 *         conversion:
 *           $ref: '#/components/schemas/Conversion'
 *
 *     ConversionStatusResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: cmmnconv000017fm0abc12345
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           example: completed
 *         resultFile:
 *           type: string
 *           nullable: true
 *           example: cmmnconv000017fm0abc12345.png
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     ConversionHistoryItem:
 *       allOf:
 *         - $ref: '#/components/schemas/Conversion'
 *         - type: object
 *           properties:
 *             file:
 *               $ref: '#/components/schemas/UploadedFile'
 *
 *   responses:
 *     ValidationError:
 *       description: Request validation failed.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     UnauthorizedError:
 *       description: Missing, malformed or invalid token.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     NotFoundError:
 *       description: Resource not found.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     ConflictError:
 *       description: Resource conflict.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     TooManyRequestsError:
 *       description: Rate limit exceeded.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     QueueUnavailableError:
 *       description: Queue service unavailable.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     description: Creates a new user and stores password as a bcrypt hash.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *           examples:
 *             default:
 *               value:
 *                 name: Smoke User
 *                 email: smoke@example.com
 *                 password: password123
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRegisterResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 */
router.post(
	'/register',
	authRateLimiter,
	validateRequest({ bodySchema: registerBodySchema }),
	register,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and issue JWT token
 *     tags: [Auth]
 *     description: Validates credentials and returns an access token for protected routes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *           examples:
 *             default:
 *               value:
 *                 email: smoke@example.com
 *                 password: password123
 *     responses:
 *       200:
 *         description: Authentication successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 */
router.post(
	'/login',
	authRateLimiter,
	validateRequest({ bodySchema: loginBodySchema }),
	login,
);

export default router;
