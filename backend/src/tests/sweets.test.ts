import request from 'supertest';
import { createApp } from '../app';
import { Sweet } from '../models';

const app = createApp();

describe('Sweets Endpoints', () => {
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    // Create a regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@example.com',
        password: 'password123',
        name: 'Regular User'
      });
    userToken = userResponse.body.token;

    // Create an admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin'
      });
    adminToken = adminResponse.body.token;
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet successfully', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100,
        description: 'Delicious milk chocolate bar'
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body.message).toBe('Sweet created successfully');
      expect(response.body.sweet.name).toBe(sweetData.name);
      expect(response.body.sweet.category).toBe(sweetData.category);
      expect(response.body.sweet.price).toBe(sweetData.price);
      expect(response.body.sweet.quantity).toBe(sweetData.quantity);
    });

    it('should return 400 for duplicate sweet name', async () => {
      const sweetData = {
        name: 'Unique Candy',
        category: 'Candy',
        price: 1.99,
        quantity: 50
      };

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sweetData);

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body.message).toBe('A sweet with this name already exists');
    });

    it('should return 400 for invalid category', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'InvalidCategory',
        price: 1.99,
        quantity: 50
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for negative price', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Candy',
        price: -5,
        quantity: 50
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({
          name: 'Test Sweet',
          category: 'Candy',
          price: 1.99
        })
        .expect(401);

      expect(response.body.message).toBe('Authentication required. No token provided.');
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      // Create some sweets for testing
      const sweets = [
        { name: 'Chocolate Truffle', category: 'Chocolate', price: 3.99, quantity: 50 },
        { name: 'Gummy Bears', category: 'Candy', price: 2.49, quantity: 100 },
        { name: 'Vanilla Cake', category: 'Cake', price: 15.99, quantity: 10 }
      ];

      for (const sweet of sweets) {
        await request(app)
          .post('/api/sweets')
          .set('Authorization', `Bearer ${userToken}`)
          .send(sweet);
      }
    });

    it('should return all sweets', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.sweets).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(3);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/sweets?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.sweets).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.pages).toBe(2);
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      const sweets = [
        { name: 'Dark Chocolate', category: 'Chocolate', price: 4.99, quantity: 30 },
        { name: 'Milk Chocolate', category: 'Chocolate', price: 3.99, quantity: 50 },
        { name: 'Strawberry Candy', category: 'Candy', price: 1.99, quantity: 100 },
        { name: 'Cheesecake', category: 'Cake', price: 25.99, quantity: 5 }
      ];

      for (const sweet of sweets) {
        await request(app)
          .post('/api/sweets')
          .set('Authorization', `Bearer ${userToken}`)
          .send(sweet);
      }
    });

    it('should search by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=chocolate')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.sweets).toHaveLength(2);
    });

    it('should search by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Chocolate')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.sweets).toHaveLength(2);
    });

    it('should search by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=2&maxPrice=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Dark Chocolate ($4.99) and Milk Chocolate ($3.99) are in range
      expect(response.body.sweets).toHaveLength(2);
    });

    it('should combine multiple search filters', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Chocolate&minPrice=4')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.sweets).toHaveLength(1);
      expect(response.body.sweets[0].name).toBe('Dark Chocolate');
    });
  });

  describe('GET /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Sweet',
          category: 'Candy',
          price: 2.99,
          quantity: 50
        });
      sweetId = response.body.sweet._id;
    });

    it('should return sweet by ID', async () => {
      const response = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.sweet.name).toBe('Test Sweet');
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .get('/api/sweets/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.message).toBe('Sweet not found');
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Original Sweet',
          category: 'Candy',
          price: 2.99,
          quantity: 50
        });
      sweetId = response.body.sweet._id;
    });

    it('should update sweet successfully', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Sweet',
          price: 3.99
        })
        .expect(200);

      expect(response.body.message).toBe('Sweet updated successfully');
      expect(response.body.sweet.name).toBe('Updated Sweet');
      expect(response.body.sweet.price).toBe(3.99);
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .put('/api/sweets/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.message).toBe('Sweet not found');
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Delete Test Sweet',
          category: 'Candy',
          price: 2.99,
          quantity: 50
        });
      sweetId = response.body.sweet._id;
    });

    it('should delete sweet as admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Sweet deleted successfully');

      // Verify deletion
      await request(app)
        .get(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.message).toBe('Admin access required.');
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    let sweetId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Purchase Test Sweet',
          category: 'Candy',
          price: 2.99,
          quantity: 10
        });
      sweetId = response.body.sweet._id;
    });

    it('should purchase sweet successfully', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 3 })
        .expect(200);

      expect(response.body.message).toBe('Purchase successful');
      expect(response.body.sweet.quantity).toBe(7);
      expect(response.body.purchased).toBe(3);
    });

    it('should purchase 1 by default', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.sweet.quantity).toBe(9);
      expect(response.body.purchased).toBe(1);
    });

    it('should return 400 for insufficient stock', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 15 })
        .expect(400);

      expect(response.body.message).toBe('Insufficient stock');
      expect(response.body.available).toBe(10);
    });

    it('should return 400 for invalid quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 0 })
        .expect(400);

      expect(response.body.message).toBe('Quantity must be at least 1');
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let sweetId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Restock Test Sweet',
          category: 'Candy',
          price: 2.99,
          quantity: 10
        });
      sweetId = response.body.sweet._id;
    });

    it('should restock sweet as admin', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 })
        .expect(200);

      expect(response.body.message).toBe('Restock successful');
      expect(response.body.sweet.quantity).toBe(60);
      expect(response.body.added).toBe(50);
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 50 })
        .expect(403);

      expect(response.body.message).toBe('Admin access required.');
    });

    it('should return 400 for invalid quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 0 })
        .expect(400);

      expect(response.body.message).toBe('Quantity must be at least 1');
    });
  });
});
