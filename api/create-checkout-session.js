const stripe = require('stripe')('sk_test_51ST4UF40HwZJ2DP83rA9XygygOdiVw4MLzYvI7EElhrBzKX3sNh5CTc6iX6fBJuaSTE4VfVvVxOUOgoTq8L3uiI005sdONyGr');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { price, productName } = req.body;
    
    console.log('Received request with price:', price);
    
    // Validate input
    if (!price || price <= 0) {
      return res.status(400).json({ 
        error: 'Invalid price',
        details: 'Price must be greater than 0'
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName || 'Business Process Consultation',
              description: 'Professional business consultation service',
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://your-domain.vercel.app'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://your-domain.vercel.app'}/cancel.html`,
    });

    console.log('Checkout session created:', session.id);
    
    res.status(200).json({ 
      id: session.id,
      url: session.url 
    });
    
  } catch (error) {
    console.error('Stripe API error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message,
      type: error.type
    });
  }
};
