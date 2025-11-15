const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  console.log('=== CHECKOUT SESSION REQUEST START ===');
  
  // Enable CORS
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
    
    console.log('Received price:', price, 'product:', productName);
    
    // Validate
    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    // Check Stripe key
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      console.error('Invalid Stripe key:', process.env.STRIPE_SECRET_KEY);
      return res.status(500).json({ error: 'Server configuration error - Invalid Stripe key' });
    }

    console.log('Creating Stripe session with amount:', price * 100);
    
    // Create Stripe session
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
            unit_amount: Math.round(price * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://your-app.vercel.app'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://your-app.vercel.app'}/cancel.html`,
    });

    console.log('✅ Session created successfully:', session.id);
    
    res.json({ 
      success: true,
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Stripe error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      type: error.type,
      code: error.code
    });
  }
};
