import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  
  try {
    // Get auth header
    const authorization = request.headers.get('authorization') || '';
    
    // Forward the raw body to backend
    const body = await request.arrayBuffer();
    const contentType = request.headers.get('content-type') || '';
    
    const response = await fetch(`${backendUrl}/api/news/upload-image`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Authorization': authorization,
      },
      body: body,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Upload proxy error:', error);
    return NextResponse.json(
      { message: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
