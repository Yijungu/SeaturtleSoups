// components/CenteredModal.tsx
"use client";

import React from "react";
import Modal from "react-modal";
import styles from "../../styles/thanks/CenteredModal.module.scss"; // CSS 파일 추가 필요

interface CenteredModalProps {
  isOpen: boolean;
}

const CenteredModal: React.FC<CenteredModalProps> = ({ isOpen }) => {
  return (
    <Modal
      isOpen={isOpen}
      className={styles.modalContent}
      overlayClassName={styles.ReactModal__Overlay}
      ariaHideApp={false} // Next.js에서는 필수 설정입니다.
    >
      <div className={styles.message}>
        오늘 정답을 맞히거나 포기하지 않았습니다. 다시 도전해보세요!
      </div>
    </Modal>
  );
};

export default CenteredModal;
