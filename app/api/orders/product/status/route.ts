import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase();

  if (!code || !/^M4X[A-Z0-9]+$/.test(code)) {
    return NextResponse.json({ error: 'Mã đơn không hợp lệ' }, { status: 400 });
  }

  const db = admin();

  const { data, error } = await db
    .from('orders')
    .select('code,status,amount,paid_at')
    .eq('code', code)
    .eq('feature', 'product')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Không kiểm tra được đơn' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Không tìm thấy đơn' }, { status: 404 });
  }

  return NextResponse.json(data);
}
