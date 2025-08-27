import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Abbreviation from '@/models/Abbreviation';

export async function GET() {
  try {
    await dbConnect();
    const abbreviations = await Abbreviation.find({});
    return NextResponse.json(abbreviations.map(abbr => abbr.name));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const newAbbreviation = new Abbreviation({ name: body.name.toUpperCase() });
    await newAbbreviation.save();
    return NextResponse.json(newAbbreviation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
