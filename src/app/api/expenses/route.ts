import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Store from '@/models/Store';
import Product from '@/models/Product';
import mongoose from 'mongoose';

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
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body: RequestBody = await req.json();

    // Step 1: Find or create the store
    let storeId;
    if (mongoose.Types.ObjectId.isValid(body.store)) {
      const existingStore = await Store.findById(body.store);
      if (existingStore) {
        storeId = existingStore._id;
      } else {
        // This case is unlikely if frontend is correct, but handle it
        const newStore = new Store({ name: body.store });
        const savedStore = await newStore.save();
        storeId = savedStore._id;
      }
    } else {
      // It's a new store name
      const newStore = new Store({ name: body.store });
      const savedStore = await newStore.save();
      storeId = savedStore._id;
    }

    // Step 2: Process items to find or create products
    const processedItems = await Promise.all(body.items.map(async (item) => {
      let productId;
      if (mongoose.Types.ObjectId.isValid(item.product)) {
        const existingProduct = await Product.findById(item.product);
        if (existingProduct && existingProduct.store_id.equals(storeId)) {
          productId = existingProduct._id;
        } else {
          // Product ID is invalid or doesn't belong to this store, create new
          const newProduct = new Product({
            store_id: storeId,
            name: item.name,
            price: item.price,
          });
          const savedProduct = await newProduct.save();
          productId = savedProduct._id;
        }
      } else {
        // It's a new product name
        const newProduct = new Product({
          store_id: storeId,
          name: item.name,
          price: item.price,
        });
        const savedProduct = await newProduct.save();
        productId = savedProduct._id;
      }
      
      return {
        product: productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      };
    }));

    // Step 3: Create the new expense
    const newExpense = new Expense({
      store: storeId,
      items: processedItems,
      date: body.date,
      total: body.total,
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

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'stores',
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
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $addFields: {
          'storeInfo.name': '$storeInfo.name',
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
        $sort: { date: -1, createdAt: -1 }
      }
    ];

    if (search) {
      pipeline.unshift({
        $match: {
          $or: [
            { 'storeInfo.name': { $regex: search, $options: 'i' } },
            { 'items.name': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }
    
    const expenses = await Expense.aggregate(pipeline);

    return NextResponse.json(expenses);
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

    // Step 1: Find or create the store
    let storeId;
    if (mongoose.Types.ObjectId.isValid(body.store)) {
      const existingStore = await Store.findById(body.store);
      if (existingStore) {
        storeId = existingStore._id;
      } else {
        const newStore = new Store({ name: body.store });
        const savedStore = await newStore.save();
        storeId = savedStore._id;
      }
    } else {
      const newStore = new Store({ name: body.store });
      const savedStore = await newStore.save();
      storeId = savedStore._id;
    }

    // Step 2: Process items to find or create products
    const processedItems = await Promise.all(body.items.map(async (item) => {
      let productId;
      if (mongoose.Types.ObjectId.isValid(item.product)) {
        const existingProduct = await Product.findById(item.product);
        if (existingProduct && existingProduct.store_id.equals(storeId)) {
          productId = existingProduct._id;
        } else {
          const newProduct = new Product({
            store_id: storeId,
            name: item.name,
            price: item.price,
          });
          const savedProduct = await newProduct.save();
          productId = savedProduct._id;
        }
      } else {
        const newProduct = new Product({
          store_id: storeId,
          name: item.name,
          price: item.price,
        });
        const savedProduct = await newProduct.save();
        productId = savedProduct._id;
      }
      
      return {
        product: productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      };
    }));

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        store: storeId,
        items: processedItems,
        date: body.date,
        total: body.total,
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

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}