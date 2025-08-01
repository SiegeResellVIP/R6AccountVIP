// create-checkout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// Hard-code your three products here:
const PRODUCTS = {
  diamond_tier: {
    name: 'Diamond Tier Account',
    amount: 30000,   // cents → $300.00
    currency: 'usd',
    credentials: {
      username: 'DiamondUser123',
      password: 'P@ssw0rd!'
    }
  },
  collector_pro: {
    name: "Collector's Pro League Account",
    amount: 50000,
    currency: 'usd',
    credentials: {
      username: 'Collector007',
      password: 'EliteSkin$'
    }
  },
  starter: {
    name: "Beginner's Starter Account",
    amount: 5000,
    currency: 'usd',
    credentials: {
      username: 'NewbieStart',
      password: 'StartHere1'
    }
  }
};

exports.handler = async (event) => {
  const { productId } = JSON.parse(event.body || '{}');
  const p = PRODUCTS[productId];
  if (!p) return { statusCode: 400, body: 'Invalid productId' };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: p.currency,
        product_data: { name: p.name },
        unit_amount: p.amount
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: `${process.env.SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.SITE_URL}`,
    metadata: {
      productId,
      username: p.credentials.username,
      password: p.credentials.password
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ sessionId: session.id })
  };
};