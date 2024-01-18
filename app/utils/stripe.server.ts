import Stripe from 'stripe';
let stripe: Stripe;
if (process.env.NODE_ENV !== 'production') {
  if (!process.env.STRIPE_TEST_API_KEY)
    throw new Error('Missing STRIPE_TEST_API_KEY.');

  stripe = new Stripe(process.env.STRIPE_TEST_API_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
  // if (!process.env.STRIPE_API_KEY)
  //   throw new Error('Missing STRIPE_LIVE_API_KEY.');

  // stripe = new Stripe(process.env.STRIPE_API_KEY, {
  //   apiVersion: '2023-10-16',
  //   typescript: true,
  // });
} else {
  if (!process.env.STRIPE_API_KEY)
    throw new Error('Missing STRIPE_LIVE_API_KEY.');

  stripe = new Stripe(process.env.STRIPE_API_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
}

export default stripe;
