import { NextResponse } from 'next/server';
import { uploadToIPFS } from '@/app/utils/ipfs';

export async function POST(request: Request) {
  try {
    // Handle FormData upload
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Upload to IPFS using the server-side function
    const url = await uploadToIPFS(file);
    
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Error uploading file' },
      { status: 500 }
    );
  }
} 