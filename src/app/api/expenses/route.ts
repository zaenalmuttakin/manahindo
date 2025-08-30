import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';
import ExpenseStore from '@/models/ExpenseStore';
import ExpenseProduct from '@/models/ExpenseProduct';
import Abbreviation from '@/models/Abbreviation';
import mongoose from 'mongoose';
import { rm } from 'fs/promises';
import path from 'path';
import { formatDisplayName } from '@/lib/formatting';

interface ItemInput {
  product: string; // Can be an ID or a new name
  name: string;
  quantity: number;
  price: number;
}

interface RequestBody {
  store: string; // Can be an ID or a new name
  items: ItemInput[];
  date: Date;
  total: number;
  attachments?: string[];
  thumbnailPath?: string;
}

interface PopulatedItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  productInfo?: {
    _id: mongoose.Types.ObjectId;
    store_id: mongoose.Types.ObjectId;
    name: string;
    name_lowercase: string;
    price: number;
    description?: string;
  }
}

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

async function findOrCreateStore(storeInput: string): Promise<mongoose.Types.ObjectId> {
  await dbConnect();
  if (mongoose.Types.ObjectId.isValid(storeInput)) {
    const existingStore = await ExpenseStore.findById(storeInput);
    if (existingStore) {
      return existingStore._id;
    }
  }

  const lowerCaseName = storeInput.toLowerCase();
  const existingStoreByName = await ExpenseStore.findOne({ name_lowercase: lowerCaseName });

  if (existingStoreByName) {
    return existingStoreByName._id;
  }

  const abbreviations = await getAbbreviations();
  const formattedName = formatDisplayName(storeInput, abbreviations);

  const newStore = new ExpenseStore({
    name: formattedName,
    name_lowercase: lowerCaseName,
  });
  const savedStore = await newStore.save();
  return savedStore._id;
}

async function processExpenseItems(items: ItemInput[], storeId: mongoose.Types.ObjectId) {
  const abbreviations = await getAbbreviations();
  
  return Promise.all(items.map(async (item) => {
    let productId;
    let existingProduct = null;

    if (mongoose.Types.ObjectId.isValid(item.product)) {
      existingProduct = await ExpenseProduct.findById(item.product);
      if (existingProduct && !existingProduct.store_id.equals(storeId)) {
        existingProduct = null;
      }
    }

    const lowerCaseName = item.name.toLowerCase();

    if (!existingProduct) {
      existingProduct = await ExpenseProduct.findOne({
        store_id: storeId,
        name_lowercase: lowerCaseName
      });
    }

    if (existingProduct) {
      productId = existingProduct._id;
      if (item.price !== existingProduct.price) {
        existingProduct.price = item.price;
        await existingProduct.save();
      }
    } else {
      const formattedName = formatDisplayName(item.name, abbreviations);
      const newProduct = new ExpenseProduct({
        store_id: storeId,
        name: formattedName,
        name_lowercase: lowerCaseName,
        price: item.price,
      });
      const savedProduct = await newProduct.save();
      productId = savedProduct._id;
    }
    
    return {
      product: productId,
      name: item.name, // Keep original name from form for consistency in this transaction
      quantity: item.quantity,
      price: item.price,
    };
  }));
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body: RequestBody = await req.json();

    const storeId = await findOrCreateStore(body.store);
    const processedItems = await processExpenseItems(body.items, storeId);

    const newExpense = new Expense({
      store: storeId,
      items: processedItems,
      date: body.date,
      total: body.total,
      attachments: body.attachments || [],
      thumbnailPath: body.thumbnailPath || null,
    });

    await newExpense.save();

    return NextResponse.json(newExpense, { status: 201 });

  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const pipeline: mongoose.PipelineStage[] = [
      {
        $lookup: {
          from: 'expense_stores',
          localField: 'store',
          foreignField: '_id',
          as: 'storeInfo'
        }
      },
      {
        $unwind: '$storeInfo'
      },
      {
        $lookup: {
          from: 'expense_products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $addFields: {
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    productInfo: {
                      $arrayElemAt: [
                        '$productDetails',
                        {
                          $indexOfArray: ['$productDetails._id', '$$item.product']
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: { productDetails: 0 } // Remove the large productDetails array
      },
      {
        $sort: { date: -1, createdAt: -1 }
      }
    ];

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      pipeline.unshift({
        $match: {
          $or: [
            { 'storeInfo.name': searchRegex },
            { 'items.name': searchRegex }
          ]
        }
      });
    }
    
    const expenses = await Expense.aggregate(pipeline);

    // Post-process to format names for display
    const abbreviations = await getAbbreviations();
    const formattedExpenses = expenses.map(expense => ({
      ...expense,
      storeInfo: {
        ...expense.storeInfo,
        name: formatDisplayName(expense.storeInfo.name, abbreviations),
      },
      items: expense.items.map((item: PopulatedItem) => ({
        ...item,
        name: item.productInfo ? formatDisplayName(item.productInfo.name, abbreviations) : item.name,
      }))
    }));

    return NextResponse.json(formattedExpenses);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Expense ID' }, { status: 400 });
    }

    const body: RequestBody = await req.json();

    const storeId = await findOrCreateStore(body.store);
    const processedItems = await processExpenseItems(body.items, storeId);

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        store: storeId,
        items: processedItems,
        date: body.date,
        total: body.total,
        attachments: body.attachments || [],
        thumbnailPath: body.thumbnailPath || null,
      },
      { new: true }
    );

    if (!updatedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Expense ID' }, { status: 400 });
    }

    const expense = await Expense.findById(id);

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense._id) {
      try {
        const dirPath = path.join(process.cwd(), 'public', 'uploads', 'expenses', expense._id.toString());
        await rm(dirPath, { recursive: true, force: true });
      } catch (error) {
        console.error(`Failed to delete directory for expense ${id}:`, error);
      }
    }

    await Expense.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}