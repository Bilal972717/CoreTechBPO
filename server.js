// server.js
const express = require('express');
const stripe = require('stripe')('sk_test_51ST4UF40HwZJ2DP83rA9XygygOdiVWx4MLzYvI7EElhrBzKX3sNh5CTc6iX6fBJuaSTE4VfVvVxOUOgoTq8L3uiI005sdONyGr');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Serve your HTML file

// Create Stripe checkout session
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
              name: productName || 'Business Process Consultation',
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel.html`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
