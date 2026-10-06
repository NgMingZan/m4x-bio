import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const s = await supabaseServer();

  const {
    data: { user }
  } = await s.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401 }
    );
  }

  const code = req.nextUrl.searchParams.get('code')?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json(
      { error: 'missing_code' },
      { status: 400 }
    );
  }

  const { data, error } = await s
    .from('orders')
    .select('code,status,amount,paid_at')
    .eq('user_id', user.id)
    .eq('code', code)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: 'order_not_found' },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
