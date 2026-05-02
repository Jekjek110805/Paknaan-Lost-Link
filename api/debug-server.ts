export default async function handler(_req: any, res: any) {
  try {
    await import('../server');
    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({
      error: error?.message || 'Unknown import error',
      stack: error?.stack,
      name: error?.name,
    });
  }
}
