import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

import { query as q } from 'faunadb';
import { fauna } from '../../../services/fauna';

// Next Auth - Autenticações simples (Login Sociais)

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const { email } = user;

      const emailFormatted = email ? email : '';

      try {
        // Insere o email que retorna do Github dentro da tabela users
        await fauna.query(
          // Se o usuario com o email fornecido pelo Github não existir no meu banco de dados, cadastre ele
          q.If(
            q.Not(
              q.Exists(
                q.Match(q.Index('user_by_email'), q.Casefold(emailFormatted))
              )
            ),
            q.Create(q.Collection('users'), { data: { email } }),
            q.Get(q.Match(q.Index('user_by_email'), q.Casefold(emailFormatted)))
          )
        );

        return true;
      } catch {
        return false;
      }
    },
  },
});
