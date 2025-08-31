'use client';

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import Abbreviation from '@/models/Abbreviation';
import { formatDisplayName } from '@/lib/formatting';

// Helper to get abbreviations
let abbreviationsCache: string[] | null = null;
async function getAbbreviations(): Promise<string[]> {
  if (abbreviationsCache) {
    return abbreviationsCache;
  }
  await dbConnect();
  const abbreviations = await Abbreviation.find({}, 'name');
  abbreviationsCache = abbreviations.map(a => a.name);
  return abbreviationsCache;
}

// --- Helper: Find or Create Customer ---
async function findOrCreateCustomer(customerInput: string, abbreviations: string[]): Promise<mongoose.Types.ObjectId> {
  let customerId: mongoose.Types.ObjectId | null = null;

  if (mongoose.Types.ObjectId.isValid(customerInput)) {
    const existingCustomer = await Customer.findById(customerInput);
    if (existingCustomer) {
      customerId = existingCustomer._id;
    }
  }

  if (!customerId) { // Only search by name if not found by ID
    const customerByName = await Customer.findOne({ name: { $regex: new RegExp(`^${customerInput}$`, 'i') } });
    if (customerByName) {
      customerId = customerByName._id;
    }
  }

  if (!customerId) { // Only create new if not found by ID or name
    const newCustomer = new Customer({ name: formatDisplayName(customerInput, abbreviations), phone: '' });
    await newCustomer.save();
    customerId = newCustomer._id;
  }

  // At this point, customerId should always be set
  return customerId as mongoose.Types.ObjectId;
}

// --- Type for incoming order items from the client ---
interface OrderItemInput {
  product: {
    value: string;
    label: string;
  };
  qty: number;
  color?: string;
  note?: string;
  discount?: number;
}

// --- Helper: Process Order Items (Find or Create Products) ---
async function processOrderItems(items: OrderItemInput[], abbreviations: string[]) {
  return Promise.all(items.map(async (item) => {
    let resolvedProductId: mongoose.Types.ObjectId | null = null;
    const { product, qty, color, note, discount } = item;

    if (mongoose.Types.ObjectId.isValid(product.value)) {
      const existingProduct = await Product.findById(product.value);
      if (existingProduct) {
        resolvedProductId = existingProduct._id;
      }
    }

    if (!resolvedProductId) {
      const productByName = await Product.findOne({ name: { $regex: new RegExp(`^${product.label}'use client';

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import Abbreviation from '@/models/Abbreviation';
import { formatDisplayName } from '@/lib/formatting';

// Helper to get abbreviations
let abbreviationsCache: string[] | null = null;
async function getAbbreviations(): Promise<string[]> {
  if (abbreviationsCache) {
    return abbreviationsCache;
  }
  await dbConnect();
  const abbreviations = await Abbreviation.find({}, 'name');
  abbreviationsCache = abbreviations.map(a => a.name);
  return abbreviationsCache;
}

// --- Helper: Find or Create Customer ---
async function findOrCreateCustomer(customerInput: string, abbreviations: string[]): Promise<mongoose.Types.ObjectId> {
  let customerId: mongoose.Types.ObjectId | null = null;

  if (mongoose.Types.ObjectId.isValid(customerInput)) {
    const existingCustomer = await Customer.findById(customerInput);
    if (existingCustomer) {
      customerId = existingCustomer._id;
    }
  }

  if (!customerId) { // Only search by name if not found by ID
    const customerByName = await Customer.findOne({ name: { $regex: new RegExp(`^${customerInput}$`, 'i') } });
    if (customerByName) {
      customerId = customerByName._id;
    }
  }

  if (!customerId) { // Only create new if not found by ID or name
    const newCustomer = new Customer({ name: formatDisplayName(customerInput, abbreviations), phone: '' });
    await newCustomer.save();
    customerId = newCustomer._id;
  }

  // At this point, customerId should always be set
  return customerId as mongoose.Types.ObjectId;
}

// --- Type for incoming order items from the client ---
interface OrderItemInput {
  product: {
    value: string;
    label: string;
  };
  qty: number;
  color?: string;
  note?: string;
  discount?: number;
}

// --- Helper: Process Order Items (Find or Create Products) ---
, 'i') } });
      if (productByName) {
        resolvedProductId = productByName._id;
      }
    }

    if (!resolvedProductId) {
      const newProduct = new Product({ name: formatDisplayName(product.label, abbreviations), description: '' });
      await newProduct.save();
      resolvedProductId = newProduct._id;
    }

    return {
      productId: resolvedProductId as mongoose.Types.ObjectId,
      productName: product.label,
      qty,
      color,
      note,
      discount,
      files: [],
    };
  }));
}


// --- Main POST Handler ---
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { customer, addressId, orderDate, deadline, orderItems } = body;

    if (!customer || !addressId || !orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const abbreviations = await getAbbreviations();
    const customerId = await findOrCreateCustomer(customer.value, abbreviations);
    const processedItems = await processOrderItems(orderItems, abbreviations);

    const newOrder = new Order({
      customerId,
      addressId,
      orderDate,
      deadline,
      orderItems: processedItems,
    });

    await newOrder.save();

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error("[API_ORDER_POST]", error);
    const errorMessage = error instanceof Error ? error.message : 'Error creating order';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}