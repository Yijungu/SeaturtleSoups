"use client";

import { refreshStory } from "@/app/api/admin";
import styles from "../../styles/admin/RefreshButton.module.scss";

export default function RefreshButton() {

  const handleRefresh = () => {
    refreshStory();
  };

  return (
    <button onClick={handleRefresh} className={styles.refreshButton}>
      리프레쉬
    </button>
  );
}
