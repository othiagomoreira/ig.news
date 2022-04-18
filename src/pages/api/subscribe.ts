import type { NextApiRequest, NextApiResponse } from 'next';

import { getSession } from 'next-auth/react';
import { stripe } from '../../services/stripe';

export default async function subscribe(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const SUCCESS = process.env.STRIPE_SUCCESS_URL
    ? process.env.STRIPE_SUCCESS_URL
    : '';

  const CANCEL = process.env.STRIPE_CANCEL_URL
    ? process.env.STRIPE_CANCEL_URL
    : '';

  if (req.method === 'POST') {
    const session = await getSession({ req });

    const stripeCustomer = await stripe.customers.create({
      email: session?.user?.email as string,
    });

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [{ price: 'price_1KpLRDBnCU1MyLYiC3m5P2hQ', quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: SUCCESS,
      cancel_url: CANCEL,
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
}
