// server.js
const express = require('express');
const stripe = require('stripe')('sk_test_51ST4UF40HwZJ2DP83rA9XygygOdiVWx4MLzYvI7EElhrBzKX3sNh5CTc6iX6fBJuaSTE4VfVvVxOUOgoTq8L3uiI005sdONyGr');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const YOUR_DOMAIN = "http://localhost:3000"; 
// ❗ CHANGE THIS to your actual frontend URL

app.post('/create-checkout-session', async (req, res) => {
  const { price, productName } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
