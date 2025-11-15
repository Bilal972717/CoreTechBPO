const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  console.log('=== CHECKOUT SESSION REQUEST ===');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { price, productName } = req.body;
    
    console.log('Creating session for price:', price);
    
    // Validate input
    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    // Check if Stripe key is set
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName || 'Business Consultation',
              description: 'Professional business consultation service',
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

    console.log('Session created successfully:', session.id);
    
    // Return the session ID
    res.json({ 
      success: true,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Stripe error:', error);
    
    // Return specific error messages
    let errorMessage = error.message;
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid Stripe request. Check your API keys.';
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage
    });
  }
};
