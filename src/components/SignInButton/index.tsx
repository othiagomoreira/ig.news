import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { signIn, signOut, useSession } from 'next-auth/react';

import styles from './styles.module.scss';

export const SignInButton = () => {
  const { data: session, status } = useSession();

  return status === 'authenticated' ? (
    <button type="button" className={styles.signInButton}>
      <FaGithub color="#04d361" />
      {session.user?.name}

      <FiX
        color="#737380"
        className={styles.closeIcon}
        onClick={() => signOut({ redirect: false })}
      />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => signIn('github')}
    >
      <FaGithub color="#eba417" />
      Sign in with Github
    </button>
  );
};
