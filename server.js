import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/webhooks/orders-create", async (req, res) => {
  try {
    console.log("Webhook hit!");

    const order = req.body;

    console.log("ORDER:", order);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
