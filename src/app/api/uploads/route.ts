import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises'; // Import unlink
import path from 'path';
import Expense from '@/models/Expense'; // Import Expense model
import connectMongoDB from '@/lib/mongodb'; // Import MongoDB connection

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folderId = formData.get('folderId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
    }

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID is required.' }, { status: 400 });
    }

    const uploadedFilePaths: string[] = [];
    const baseUploadDir = path.join(process.cwd(), 'public', 'uploads', 'expenses');
    const targetDir = path.join(baseUploadDir, folderId);

    // Ensure the target directory exists
    await mkdir(targetDir, { recursive: true });

    for (const file of files) {
      const maxFileSize = 4 * 1024 * 1024; // 4MB
      const allowedTypes = ['image/jpeg', 'image/png'];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `File type not allowed: ${file.name}. Only JPEG and PNG are allowed.` }, { status: 400 });
      }

      if (file.size > maxFileSize) {
        return NextResponse.json({ error: `File size exceeds 4MB for ${file.name}.` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = file.name.replace(/\s/g, '_');
      const filePath = path.join(targetDir, filename);

      await writeFile(filePath, buffer);
      uploadedFilePaths.push(`/uploads/expenses/${folderId}/${filename}`);
    }

    return NextResponse.json({ message: 'Files uploaded successfully', paths: uploadedFilePaths }, { status: 200 });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ error: 'Failed to upload files.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectMongoDB(); // Connect to MongoDB

    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get('expenseId');
    const imagePath = searchParams.get('imagePath');

    if (!expenseId || !imagePath) {
      return NextResponse.json({ error: 'Expense ID and image path are required.' }, { status: 400 });
    }

    // Security check: Ensure the imagePath is within the allowed uploads directory
    const absoluteImagePath = path.join(process.cwd(), 'public', imagePath);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'expenses');

    if (!absoluteImagePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid image path.' }, { status: 400 });
    }

    // 1. Delete file from file system
    try {
      await unlink(absoluteImagePath);
    } catch (fileError: unknown) {
      if ((fileError as { code: string }).code === 'ENOENT') {
        console.warn(`File not found on disk, but proceeding to update DB: ${absoluteImagePath}`);
      } else {
        console.error('Error deleting file from disk:', fileError);
        return NextResponse.json({ error: 'Failed to delete file from disk.' }, { status: 500 });
      }
    }

    // 2. Remove image path from Expense document in MongoDB
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { $pull: { attachments: imagePath } },
      { new: true } // Return the updated document
    );

    if (!updatedExpense) {
      return NextResponse.json({ error: 'Expense not found or image path not in attachments.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Image deleted successfully', updatedExpense }, { status: 200 });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image.' }, { status: 500 });
  }
}