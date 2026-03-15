import { useMemo, useState } from "react";

export default function Pay() {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");

  async function createPayment() {
    try {
      setLoading(true);
      setError("");
      setPayment(null);

      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 50,
          orderId: `shopify-order-${Date.now()}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : JSON.stringify(data?.error || data)
        );
      }

      setPayment(data);
    } catch (err) {
      setError(err.message || "Failed to create payment");
    } finally {
      setLoading(false);
    }
  }

  const bitcoinLink = useMemo(() => {
    if (!payment?.pay_address || !payment?.pay_amount) return "";
    return `bitcoin:${payment.pay_address}?amount=${payment.pay_amount}`;
  }, [payment]);

  const qrUrl = useMemo(() => {
    if (!bitcoinLink) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
      bitcoinLink
    )}`;
  }, [bitcoinLink]);

  async function copyText(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("Copy failed");
      setTimeout(() => setCopied(""), 2000);
    }
  }

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Pay with Bitcoin</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Create one payment, then use wallet, copy buttons, or QR code.
      </p>

      <button
        onClick={createPayment}
        disabled={loading}
        style={{
          padding: "14px 18px",
          borderRadius: 10,
          border: "1px solid #ccc",
          background: "#111",
          color: "#fff",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        {loading ? "Creating payment..." : "Create BTC Payment"}
      </button>

      {error ? (
        <pre
          style={{
            marginTop: 16,
            padding: 12,
            background: "#fff1f0",
            border: "1px solid #ffa39e",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </pre>
      ) : null}

      {!payment ? null : (
        <>
          <div
            style={{
              marginTop: 20,
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 12,
              background: "#fafafa",
            }}
          >
            <p><strong>Status:</strong> {payment.payment_status}</p>
            <p><strong>Amount to pay:</strong> {payment.pay_amount} {payment.pay_currency?.toUpperCase()}</p>
            <p><strong>Order ID:</strong> {payment.order_id}</p>
            <p><strong>Expires:</strong> {payment.expiration_estimate_date}</p>
          </div>

          <div style={{ marginTop: 24 }}>
            <a
              href={bitcoinLink}
              style={{
                display: "inline-block",
                padding: "14px 18px",
                borderRadius: 10,
                background: "#111",
                color: "#fff",
                textDecoration: "none",
                fontWeight: "bold",
                marginRight: 12,
                marginBottom: 12,
              }}
            >
              Pay in Wallet
            </a>

            <button
              onClick={() => copyText(payment.pay_address, "Address copied")}
              style={{
                padding: "14px 18px",
                borderRadius: 10,
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                marginRight: 12,
                marginBottom: 12,
              }}
            >
              Copy Address
            </button>

            <button
              onClick={() => copyText(String(payment.pay_amount), "Amount copied")}
              style={{
                padding: "14px 18px",
                borderRadius: 10,
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              Copy Amount
            </button>

            {copied ? <p style={{ color: "green", marginTop: 8 }}>{copied}</p> : null}
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 12,
              background: "#fff",
            }}
          >
            <p style={{ marginBottom: 8 }}><strong>Bitcoin Address</strong></p>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                background: "#f6f6f6",
                padding: 12,
                borderRadius: 8,
              }}
            >
              {payment.pay_address}
            </pre>

            <p style={{ marginTop: 16, marginBottom: 8 }}><strong>Bitcoin URI</strong></p>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                background: "#f6f6f6",
                padding: 12,
                borderRadius: 8,
              }}
            >
              {bitcoinLink}
            </pre>
          </div>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <p><strong>QR Code</strong></p>
            <img
              src={qrUrl}
              alt="Bitcoin payment QR code"
              width="240"
              height="240"
              style={{ border: "1px solid #ddd", borderRadius: 12 }}
            />
            <p style={{ color: "#666", marginTop: 12 }}>
              Use this on desktop or scan with another device.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
