import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExpenseProduct from '@/models/ExpenseProduct';
import mongoose from 'mongoose';

// This route is for the old Expense form, using the ExpenseProduct model

export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const storeId = searchParams.get('storeId');

  if (!name) {
    return NextResponse.json({ error: 'Name query parameter is required' }, { status: 400 });
  }

  // Store ID is required for context, as product names are unique per store
  if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
    return NextResponse.json({ error: 'Valid storeId query parameter is required' }, { status: 400 });
  }

  try {
    const products = await ExpenseProduct.find({
      store_id: new mongoose.Types.ObjectId(storeId),
      name_lowercase: { $regex: name.toLowerCase() }
    }).limit(10);

    return NextResponse.json(products);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching expense products';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}