import React, { useState } from "react";
import Image from "next/image";
import styles from "../../styles/problem/ProblemQA.module.scss";
import AiIcon from "../../../public/images/AiIcon.png";
import UserIcon from "../../../public/images/UserIcon.png";

interface QnAProps {
  question: string;
  answer: string;
  deleteQna: () => void; // 인덱스 없이 전달
}

const ProblemQA: React.FC<QnAProps> = ({ question, answer, deleteQna }) => {
  const [isAnswerLoading] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

    // answer를 파싱하여 "네", "아니오" 부분과 점수를 추출
    const parseAnswer = (answer: string) => {
      const match = answer.match(/^(네|아니오|확실히 모르겠습니다)\.\s*\[질문의 중요도\s*:\s*(\d+)점\]$/);
      if (match) {
        const responseText = match[1];
        const score = parseInt(match[2]) * 10; // 점수를 10배로 변환
        return { responseText, score };
      }
      return { responseText: answer, score: 0 };
    };
  
  const { responseText, score } = parseAnswer(answer);

  const handleDeleteClick = () => {
    deleteQna(); // QnA 삭제 요청
  };

  const handleMouseOver = () => setIsDeleteVisible(true);
  const handleMouseOut = () => setIsDeleteVisible(false);

  const fillColor =
  score <= 30 ? "var(--low-score-color)" : score <= 69 ?  "var(--medium-score-color)" :  "var(--high-score-color)";

  return (
    <div
      className={styles.container}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <div className={styles.box}>
        <Image src={UserIcon} alt="SeaTurtle" width={20} height={20} />
        <div className={styles.typography}>{question}</div>
      </div>

      <div
        className={styles["detail-box"]}
        style={{
          background: `linear-gradient(to right, ${fillColor} ${score}%, var(--background) ${score}%)`,
        }}
      >
        <Image src={AiIcon} alt="AI" width={20} height={20} />
        <div className={styles.typography}>{isAnswerLoading ? "로딩 중..." : responseText}</div>
        <div className={styles.percentage}>{score}%</div>
      </div>

      <div className={styles["delete-button"]}>
        <button
          className={isDeleteVisible ? "visible" : "hidden"}
          onClick={handleDeleteClick}
          style={{ fontSize: 10, color: "white" }}
        >
          삭 제
        </button>
      </div>
    </div>
  );
};

export default ProblemQA;
