
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Store from '@/models/Store';

export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Name query parameter is required' }, { status: 400 });
  }

  try {
    const stores = await Store.find({
      name: { $regex: name, $options: 'i' } // Case-insensitive regex search
    }).limit(10); // Limit to 10 results for autocomplete

    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
