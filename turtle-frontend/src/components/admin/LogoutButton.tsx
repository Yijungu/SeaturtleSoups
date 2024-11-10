"use client";

import { useRouter } from "next/navigation";
import styles from "../../styles/admin/LogoutButton.module.scss";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    router.push("/admin/login");
  };

  return (
    <button onClick={handleLogout} className={styles.logoutButton}>
      로그아웃
    </button>
  );
}
