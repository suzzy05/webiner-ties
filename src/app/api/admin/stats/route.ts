import { getAdminStats, getRecentRegistrations, getRegistrationTrendLastDays } from '@/server/admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const [stats, recent, trend] = await Promise.all([
    getAdminStats(),
    getRecentRegistrations(10),
    getRegistrationTrendLastDays(30),
  ])
  return Response.json({ stats, recent, trend })
}
