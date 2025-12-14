import { Router } from 'express';
import authRoutes from './authRoutes';
import sweetRoutes from './sweetRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sweets', sweetRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
