import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import fileRoutes from '../modules/file/file.routes.js';
import conversionRoutes from '../modules/conversion/conversion.routes.js';
import downloadRoutes from '../modules/conversion/download.routes.js';
import userRoutes from '../modules/user/user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/convert', conversionRoutes);
router.use('/conversions', conversionRoutes);
router.use('/downloads', downloadRoutes);
router.use('/users', userRoutes);

export default router;
