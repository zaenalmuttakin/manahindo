import mongoose, { Schema, Document } from 'mongoose';

// Subdocument schema for order items
const OrderItemSchema: Schema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true }, // Snapshot of product name at time of order
  color: { type: String, trim: true },
  note: { type: String, trim: true },
  qty: { type: Number, required: true, min: 1 },
  discount: { type: Number, default: 0 },
  files: [{ type: String }], // For file uploads specific to an order item
});

export interface IOrder extends Document {
  customerId: mongoose.Schema.Types.ObjectId;
  addressId: mongoose.Schema.Types.ObjectId;
  orderDate: Date;
  deadline: Date;
  orderItems: {
    productId: mongoose.Schema.Types.ObjectId;
    productName: string;
    color?: string;
    note?: string;
    qty: number;
    discount?: number;
    files?: string[];
  }[];
}

const OrderSchema: Schema = new Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  orderDate: { type: Date, required: true, default: Date.now },
  deadline: { type: Date, required: true },
  orderItems: [OrderItemSchema],
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
