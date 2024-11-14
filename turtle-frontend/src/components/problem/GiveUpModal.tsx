"use client";

import React from "react";
import Modal from "react-modal";
import styles from "../../styles/problem/GiveUpModal.module.scss";
import { useRouter } from "next/navigation";
import { isSameDay } from "../../helpers/dateHelpers";
import { toKSTISOStringFull } from "../../utils/dateUtils";

interface GiveUpModalProps {
  id: number;
  isOpen: boolean;
  onRequestClose: () => void;
}

const GiveUpModal: React.FC<GiveUpModalProps> = ({
  id,
  isOpen,
  onRequestClose,
}) => {
  const router = useRouter();
  const storyKey = `story_${id}`; // Unique key for the specific story

  // Save give-up information specific to the story
  const saveGiveUpToLocalStorage = () => {
    const now = new Date();
    const currentDate = toKSTISOStringFull(now);

    // Retrieve existing story data from local storage or initialize a new object
    const storyData = JSON.parse(localStorage.getItem(storyKey) || "{}");
    const endTime = storyData.endTime || "";

    if (!endTime) {
      storyData.endTime = currentDate; // endTime이 비어있을 경우 설정
      storyData.state = "giveup";
      const storedCheckedProblems = JSON.parse(
        localStorage.getItem("giveupProblem") || "[]"
      );

      // Check if the ID is already in the list; if not, add it
      if (!storedCheckedProblems.includes(id)) {
        storedCheckedProblems.push(id);

        // Store the updated list back into localStorage
        localStorage.setItem(
          "giveupProblem",
          JSON.stringify(storedCheckedProblems)
        );
      }
    }

    localStorage.setItem(storyKey, JSON.stringify(storyData));
  };

  // Confirm button click handler
  const handleConfirm = () => {
    saveGiveUpToLocalStorage(); // Save give-up data
    router.push(`/thanks?status=giveup&id=${id}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={styles.ModalContent}
      overlayClassName="ReactModal__Overlay"
    >
      <p>정말 포기하시겠습니까?</p>
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.modalButton} ${styles.cancel}`}
          onClick={onRequestClose}
        >
          취소
        </button>
        <button className={styles.modalButton} onClick={handleConfirm}>
          확인
        </button>
      </div>
    </Modal>
  );
};

export default GiveUpModal;
