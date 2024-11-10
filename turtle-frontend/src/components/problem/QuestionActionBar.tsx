"use client";

import React from "react";
import styles from "../../styles/problem/QuestionActionBar.module.scss";

interface QuestionActionBarProps {
  tabPressed: boolean;
  onQuestionCheck: () => void;
  onAnswerCheck: () => void;
  onHintClick: () => void;
  onGiveUpClick: () => void;
}

const QuestionActionBar: React.FC<QuestionActionBarProps> = ({
  tabPressed,
  onQuestionCheck,
  onAnswerCheck,
  onHintClick,
  onGiveUpClick,
}) => {

  const handleQuestionClick = () => {
    onAnswerCheck();
  };

  const handleAnswerClick = () => {
    onQuestionCheck();
  };

  return (
    <div className={styles.actionBar}>
      <div className={styles.questionCheckBox}>
        <div onClick={handleQuestionClick} className={styles.checkOption}>
          <div
            className={tabPressed ? styles.checked : styles.unchecked}
          ></div>
          질문
        </div>

        <div onClick={handleAnswerClick} className={styles.checkOption}>
          <div
            className={!tabPressed ? styles.checked : styles.unchecked}
          ></div>
          정답
        </div>
      </div>

      <div className={styles.leftButtons}>
        <button className={styles.actionButtonHint} onClick={onHintClick}>
          힌트보기
        </button>
        <button className={styles.actionButtonGiveUp} onClick={onGiveUpClick}>
          포기하기
        </button>
      </div>
    </div>
  );
};

export default QuestionActionBar;
