import fs from "fs";
import path from "path";
import { authenticate } from "../shopify.server";

const DB_FILE = path.join(process.cwd(), "payment-map.json");

function readMap() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return {};
  }
}

export async function action({ request }) {
  try {
    const payload = await request.json();

    console.log("NOWPayments webhook received:", payload);

    const paymentId = String(payload.payment_id);
    const status = payload.payment_status;

    const db = readMap();
    const record = db[paymentId];

    if (!record) {
      console.log("No payment mapping found for payment_id:", paymentId);
      return Response.json({ ok: false, message: "Payment not found" });
    }

    if (status !== "finished" && status !== "confirmed") {
      console.log("Payment status not final:", status);
      return Response.json({ ok: true, status });
    }

    const { admin } = await authenticate.admin(request);
    const orderGid = `gid://shopify/Order/${record.orderId}`;

    const response = await admin.graphql(
      `#graphql
      mutation MarkOrderPaid($id: ID!) {
        orderMarkAsPaid(input: { id: $id }) {
          order {
            id
            displayFinancialStatus
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: { id: orderGid },
      }
    );

    const result = await response.json();
    console.log("orderMarkAsPaid result:", JSON.stringify(result, null, 2));

    return Response.json({ ok: true, result });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
