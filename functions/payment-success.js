// payment-success.js
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.handler = async (event) => {
  const session_id = event.queryStringParameters?.session_id;
  if (!session_id) {
    return { statusCode: 400, body: 'Missing session_id' };
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);
  if (session.payment_status !== 'paid') {
    return { statusCode: 402, body: 'Payment not completed' };
  }

  // credentials come back in metadata
  const { username, password, productId } = session.metadata;
  return {
    statusCode: 200,
    body: JSON.stringify({ username, password, productId })
  };
};