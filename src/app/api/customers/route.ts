import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const customer = await Customer.create(body);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("[API_CUSTOMER_POST]", error);
    const errorMessage = error instanceof Error ? error.message : 'Error creating customer';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const query = name ? { name: { $regex: name, $options: 'i' } } : {};
    const customers = await Customer.find(query);
    return NextResponse.json(customers);
  } catch (error) {
    console.error("[API_CUSTOMER_GET]", error);
    const errorMessage = error instanceof Error ? error.message : 'Error fetching customers';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
