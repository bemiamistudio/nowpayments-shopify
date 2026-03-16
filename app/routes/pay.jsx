import { useSearchParams } from "@remix-run/react";

export default function PayPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 48, marginBottom: 12 }}>Pay with Bitcoin</h1>
      <p style={{ fontSize: 18, color: "#444", marginBottom: 24 }}>
        Complete your crypto payment below.
      </p>

      {!orderId ? (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 24,
            background: "#fafafa",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Payment page ready</h2>
          <p>
            Your payment link is active, but no Shopify order ID was passed into
            this page yet.
          </p>
          <p>
            You can still use this page as your checkout handoff page while the
            order-linking step is finished.
          </p>

          <div style={{ marginTop: 20 }}>
            <a
              href="/"
              style={{
                display: "inline-block",
                background: "black",
                color: "white",
                padding: "12px 20px",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Return to payment home
            </a>
          </div>

          <div style={{ marginTop: 24 }}>
            <strong>Important:</strong>
            <p style={{ marginTop: 8 }}>
              If you reached this page after checkout, your store still needs to
              pass the real Shopify order ID into the payment URL.
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 24,
            background: "#fafafa",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Order detected</h2>
          <p>
            Shopify Order ID:
            <br />
            <strong>{orderId}</strong>
          </p>

          <p style={{ marginTop: 16 }}>
            This page is ready to use the real Shopify order flow next.
          </p>
        </div>
      )}
    </div>
  );
}
