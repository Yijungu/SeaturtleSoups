import styles from '../../styles/home/Header.module.scss';

export default function Header() {
  return (
    <div className={styles.headerContainer}>
      <h1 className={styles.homeTitle}>My Soup Recipe</h1>
      <h2 className={styles.homeTitleSmall}>AI 기반 바다거북수프 공장</h2>
    </div>
  );
}
