// components/QuestionSection.tsx
"use client";

import React from "react";
import styles from "../../styles/problem/QuestionSection.module.scss";

interface QuestionSectionProps {
  question: string | null;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ question }) => {

  return (
    <div className={styles.question_section}>
      <span className={styles.description}>
        텍스트 입력 칸에 추측한 내용을 적으면 &apos;네&apos; 또는 &apos;아니오&apos; 형식의 답을 받을 수 있습니다.
      </span>

      <div className={styles.question_box}>
        <span className={styles.Question}>{question || "문제를 가져올 수 없습니다."}</span>
      </div>
    </div>
  );
};

export default QuestionSection;
