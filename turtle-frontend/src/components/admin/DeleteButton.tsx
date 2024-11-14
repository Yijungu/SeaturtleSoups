"use client";

import { deleteStory } from "@/app/api/admin";
import styles from "../../styles/admin/DeleteButton.module.scss";

interface DeleteButtonProps {
  date: string;
  refreshStories : () => void;
}

export default function DeleteButton({ date, refreshStories }: DeleteButtonProps) {

  const handleDeleteStory = async () => {
    await deleteStory(date);
    refreshStories();
  };

  return (
    <button onClick={handleDeleteStory} className={styles.actionButton}>
      삭제
    </button>
  );
}
