const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Allow requests from your front end
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { items } = req.body; // Array of { priceId, quantity } sent from index.html

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Build line items dynamically using your official Stripe Price IDs
    const lineItems = items.map(item => ({
      price: item.priceId,
      quantity: item.quantity
    }));

    // Create a dynamic Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment', // One-time charge
      success_url: 'https://www.digitizehowwemet.com/?status=success',
      cancel_url: 'https://www.digitizehowwemet.com/?status=cancel',
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
