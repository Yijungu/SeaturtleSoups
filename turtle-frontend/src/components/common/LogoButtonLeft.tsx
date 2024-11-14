"use client"; // Ensure it runs on the client

import { useRouter } from "next/navigation";
import styles from "../../styles/common/LogoButtonLeft.module.scss";

export default function LogoButton() {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push("/"); // Navigate to the home page
  };

  return (
    <div className={styles.logo_button} onClick={handleHomeClick}>
      My Soup Recipe
    </div>
  );
}
