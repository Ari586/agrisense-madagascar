import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert the file to a Base64 Data URI
    // This allows storing the real image in the database without an external blob storage provider.
    const bytes = await (file as any).arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = (file as any).type || 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${base64}`;
    
    return NextResponse.json({ url: dataUri });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
