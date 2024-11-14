"use client"; // Ensure it runs on the client

import { useRouter } from "next/navigation";
import styles from "../../styles/common/WarehouseButton.module.scss";

export default function WarehouseButton() {
  const router = useRouter();

  const handleWarehouseGetIn = () => {
    router.push("/storiesturtle-frontend/src/components/common/WarehouseButton.tsx"); // Navigate to the home page
  };

  return (
    <button
          className={styles.WarehouseButton}
          onClick={handleWarehouseGetIn}
        >
          {"지난 문제 보러 가기"}
        </button>
  );
}
