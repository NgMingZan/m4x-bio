'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body style={{
        background: '#05080d',
        color: '#fff',
        padding: '24px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap'
      }}>
        <h2>M4X DEBUG ERROR</h2>

        <p>{error?.message || 'Unknown error'}</p>

        <pre style={{
          overflowWrap: 'anywhere',
          color: '#ff6b6b'
        }}>
          {error?.stack}
        </pre>

        <button onClick={reset}>
          Thử lại
        </button>
      </body>
    </html>
  );
}
