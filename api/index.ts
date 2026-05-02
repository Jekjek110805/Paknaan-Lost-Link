import app from '../server';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (error: any) {
    console.error('API handler failed:', error);
    return res.status(500).json({
      error: 'API handler failed',
      details: error?.message || 'Unknown server error',
    });
  }
}
