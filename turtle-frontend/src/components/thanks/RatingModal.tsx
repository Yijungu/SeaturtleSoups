import Modal from "react-modal";
import styles from "../../styles/thanks/RatingModal.module.scss";
import { useState } from "react";

interface RatingModalProps {
  isOpen: boolean;
  closeRating: (rate: number) => void;
}

export default function RatingModal({ isOpen, closeRating }: RatingModalProps) {
  const [starFilled, setStarFilled] = useState(0);
  const handleClose = async () => {
    closeRating(starFilled);
    localStorage.setItem("rating", starFilled.toString());
  };
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      overlayClassName="ReactModal__Overlay" 
      className={styles.ratingContent}
    >
      <h2>오늘의 레시피는 어떠셨나요?</h2>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
          className={styles.star}
            key={star}
            style={{ color: star <= starFilled ? "gold" : "gray" }}
            onClick={() => setStarFilled(star)}
          >
            ★
          </span>
        ))}
      </div>
      <button className={styles.ratingButtonBox} onClick={handleClose}>
        확인
      </button>
    </Modal>
  );
}
