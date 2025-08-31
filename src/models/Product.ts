import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price?: number;
  gallery: {
    photos: string[];
    videos: string[];
  };
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number },
  gallery: {
    photos: [{ type: String }],
    videos: [{ type: String }],
  },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
