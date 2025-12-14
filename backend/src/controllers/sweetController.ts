import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Sweet } from '../models';
import { AuthRequest } from '../middleware';

// Create a new sweet
export const createSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
      return;
    }

    const { name, category, price, quantity, description, imageUrl } = req.body;

    // Check if sweet with same name exists
    const existingSweet = await Sweet.findOne({ name });
    if (existingSweet) {
      res.status(400).json({ message: 'A sweet with this name already exists' });
      return;
    }

    const sweet = new Sweet({
      name,
      category,
      price,
      quantity: quantity || 0,
      description,
      imageUrl
    });

    await sweet.save();

    res.status(201).json({
      message: 'Sweet created successfully',
      sweet
    });
  } catch (error) {
    console.error('Create sweet error:', error);
    res.status(500).json({ message: 'Failed to create sweet.' });
  }
};

// Get all sweets
export const getAllSweets = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sweets = await Sweet.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Sweet.countDocuments();

    res.status(200).json({
      sweets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all sweets error:', error);
    res.status(500).json({ message: 'Failed to fetch sweets.' });
  }
};

// Get sweet by ID
export const getSweetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    res.status(200).json({ sweet });
  } catch (error) {
    console.error('Get sweet by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch sweet.' });
  }
};

// Search sweets
export const searchSweets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    const query: any = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice as string);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice as string);
      }
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sweets = await Sweet.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Sweet.countDocuments(query);

    res.status(200).json({
      sweets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search sweets error:', error);
    res.status(500).json({ message: 'Failed to search sweets.' });
  }
};

// Update sweet
export const updateSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
      return;
    }

    const { id } = req.params;
    const { name, category, price, quantity, description, imageUrl } = req.body;

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    // Check if name is being changed to an existing name
    if (name && name !== sweet.name) {
      const existingSweet = await Sweet.findOne({ name });
      if (existingSweet) {
        res.status(400).json({ message: 'A sweet with this name already exists' });
        return;
      }
    }

    // Update fields
    if (name) sweet.name = name;
    if (category) sweet.category = category;
    if (price !== undefined) sweet.price = price;
    if (quantity !== undefined) sweet.quantity = quantity;
    if (description !== undefined) sweet.description = description;
    if (imageUrl !== undefined) sweet.imageUrl = imageUrl;

    await sweet.save();

    res.status(200).json({
      message: 'Sweet updated successfully',
      sweet
    });
  } catch (error) {
    console.error('Update sweet error:', error);
    res.status(500).json({ message: 'Failed to update sweet.' });
  }
};

// Delete sweet (Admin only)
export const deleteSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    await Sweet.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Sweet deleted successfully'
    });
  } catch (error) {
    console.error('Delete sweet error:', error);
    res.status(500).json({ message: 'Failed to delete sweet.' });
  }
};

// Purchase sweet
export const purchaseSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    if (quantity < 1) {
      res.status(400).json({ message: 'Quantity must be at least 1' });
      return;
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    if (sweet.quantity < quantity) {
      res.status(400).json({ 
        message: 'Insufficient stock',
        available: sweet.quantity 
      });
      return;
    }

    sweet.quantity -= quantity;
    await sweet.save();

    res.status(200).json({
      message: 'Purchase successful',
      sweet,
      purchased: quantity
    });
  } catch (error) {
    console.error('Purchase sweet error:', error);
    res.status(500).json({ message: 'Failed to purchase sweet.' });
  }
};

// Restock sweet (Admin only)
export const restockSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      res.status(400).json({ message: 'Quantity must be at least 1' });
      return;
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    sweet.quantity += quantity;
    await sweet.save();

    res.status(200).json({
      message: 'Restock successful',
      sweet,
      added: quantity
    });
  } catch (error) {
    console.error('Restock sweet error:', error);
    res.status(500).json({ message: 'Failed to restock sweet.' });
  }
};
