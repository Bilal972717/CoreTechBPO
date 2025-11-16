const stripe = require('stripe')('sk_test_51ST4UF40HwZJ2DP83rA9XygygOdiVw4MLzYvI7EElhrBzKX3sNh5CTc6iX6fBJuaSTE4VfVvVxOUOgoTq8L3uiI005sdONyGr');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { price, productName } = req.body;

    console.log('Creating checkout session for price:', price);

    // Validate price
    if (!price || price < 1) {
      return res.status(400).json({ 
        error: 'Invalid price. Must be at least $1.00' 
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

    return res.status(200).json({ 
      id: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Stripe API error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message,
      type: error.type
    });
  }
}
