require("dotenv").config()

const express = require("express")
const app = express()
const cors = require("cors")
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:3000"],
  })
)

app.use(express.static('public'))
app.use(express.json())


const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Item 1" }],
  [2, { priceInCents: 20000, name: "Item 2" }],
])

const items = [
  { id: 1, name: "Item 1", price: 10.00 },
  { id: 2, name: "Item 2", price: 20.00 },
];

app.get("/items", (req, res) => {
  res.json(items);
});
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id)
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        }
      }),
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3000)
