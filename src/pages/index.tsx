/* eslint-disable @next/next/no-img-element */
import type { GetStaticProps } from 'next';
import Head from 'next/head';

import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';
import { formatPrice } from '../utils/format';

import styles from './home.module.scss';

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  };
}

const Home = ({ product }: HomeProps) => {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get acess to all the publications <br />
            <span>for {product.amount} month</span>
          </p>

          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl Coding" />
      </main>
    </>
  );
};

export default Home;

// Requisição da API Stripe, utilizando Static Site Generation (SSG)
export const getStaticProps: GetStaticProps = async () => {
  //  Retorna o preço do produto com o id correspondente
  const price = await stripe.prices.retrieve('price_1KpLRDBnCU1MyLYiC3m5P2hQ');

  const priceUnitAmount = price.unit_amount ? price.unit_amount / 100 : 0;

  const product = {
    priceId: price.id,
    amount: formatPrice(priceUnitAmount),
  };

  return {
    props: { product },
    revalidate: 60 * 60 * 24, // Após 24 horas, gere uma nova página estática
  };
};
