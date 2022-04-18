import Stripe from 'stripe'; // SDK
import { version } from '../../package.json'; // Versão do projeto

const KEY =
  process.env.STRIPE_API_KEY !== undefined ? process.env.STRIPE_API_KEY : '';

export const stripe = new Stripe(KEY, {
  apiVersion: '2020-08-27',
  appInfo: {
    name: 'Ignews',
    version,
  },
});
