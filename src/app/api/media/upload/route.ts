import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPG, PNG, or MP4.' },
        { status: 400 }
      );
    }

    const maxSize = file.type === 'video/mp4' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large.' }, { status: 400 });
    }

    let blobUrl: string;

    if (false) {
      // Vercel Blob integration placeholder
      // Install @vercel/blob and uncomment to enable real uploads
      blobUrl = '';
    } else {
      // Demo mode: return a placeholder image URL
      const seed = randomUUID().slice(0, 8);
      blobUrl = file.type.startsWith('image/')
        ? `https://picsum.photos/seed/${seed}/800/800`
        : `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
    }

    const asset = {
      id: randomUUID(),
      userId: 'demo_user',
      blobUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
