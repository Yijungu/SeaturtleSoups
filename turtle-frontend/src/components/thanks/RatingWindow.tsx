"use client";

import { useState } from "react";
import styles from "../../styles/thanks/RatingWindow.module.scss";
import { addRating } from "../../app/api/thanks";
import { createComplaint } from "@/app/api/complaints";

interface RatingProps {
  isOpen: boolean;
  closeRating: (rate: number) => void;
  id: number; // ID for the specific story
}

export default function RatingFeedbackSwitch({
  isOpen,
  closeRating,
  id, // Receive the ID as a prop
}: RatingProps) {
  const [starFilled, setStarFilled] = useState(0); // State for selected star rating
  const [feedback, setFeedback] = useState(""); // State for feedback input
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission state

  const handleStarClick = async (star: number) => {
    setStarFilled(star);
    localStorage.setItem(`story_${id}_rating`, star.toString()); // Store rating in local storage for this specific story
    await addRating(id, star); // Send ID and rating to the API
    closeRating(star); // Close rating window after saving
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      alert("불편사항을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createComplaint({ description: feedback }); // Include ID in the complaint submission
      setResponseMessage(`불편사항이 접수되었습니다!`);

      setTimeout(() => {
        setResponseMessage(null);
      }, 2000);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setResponseMessage("불편사항 제출 중 오류가 발생했습니다.");

      setTimeout(() => setResponseMessage(null), 3000);
    } finally {
      setFeedback("");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.flipContainer} ${!isOpen ? styles.flipped : ""}`}>
      <div className={styles.front}>
        <h2>오늘의 레시피는 어떠셨나요?</h2>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              className={styles.star}
              key={star}
              style={{ color: star <= starFilled ? "gold" : "gray" }}
              onClick={() => handleStarClick(star)}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <div className={styles.back}>
        <textarea
          className={styles.textarea}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="불편사항을 적어주시면 시스템 개선에 많은 도움이 됩니다."
          rows={4}
        />
        <div className={styles.SubmitButtonBox}>
          <button
            className={styles.ratingButtonBox}
            onClick={handleFeedbackSubmit}
            disabled={isSubmitting}
          >
            {responseMessage || "제출"}
          </button>
        </div>
      </div>
    </div>
  );
}
