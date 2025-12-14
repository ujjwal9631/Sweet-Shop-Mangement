import { Router } from 'express';
import { body } from 'express-validator';
import {
  createSweet,
  getAllSweets,
  getSweetById,
  searchSweets,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet
} from '../controllers';
import { authenticate, requireAdmin } from '../middleware';

const router = Router();

// Validation rules
const sweetValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('category')
    .isIn(['Chocolate', 'Candy', 'Cake', 'Cookie', 'Pastry', 'Ice Cream', 'Other'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
];

const updateSweetValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('category')
    .optional()
    .isIn(['Chocolate', 'Candy', 'Cake', 'Cookie', 'Pastry', 'Ice Cream', 'Other'])
    .withMessage('Invalid category'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
];

// Public routes (but still need authentication as per requirements)
router.get('/', authenticate, getAllSweets);
router.get('/search', authenticate, searchSweets);
router.get('/:id', authenticate, getSweetById);

// Protected routes - any authenticated user
router.post('/', authenticate, sweetValidation, createSweet);
router.put('/:id', authenticate, updateSweetValidation, updateSweet);
router.post('/:id/purchase', authenticate, purchaseSweet);

// Admin only routes
router.delete('/:id', authenticate, requireAdmin, deleteSweet);
router.post('/:id/restock', authenticate, requireAdmin, restockSweet);

export default router;
