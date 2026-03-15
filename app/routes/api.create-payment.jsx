import axios from "axios";
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "payment-map.json");

function readMap() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeMap(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export async function action({ request }) {
  try {
    const body = await request.json();

    if (!body.orderId) {
      return Response.json({ error: "Missing orderId" }, { status: 400 });
    }

    const response = await axios.post(
      "https://api.nowpayments.io/v1/payment",
      {
        price_amount: body.amount || 50,
        price_currency: "usd",
        pay_currency: "btc",
        order_id: String(body.orderId),
        order_description: body.description || "Shopify order",
        ipn_callback_url: process.env.NOWPAYMENTS_WEBHOOK_URL,
      },
      {
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const payment = response.data;
    const db = readMap();

    db[String(payment.payment_id)] = {
      orderId: String(body.orderId),
      createdAt: new Date().toISOString(),
    };

    writeMap(db);

    return Response.json(payment);
  } catch (error) {
    console.error("NOWPayments create-payment error:", error?.response?.data || error.message);

    return Response.json(
      { error: error?.response?.data || error.message },
      { status: 500 }
    );
  }
}
