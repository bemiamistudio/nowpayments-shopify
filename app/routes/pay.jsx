import { useEffect, useState } from "react";
import { useSearchParams } from "@remix-run/react";

export default function PayPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return;
    }

    async function createPayment() {
      try {
        setLoading(true);

        const res = await fetch("/api/create-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Payment creation failed");
        }

        setPayment(data);

        if (data.invoice_url) {
          setTimeout(() => {
            window.location.href = data.invoice_url;
          }, 2000);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    createPayment();
  }, [searchParams]);

  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Pay with Crypto</h1>
        <p>Your order was created successfully.</p>
        <p>Click below to open the crypto payment page.</p>
        <a
          href="/app"
          style={{
            display: "inline-block",
            background: "black",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Open Payment Page
        </a>
      </div>
    );
  }

  if (loading) return <h2>Preparing your crypto payment...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Redirecting to payment...</h1>
      <p>Order: {payment?.order?.name}</p>
      <p>Amount: {payment?.order?.currentTotalPriceSet?.shopMoney?.amount}</p>
    </div>
  );
}
