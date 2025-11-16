// api/create-checkout-session.js
const stripe = require('stripe')('sk_test_51ST4UF40HwZJ2DP83rA9XygygOdiVw4MLzYvI7EElhrBzKX3sNh5CTc6iX6fBJuaSTE4VfVvVxOUOgoTq8L3uiI005sdONyGr');

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { price, productName } = req.body;
    
    // Validate input
    if (!price || isNaN(price) || price < 1) {
      return res.status(400).json({ 
        error: 'Invalid price. Price must be at least $1.00' 
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName || 'Business Process Consultation',
            },
            unit_amount: Math.round(parseFloat(price) * 100), // Ensure it's a number
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://your-domain.vercel.app'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://your-domain.vercel.app'}/cancel.html`,
    });

    return res.status(200).json({ 
      id: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Stripe API Error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message,
      type: error.type,
      code: error.code
    });
  }
};
