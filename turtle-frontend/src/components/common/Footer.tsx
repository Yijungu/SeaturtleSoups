import styles from '../../styles/common/Footer.module.scss';
import ThemeToggle from '../home/ThemeToggle';

export default function Footer() {
  return (
    <footer className={styles.footerContainer}>
      <p className={styles.footerText}>Copyright 2023. F22F. All rights reserved.</p>
      <p className={styles.footerText}>농협 3560317584693 이준구</p>
      <ThemeToggle/>
    </footer>
  );
}
