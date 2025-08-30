import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExpenseStore from '@/models/ExpenseStore';

export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Name query parameter is required' }, { status: 400 });
  }

  try {
    // Search on the indexed lowercase field for better performance
    const stores = await ExpenseStore.find({
      name_lowercase: { $regex: name.toLowerCase() }
    }).limit(10); // Limit to 10 results for autocomplete

    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}