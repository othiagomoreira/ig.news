import type { NextApiRequest, NextApiResponse } from 'next';
import { query as q } from 'faunadb';
import { getSession } from 'next-auth/react';
import { stripe } from '../../services/stripe';
import { fauna } from '../../services/fauna';

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

export default async function subscribe(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Acessa os cookies do site, e pega os dados do usuario vindo da requisição
    const session = await getSession({ req });

    // Busca um usuario no meu banco de dados
    // Que o email cadastrado no FaunaDB, seja igual ao email armazenado nos cookies do site
    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session?.user?.email as string)
        )
      )
    );

    // Pega o customerID do banco de dados
    let customerId = user.data.stripe_customer_id;

    // Se o customerID não existir, crie o customer e implemente ele no banco de dados
    if (!customerId) {
      // Cria um cliente stripe, esse cliente recebe o mesmo email do usuário que esta logado através do Github
      const stripeCustomer = await stripe.customers.create({
        email: session?.user?.email as string,
      });

      // Atualiza as informações do usuário na Collection users
      // Acrescentando a ele a stripe_customer_id
      // Esta "propriedade" recebe um ID, que é criado pelo STRIPE quando o usuario faz uma checkout session
      await fauna.query(
        q.Update(q.Ref(q.Collection('users'), user.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id,
          },
        })
      );

      customerId = stripeCustomer.id;
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId, // Cria um ID para nosso cliente, esse cliente irá aparecer no painel do stripe
      payment_method_types: ['card'], // Método de Pagamento
      billing_address_collection: 'required', // Endereço Fisico
      line_items: [{ price: 'price_1KpLRDBnCU1MyLYiC3m5P2hQ', quantity: 1 }], // Id do produto e quantidade
      mode: 'subscription', // Pagamento recorrente
      allow_promotion_codes: true, // Possibilidade de cupons de desconto
      success_url: process.env.STRIPE_SUCCESS_URL as string, // URL de sucesso
      cancel_url: process.env.STRIPE_CANCEL_URL as string, // URL de cancelamento
    });

    return res.status(200).json({ sessionId: stripeCheckoutSession.id });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
}
