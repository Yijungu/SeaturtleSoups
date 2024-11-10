import Link from 'next/link';
import styles from '../../styles/home/StartButton.module.scss';

export default function StartButton() {
  return (
    <div className={styles.start_button_box}>
      <div className={styles.start_button}>
        <Link href="/problem" passHref className={styles.home_to_explanation}>
            시작하기✨
        </Link>
      </div>
    </div>
  );
}
