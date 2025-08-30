import mongoose, { Schema, Document } from 'mongoose';

export interface IExpenseStore extends Document {
  name: string;
  name_lowercase: string;
  address?: string;
  phone?: string;
  maps_link?: string;
}

const ExpenseStoreSchema: Schema = new Schema({
  name: { type: String, required: true },
  name_lowercase: { type: String, required: true, unique: true, index: true },
  address: { type: String },
  phone: { type: String },
  maps_link: { type: String },
}, { timestamps: true });

export default mongoose.models.ExpenseStore || mongoose.model<IExpenseStore>('ExpenseStore', ExpenseStoreSchema, 'expense_stores');
