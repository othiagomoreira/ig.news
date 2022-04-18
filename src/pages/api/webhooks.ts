import type { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import Stripe from 'stripe';
import { stripe } from '../../services/stripe';
import { saveSubscription } from './_lib/manageSubscription';

type Secret = {
  secret: 'string || Buffer || string[]';
};

// Os dados recebidos dos webhooks não são enviados todos de uma vez
// Essa é uma função "pronta" que transforma a requisição em algo "legivel"
// Não é preciso decorar este código
async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

// Por padrão a requisão vem como JSON, ou envio de formulário
// Como essa vem no formato de stream, temos que desabilitar este padrão
export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export default async function webhooks(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const buf = await buffer(req); // Contem toda nossa requisição
    const secret = req.headers['stripe-signature'];

    let event: Stripe.Event = stripe.webhooks.constructEvent(
      buf,
      secret as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    const { type } = event;

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription;

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            );

            break;
          case 'checkout.session.completed':
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;

            await saveSubscription(
              checkoutSession.subscription?.toString() as string,
              checkoutSession.customer?.toString() as string,
              true
            );

            break;
          default:
            throw new Error('Unhandled event.');
        }
      } catch {
        return res.json({ error: 'Webhook handler failed' });
      }
    }

    return res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
}
