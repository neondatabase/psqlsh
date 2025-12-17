import { cleanup } from '../../server/scripts/cleanup';
import { logger } from '../../server/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const count = await cleanup();
    logger.info({ count }, 'Cron cleanup completed');
    return Response.json({ success: true, deletedBranches: count });
  } catch (error) {
    logger.error(error, 'Cron cleanup failed');
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
