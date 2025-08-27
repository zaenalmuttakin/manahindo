
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const storeId = searchParams.get('storeId');

  if (!name) {
    return NextResponse.json({ error: 'Name query parameter is required' }, { status: 400 });
  }

  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    return NextResponse.json({ error: 'Valid storeId query parameter is required' }, { status: 400 });
  }

  try {
    const products = await Product.find({
      store_id: new mongoose.Types.ObjectId(storeId),
      name: { $regex: name, $options: 'i' } // Case-insensitive regex search
    }).limit(10);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
