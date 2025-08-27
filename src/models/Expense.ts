import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IExpenseItem extends Document {
  product: mongoose.Schema.Types.ObjectId;
  name: string; // Keep name for display purposes, but link to product
  quantity: number;
  price: number;
}

export interface IExpense extends Document {
  store: mongoose.Schema.Types.ObjectId;
  items: IExpenseItem[];
  total: number;
  date: Date;
}

const ExpenseSchema = new Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: String, // Denormalized for easier display
    quantity: Number,
    price: Number,
  }],
  total: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default models.Expense || model<IExpense>('Expense', ExpenseSchema);