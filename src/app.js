import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import routes from './app/routes.js';
import { errorMiddleware } from './shared/middlewares/error.middleware.js';
import { apiRateLimiter } from './shared/middlewares/rateLimit.middleware.js';

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(apiRateLimiter);
app.use('/uploads', express.static('uploads'));
app.use('/converted', express.static('converted'));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     description: Returns service availability status.
 *     responses:
 *       200:
 *         description: API is healthy.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Convertly API',
      version: '1.0.0',
      description: 'File conversion SaaS backend API',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.js', './src/app.js'],
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(routes);
app.use(errorMiddleware);

export default app;
