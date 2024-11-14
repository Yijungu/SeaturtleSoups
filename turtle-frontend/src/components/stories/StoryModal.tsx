import React from "react";
import Modal from "react-modal";
import styles from "../../styles/stories/StoryModal.module.scss";

interface StoryModalProps {
  story: {
    id: number;
    title: string;
    question: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
}

const StoryModal: React.FC<StoryModalProps> = ({ story, isOpen, onClose, onNavigate }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className={styles.modalContent} overlayClassName={styles.modalOverlay}>
      <div className={styles.modalHeader}>
        <h2>{story.title}</h2>
        <button className={styles.modalCloseButton} onClick={onClose}>
          <span className={styles.closeIcon}>&times;</span> {/* Close icon styled as "×" */}
        </button>
      </div>
      <div className={styles.modalBody}>
        <p>{story.question}</p>
      </div>
      <button className={styles.joinButton} onClick={onNavigate}>문제 풀기</button>
    </Modal>
  );
};

export default StoryModal;
