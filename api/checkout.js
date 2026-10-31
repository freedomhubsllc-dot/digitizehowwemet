const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Allow requests from your front end (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { items } = req.body; // Expecting array of { price, quantity }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Format items for Stripe Checkout
    const line_items = items.map(item => ({
      price: item.price || item.priceId, // Accepts either price or priceId securely
      quantity: item.quantity || 1,
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: 'https://digitizehowwemet.com/?success=true',
      cancel_url: 'https://digitizehowwemet.com/?canceled=true',
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
