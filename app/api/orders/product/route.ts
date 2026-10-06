import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { admin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    const id = Number(productId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Sản phẩm không hợp lệ' }, { status: 400 });
    }

    const db = admin();

    const { data: product, error: productError } = await db
      .from('products')
      .select('id,user_id,name,price,visible')
      .eq('id', id)
      .eq('visible', true)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    if (Number(product.price) <= 0) {
      return NextResponse.json({ error: 'Giá sản phẩm không hợp lệ' }, { status: 400 });
    }

    // Mỗi lần mua sinh một mã hoàn toàn mới.
    let order = null;

    for (let i = 0; i < 5; i++) {
      const code = 'M4X' + randomBytes(5).toString('hex').toUpperCase();

      const { data, error } = await db
        .from('orders')
        .insert({
          user_id: null,
          seller_id: product.user_id,
          product_id: product.id,
          feature: 'product',
          amount: product.price,
          code,
          status: 'pending'
        })
        .select('id,code,amount,status')
        .single();

      if (!error && data) {
        order = data;
        break;
      }

      if (error?.code !== '23505') {
        return NextResponse.json({ error: error?.message || 'Không tạo được đơn' }, { status: 500 });
      }
    }

    if (!order) {
      return NextResponse.json({ error: 'Không tạo được mã đơn' }, { status: 500 });
    }

    return NextResponse.json({
      ...order,
      productName: product.name
    });
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
