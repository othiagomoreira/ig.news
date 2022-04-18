/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import { SignInButton } from '../SignInButton';

import styles from './styles.module.scss';

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <img src="/images/logo.svg" alt="Logo" />

        <nav>
          <a href="#" className={styles.active}>
            Home
          </a>
          <a href="#">Posts</a>
        </nav>

        <SignInButton />
      </div>
    </header>
  );
};
