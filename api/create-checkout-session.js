const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { price, productName, successUrl, cancelUrl } = req.body;

    // Validate input
    if (!price || price <= 0) {
      return res.status(400).json({ 
        error: 'Valid price is required and must be greater than 0' 
      });
    }

    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return res.status(500).json({ 
        error: 'Server configuration error' 
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
              description: 'Expert business consultation with dynamic pricing'
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${getBaseUrl(req)}/success.html`,
      cancel_url: cancelUrl || `${getBaseUrl(req)}/cancel.html`,
      metadata: {
        product_name: productName || 'Business Consultation',
        customer_price: price.toString()
      }
    });

    console.log('Checkout session created successfully:', session.id);
    
    return res.status(200).json({ 
      sessionId: session.id,
      message: 'Checkout session created successfully'
    });

  } catch (error) {
    console.error('Stripe API error:', error);
    
    return res.status(500).json({ 
      error: error.message || 'Failed to create checkout session',
      code: error.type || 'unknown_error'
    });
  }
};

// Helper function to get base URL
function getBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers['host'];
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  return `${protocol}://${host}`;
}
