import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// temporary memory storage for testing
const payments = {};

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/pay", (req, res) => {
  const orderId = req.query.orderId;

  if (!orderId) {
    return res.status(400).send("Missing orderId");
  }

  const payment = payments[orderId];

  if (!payment) {
    return res.status(404).send("Payment link not found");
  }

  return res.redirect(payment.paymentUrl);
});

app.get("/api/payment-link", (req, res) => {
  const orderId = req.query.orderId;

  if (!orderId) {
    return res.status(400).json({ error: "Missing orderId" });
  }

  const payment = payments[orderId];

  if (!payment) {
    return res.status(404).json({ error: "Payment not found" });
  }

  return res.json(payment);
});

app.post("/webhooks/orders-create", async (req, res) => {
  try {
    const order = req.body;

    const orderId = String(order.id);
    const orderNumber = order.order_number;
    const orderName = order.name;
    const amount = order.total_price;

    console.log("ORDER ID:", orderId);
    console.log("ORDER NUMBER:", orderNumber);
    console.log("ORDER NAME:", orderName);
    console.log("AMOUNT:", amount);

    // stop duplicates for same Shopify order
    if (payments[orderId]) {
      console.log("EXISTING PAYMENT FOUND FOR THIS ORDER");
      console.log("PAYMENT LINK:", payments[orderId].paymentUrl);
      return res.status(200).send("already exists");
    }

    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: "usd",
        order_id: orderId,
        order_description: "Shopify Order " + orderName
      })
    });

    const data = await response.json();

    payments[orderId] = {
      orderId,
      orderNumber,
      orderName,
      amount,
      paymentUrl: data.invoice_url,
      invoiceId: data.id || null
    };

    console.log("NEW PAYMENT CREATED");
    console.log("PAYMENT LINK:", data.invoice_url);

    return res.status(200).send("ok");
  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).send("server error");
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
