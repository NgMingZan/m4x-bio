'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
};

type Order = {
  code: string;
  amount: number;
  status: string;
  productName: string;
};

export default function ProductShop({
  products
}: {
  products: Product[];
  profile?: unknown;
}) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function buy(product: Product) {
    setSelected(product);
    setOrder(null);
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/orders/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Không tạo được đơn');

      setOrder(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!order || order.status === 'paid') return;

    let stopped = false;

    async function check() {
      try {
        const res = await fetch(
          `/api/orders/product/status?code=${encodeURIComponent(order!.code)}`,
          { cache: 'no-store' }
        );

        if (!res.ok) return;

        const data = await res.json();

        if (!stopped && data.status === 'paid') {
          setOrder(x => x ? { ...x, status: 'paid' } : x);
        }
      } catch {}
    }

    check();
    const timer = setInterval(check, 3000);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [order?.code, order?.status]);

  const transferContent = order ? `SEVQR ${order.code}` : '';

  const qr = order
    ? `https://qr.sepay.vn/img?acc=106885804727&bank=VietinBank&amount=${encodeURIComponent(String(order.amount))}&des=${encodeURIComponent(transferContent)}`
    : '';

  function close() {
    setSelected(null);
    setOrder(null);
    setError('');
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  return (
    <>
      <div className="publicProducts">
        {products.map(x => (
          <article className="product publicProduct" key={x.id}>
            {x.image_url ? (
              <img className="productImage" src={x.image_url} alt="" />
            ) : (
              <div className="productCover"><span>✦</span></div>
            )}

            <div className="productBody">
              <h3>{x.name}</h3>
              <p>{x.description}</p>

              <div>
                <strong>{Number(x.price).toLocaleString('vi-VN')}đ</strong>

                <button
                  type="button"
                  className="buyPill"
                  onClick={() => buy(x)}
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div className="checkoutOverlay" onClick={close}>
          <div className="checkoutModal" onClick={e => e.stopPropagation()}>
            <button type="button" className="checkoutClose" onClick={close}>×</button>

            <p className="label">M4X / SEPAY</p>
            <h2>{selected.name}</h2>

            <div className="checkoutPrice">
              {Number(selected.price).toLocaleString('vi-VN')}đ
            </div>

            {loading && <p className="muted">Đang tạo đơn thanh toán...</p>}

            {error && <p className="saveMsg">{error}</p>}

            {order?.status === 'paid' ? (
              <div className="paymentSuccess">
                <h2>✓ Thanh toán thành công</h2>
                <p>Mã đơn: {order.code}</p>
              </div>
            ) : order ? (
              <>
                <img
                  className="checkoutQr"
                  src={qr}
                  alt="QR SePay"
                />

                <div className="checkoutBank">
                  <span>Ngân hàng</span>
                  <b>VietinBank</b>

                  <span>Số tài khoản</span>
                  <b>106885804727</b>

                  <span>Chủ tài khoản</span>
                  <b>NGUYEN MINH DAN</b>

                  <span>Số tiền</span>
                  <b>{Number(order.amount).toLocaleString('vi-VN')}đ</b>
                </div>

                <p className="muted">Nội dung chuyển khoản</p>

                <button
                  type="button"
                  className="payCode payCodeButton"
                  onClick={() => copy(transferContent)}
                >
                  {transferContent}
                </button>

                <div className="paymentWaiting">
                  <span className="paymentDot" />
                  Đang chờ SePay xác nhận...
                </div>

                <p className="paymentNote">
                  Mỗi đơn có mã riêng. Không sửa nội dung chuyển khoản.
                </p>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
