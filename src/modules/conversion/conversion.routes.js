import { Router } from 'express';
import {
  createConversion,
  getConversionById,
} from './conversion.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.middleware.js';
import {
  conversionIdParamsSchema,
  createConversionBodySchema,
} from './conversion.validation.js';

const router = Router();

/**
 * @swagger
 * /conversions:
 *   post:
 *     summary: Request a new file conversion
 *     tags: [Conversions]
 *     security:
 *       - bearerAuth: []
 *     description: Creates and synchronously processes a file conversion.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConversionRequest'
 *           examples:
 *             default:
 *               value:
 *                 fileId: cmmnfile000017fm0abc12345
 *                 targetFormat: png
 *     responses:
 *       201:
 *         description: Conversion requested successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversionRequestResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 *
 * /convert:
 *   post:
 *     summary: Request a new file conversion (legacy alias)
 *     tags: [Conversions]
 *     security:
 *       - bearerAuth: []
 *     description: Alias endpoint for /conversions kept for compatibility.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConversionRequest'
 *     responses:
 *       201:
 *         description: Conversion requested successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversionRequestResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 */
router.post(
  '/',
  authMiddleware,
  validateRequest({ bodySchema: createConversionBodySchema }),
  createConversion,
);

/**
 * @swagger
 * /conversions/{id}:
 *   get:
 *     summary: Get conversion status
 *     tags: [Conversions]
 *     security:
 *       - bearerAuth: []
 *     description: Returns conversion status and output filename if completed.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversion ID.
 *     responses:
 *       200:
 *         description: Conversion status fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversionStatusResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 *
 * /convert/{id}:
 *   get:
 *     summary: Get conversion status (legacy alias)
 *     tags: [Conversions]
 *     security:
 *       - bearerAuth: []
 *     description: Alias endpoint for /conversions/{id} kept for compatibility.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversion status fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversionStatusResponse'
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
  '/:id',
  authMiddleware,
  validateRequest({ paramsSchema: conversionIdParamsSchema }),
  getConversionById,
);

export default router;
