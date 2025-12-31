import { NextResponse } from 'next/server';
import { insforgeFetch } from '@/lib/insforge';

export async function GET() {
  // TODO: 根据实际表名/视图调整路径，如 /rest/v1/transactions
  const data = await insforgeFetch<any[]>('/rest/v1/transactions');
  return NextResponse.json({ data });
}
