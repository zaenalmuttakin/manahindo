
import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  name: string;
  address?: string;
  phone?: string;
  maps_link?: string;
}

const StoreSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String },
  phone: { type: String },
  maps_link: { type: String },
}, { timestamps: true });

export default mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema);
