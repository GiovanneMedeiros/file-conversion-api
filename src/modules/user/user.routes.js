import { Router } from 'express';
import { getMyConversions } from '../conversion/conversion.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.middleware.js';
import { conversionsHistoryQuerySchema } from '../conversion/conversion.validation.js';

const router = Router();

/**
 * @swagger
 * /users/conversions:
 *   get:
 *     summary: Get authenticated user conversion history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Returns conversion history for the authenticated user ordered by most recent.
 *     responses:
 *       200:
 *         description: List of conversions for the authenticated user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ConversionHistoryItem'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 */
router.get(
	'/conversions',
	authMiddleware,
	validateRequest({ querySchema: conversionsHistoryQuerySchema }),
	getMyConversions,
);

export default router;
