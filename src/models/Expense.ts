import { Schema, model, models, Document } from 'mongoose';

export interface IExpenseItem {
  name: string;
  qty: number;
  price: number;
}

export interface IExpense extends Document {
  store: string;
  items: IExpenseItem[];
  total: number;
  date: Date;
}

const ExpenseSchema = new Schema({
  store: {
    type: String,
    required: true,
  },
  items: [{
    name: String,
    qty: Number,
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
});

export default models.Expense || model<IExpense>('Expense', ExpenseSchema);