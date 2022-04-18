import { error } from 'console';
import { signIn, useSession } from 'next-auth/react';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss';

interface SubscribeButtonProps {
  priceId: string;
}

export const SubscribeButton = ({ priceId }: SubscribeButtonProps) => {
  const { data: session, status } = useSession();

  async function handleSubscribe() {
    if (status === 'unauthenticated') {
      signIn('github');
      return;
    }

    // Faz um requisição para nossa rota Back-end subscribe.
    // A mesma retorna as informações para a criação de uma checkout session no stripe
    const response = await api.post('/subscribe');
    const { sessionId } = response.data;

    // SDK Stripe usada para lidar com operações no fronten
    const stripe = await getStripeJs();

    // Redireciona o cliente passado como parametro para uma página segura de pagemento desenvolvida pelo STRIPE
    await stripe?.redirectToCheckout({ sessionId });
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe now
    </button>
  );
};
