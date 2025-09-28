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
      // If backend has authentication issues, return mock data
      return NextResponse.json({
        status: 'mock_data',
        message: 'Backend requires authentication, using mock data',
        backend_url: BACKEND_URL,
        mock_data: {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: 3600,
          environment: 'development',
          platform: 'vercel',
          message: 'HealthWallet API is running (mock)',
          cors: 'enabled',
          endpoints: [
            '/health',
            '/',
            '/api/health-records',
            '/api/insurance-claims',
            '/api/analytics',
            '/api/docs'
          ]
        },
        frontend: {
          url: request.url,
          timestamp: new Date().toISOString(),
        }
      });
    }
  } catch (error) {
    // If connection fails, return mock data
    return NextResponse.json({
      status: 'mock_data',
      message: 'Backend connection failed, using mock data',
      error: error instanceof Error ? error.message : 'Unknown error',
      backend_url: BACKEND_URL,
      mock_data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: 3600,
        environment: 'development',
        platform: 'vercel',
        message: 'HealthWallet API is running (mock)',
        cors: 'enabled',
        endpoints: [
          '/health',
          '/',
          '/api/health-records',
          '/api/insurance-claims',
          '/api/analytics',
          '/api/docs'
        ]
      },
      frontend: {
        url: request.url,
        timestamp: new Date().toISOString(),
      }
    });
  }
}
