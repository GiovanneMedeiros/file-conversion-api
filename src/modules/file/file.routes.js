import { Router } from 'express';
import { upload, uploadFile } from './file.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.middleware.js';
import { uploadHeadersSchema } from './file.validation.js';

const router = Router();

/**
 * @swagger
 * /files/upload:
 *   post:
 *     summary: Upload a source file for conversion
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Uploads a source image file for the authenticated user.
 *       Supported file types are jpg, jpeg and png.
 *       Maximum file size is 20MB.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: Bearer <JWT_TOKEN>
 *         description: JWT token returned by login endpoint.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Source file to be converted.
 *     responses:
 *       201:
 *         description: File uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Invalid upload payload, unsupported file type or file missing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       413:
 *         description: Uploaded file exceeds size limit.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 */
router.post(
	'/upload',
	authMiddleware,
	validateRequest({ headersSchema: uploadHeadersSchema }),
	upload.single('file'),
	uploadFile,
);

export default router;
