import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Expense, { IExpense } from '@/models/Expense';
import Abbreviation from '@/models/Abbreviation';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body: IExpense = await req.json();

    // Find and save abbreviations
    const storeName = body.store || '';
    const words = storeName.split(/\s+/);
    for (const word of words) {
      if (/^[A-Z]{2,5}$/.test(word)) {
        try {
          const abbr = new Abbreviation({ name: word });
          await abbr.save();
        } catch (error) {
          // Ignore duplicate key errors
          if ((error as { code: number }).code !== 11000) {
            throw error;
          }
        }
      }
    }

    body.store = body.store.toLowerCase();
    body.items = body.items.map(item => ({
      ...item,
      name: item.name.toLowerCase(),
    }));
    const expense = new Expense(body);
    await expense.save();
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let expenses: IExpense[] = [];
    if (search) {
      expenses = await Expense.find({
        'items.name': { $regex: search, $options: 'i' }
      }).sort({ date: -1 });
    } else {
      expenses = await Expense.find().sort({ date: -1 });
    }

    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body: IExpense = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    body.store = body.store.toLowerCase();
    body.items = body.items.map(item => ({
      ...item,
      name: item.name.toLowerCase(),
    }));

    const updatedExpense = await Expense.findByIdAndUpdate(id, body, { new: true });

    if (!updatedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(updatedExpense);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}