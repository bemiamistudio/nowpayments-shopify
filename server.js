import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/webhooks/orders-create", async (req, res) => {
  try {
    console.log("WEBHOOK HIT");

    const order = req.body;
    console.log("ORDER BODY:", JSON.stringify(order, null, 2));

    const amount = order.total_price;
    const orderId = order.id;

    if (!amount || !orderId) {
      console.log("Missing order amount or order id");
      return res.status(400).send("Missing order data");
    }

    console.log("Amount:", amount);
    console.log("Order ID:", orderId);

    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: "usd",
        order_id: String(orderId),
        order_description: "Shopify Order " + orderId
      })
    });

    const data = await response.json();

    console.log("NOWPAYMENTS RESPONSE:", JSON.stringify(data, null, 2));
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
