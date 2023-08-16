require("dotenv").config();

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const app = express();

app.use(cors({
  origin: ["http://127.0.0.1:3000"],
}));
app.use(express.static("public"));
app.use(express.json());

const storeItems = new Map([
  [1, { priceInCents: 1000, name: "T-Shirt" }],
  [2, { priceInCents: 2000, name: "Shoes" }],
]);

app.get("/items", (req, res) => {
  const itemsArray = Array.from(storeItems);
  res.json(itemsArray);
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/send_email', (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'your_email_service', // Example: 'Gmail'
    auth: {
      user: 'your_email@example.com',
      pass: 'your_email_password',
    },
  });

  const mailOptions = {
    from: email,
    to: 'simpleShop@test.com', // Change this to the recipient's email
    subject: 'Contact Form Submission',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending message.');
    } else {
      console.log('Email sent: ' + info.response);
      res.send('Message sent successfully!');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
