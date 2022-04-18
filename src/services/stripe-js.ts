import { loadStripe } from '@stripe/stripe-js';

// SDK Stripe para lidar com as operações publicas, no frontend
export async function getStripeJs() {
  const stripeJs = await loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
  );

  return stripeJs;
}
