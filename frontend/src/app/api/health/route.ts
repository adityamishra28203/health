import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://health-j0gvmolnu-adityamishra28203s-projects.vercel.app';

export async function GET(request: NextRequest) {
  try {
    // Try to connect to backend
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'connected',
        backend: data,
        frontend: {
          url: request.url,
          timestamp: new Date().toISOString(),
        }
      });
    } else {
      return NextResponse.json({
        status: 'backend_error',
        error: `Backend returned ${response.status}`,
        backend_url: BACKEND_URL,
        frontend: {
          url: request.url,
          timestamp: new Date().toISOString(),
        }
      }, { status: 502 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'connection_failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      backend_url: BACKEND_URL,
      frontend: {
        url: request.url,
        timestamp: new Date().toISOString(),
      }
    }, { status: 503 });
  }
}
