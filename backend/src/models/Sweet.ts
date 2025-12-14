import mongoose, { Document, Schema } from 'mongoose';

export interface ISweet extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sweetSchema = new Schema<ISweet>(
  {
    name: {
      type: String,
      required: [true, 'Sweet name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: ['Chocolate', 'Candy', 'Cake', 'Cookie', 'Pastry', 'Ice Cream', 'Other'],
        message: 'Category must be one of: Chocolate, Candy, Cake, Cookie, Pastry, Ice Cream, Other'
      }
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    imageUrl: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Index for search functionality
sweetSchema.index({ name: 'text', category: 'text', description: 'text' });
sweetSchema.index({ price: 1 });
sweetSchema.index({ category: 1 });

export const Sweet = mongoose.model<ISweet>('Sweet', sweetSchema);
