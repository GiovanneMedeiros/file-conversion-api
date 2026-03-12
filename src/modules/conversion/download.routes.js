import { Router } from 'express';
import { downloadConvertedFile } from './conversion.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.middleware.js';
import { downloadParamsSchema } from './conversion.validation.js';

const router = Router();

/**
 * @swagger
 * /downloads/{filename}:
 *   get:
 *     summary: Download a converted file
 *     tags: [Downloads]
 *     security:
 *       - bearerAuth: []
 *     description: Downloads the converted file for an authenticated user.
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *           example: cmmnconv000017fm0abc12345.png
 *         description: Output filename returned by conversion status resultFile.
 *     responses:
 *       200:
 *         description: Converted file binary stream.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 */
router.get(
	'/:filename',
	authMiddleware,
	validateRequest({ paramsSchema: downloadParamsSchema }),
	downloadConvertedFile,
);

export default router;
