'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ShopPayment({ code }: { code: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'paid' | 'cancelled'>('pending');

  const transferContent = `SEVQR ${code}`;

  const qr = useMemo(() => {
    const params = new URLSearchParams({
      acc: '106885804727',
      bank: 'VietinBank',
      amount: '50000',
      des: transferContent,
    });

    return `https://qr.sepay.vn/img?${params.toString()}`;
  }, [transferContent]);

  useEffect(() => {
    let stopped = false;

    async function check() {
      try {
        const res = await fetch(
          `/api/orders/status?code=${encodeURIComponent(code)}`,
          { cache: 'no-store' }
        );

        if (!res.ok) return;

        const data = await res.json();

        if (stopped) return;

        setStatus(data.status);

        if (data.status === 'paid') {
          stopped = true;

          setTimeout(() => {
            router.replace('/dashboard');
            router.refresh();
          }, 1800);
        }
      } catch {}
    }

    check();

    const timer = setInterval(check, 3000);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [code, router]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  return (
    <section className="card paymentBox">
      <p className="label">THANH TOÁN SHOP</p>

      <div className="shopPrice">50.000đ</div>

      {status === 'paid' ? (
        <div className="paymentSuccess">
          <h2>✓ Thanh toán thành công</h2>
          <p>Shop đã được mở khóa.</p>
          <p className="muted">Đang cập nhật Dashboard...</p>
        </div>
      ) : (
        <>
          <img
            className="shopPaymentQr"
            src={qr}
            alt="QR thanh toán Shop M4X"
          />

          <div className="paymentInfo">
            <span>Ngân hàng</span>
            <b>VietinBank</b>

            <span>Số tài khoản</span>
            <b>
              106885804727
              <button
                type="button"
                className="copyPay"
                onClick={() => copy('106885804727')}
              >
                Sao chép
              </button>
            </b>

            <span>Chủ tài khoản</span>
            <b>NGUYEN MINH DAN</b>

            <span>Số tiền</span>
            <b>50.000đ</b>
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
            Chuyển đúng <b>50.000đ</b> và giữ nguyên nội dung phía trên.
          </p>
        </>
      )}
    </section>
  );
}
