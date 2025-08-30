import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Address from '@/models/Address';

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const address = await Address.create(body);
    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("[API_ADDRESS_POST]", error);
    const errorMessage = error instanceof Error ? error.message : 'Error creating address';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    if (!customerId) {
      return NextResponse.json({ error: 'customerId query parameter is required' }, { status: 400 });
    }
    const addresses = await Address.find({ customerId });
    return NextResponse.json(addresses);
  } catch (error) {
    console.error("[API_ADDRESS_GET]", error);
    const errorMessage = error instanceof Error ? error.message : 'Error fetching addresses';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
