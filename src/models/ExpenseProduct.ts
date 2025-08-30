import mongoose, { Schema, Document } from 'mongoose';

export interface IExpenseProduct extends Document {
  store_id: mongoose.Schema.Types.ObjectId;
  name: string;
  name_lowercase: string;
  price: number;
  description?: string;
}

const ExpenseProductSchema: Schema = new Schema({
  store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseStore', required: true },
  name: { type: String, required: true },
  name_lowercase: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
}, { timestamps: true });

// Create a compound index to ensure product name is unique per store, case-insensitively
ExpenseProductSchema.index({ store_id: 1, name_lowercase: 1 }, { unique: true });

export default mongoose.models.ExpenseProduct || mongoose.model<IExpenseProduct>('ExpenseProduct', ExpenseProductSchema, 'expense_products');
