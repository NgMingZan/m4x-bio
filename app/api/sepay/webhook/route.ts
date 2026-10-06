import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const expected =
    process.env.SEPAY_WEBHOOK_API_KEY ||
    process.env.SEPAY_SECRET_KEY;

  const auth = req.headers.get('authorization') || '';

  if (
    !expected ||
    (auth !== `Apikey ${expected}` && auth !== `Bearer ${expected}`)
  ) {
    return NextResponse.json(
      { success: false, error: 'unauthorized' },
      { status: 401 }
    );
  }

  const x = await req.json();

  if (String(x.transferType || '').toLowerCase() !== 'in') {
    return NextResponse.json({ success: true });
  }

  const raw = `${x.code || ''} ${x.content || ''} ${x.description || ''}`.toUpperCase();
  const code = raw.match(/M4X[A-Z0-9]+/)?.[0];

  if (!code) {
    return NextResponse.json({ success: true });
  }

  const db = admin();
  const txid = String(x.id || x.transaction_id || '');

  if (txid) {
    const { data: seen } = await db
      .from('orders')
      .select('id')
      .eq('transaction_id', txid)
      .maybeSingle();

    if (seen) {
      return NextResponse.json({ success: true });
    }
  }

  const { data: order } = await db
    .from('orders')
    .select('*')
    .eq('code', code)
    .eq('status', 'pending')
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ success: true });
  }

  if (Number(x.transferAmount || 0) < Number(order.amount)) {
    return NextResponse.json({ success: true });
  }

  const { error } = await db
    .from('orders')
    .update({
      status: 'paid',
      transaction_id: txid || null,
      paid_at: new Date().toISOString()
    })
    .eq('id', order.id)
    .eq('status', 'pending');

  if (error) {
    return NextResponse.json(
      { success: false, error: 'update_failed' },
      { status: 500 }
    );
  }

  if (order.feature === 'shop' && order.user_id) {
    await db
      .from('profiles')
      .update({ shop_enabled: true })
      .eq('id', order.user_id);
  }

  return NextResponse.json({ success: true });
}
