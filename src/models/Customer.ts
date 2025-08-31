import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
}

const CustomerSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
