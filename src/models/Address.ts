import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  customerId: mongoose.Schema.Types.ObjectId;
  receiverName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

const AddressSchema: Schema = new Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  receiverName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  landmark: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);
