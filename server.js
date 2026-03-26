import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/webhooks/orders-create", (req, res) => {
  console.log("WEBHOOK HIT");
  console.log("ORDER BODY:", JSON.stringify(req.body, null, 2));
  res.status(200).send("ok");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
