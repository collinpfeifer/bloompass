import Stripe from 'stripe';

if (!process.env.STRIPE_TEST_API_KEY)
  throw new Error('Missing STRIPE_TEST_API_KEY.');

const stripe = new Stripe(process.env.STRIPE_TEST_API_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export default stripe;
