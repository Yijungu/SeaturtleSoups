"use client";

import Image from "next/image";
import BlueSpeechBubble from "../../../public/images/BlueSpeechBubble.png";
import WhiteSpeechBubble from "../../../public/images/WhiteSpeechBubble.png";
import styles from "../../styles/thanks/UserAnswer.module.scss";
import { useEffect, useState } from "react";

interface UserAnswerProps {
  id: string | null; // Add id prop to retrieve the specific story data
}

export default function UserAnswer({ id }: UserAnswerProps) {
  const [userAnswer, setUserAnswer] = useState<string | null>(null); // 사용자 답변 관리
  const [error, setError] = useState<string | null>(null); // 에러 상태 관리
  const [nickname, setNickName] = useState<string>("");

  // 로컬 스토리지에서 사용자 답변을 가져오는 함수
  useEffect(() => {
    const fetchUserAnswer = () => {
      try {
        // Retrieve user answer from the specific story based on id
        const storyData = JSON.parse(localStorage.getItem(`story_${id}`) || "{}");
        const fetchedAnswer = storyData.userAnswer || null;
        setUserAnswer(fetchedAnswer);
      } catch (err) {
        console.error("Error fetching user answer:", err);
        setError("답변을 불러오는 중 오류가 발생했습니다.");
      }
    };

    // Retrieve nickname from local storage
    setNickName(localStorage.getItem("nickname") || "사용자");
    fetchUserAnswer();
  }, [id]);

  // 에러가 발생했을 때 표시
  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  // 사용자 답변이 없으면 컴포넌트 렌더링 안 함
  if (!userAnswer) {
    return null;
  }

  // 사용자 답변이 있는 경우에만 컴포넌트 렌더링
  return (
    <div className={styles.user_answer_layout}>
      <div className={styles.user_answer_box_tag}>
        <Image
          src={BlueSpeechBubble}
          alt="Blue Speech Bubble"
          width={33}
          height={30}
          style={{ margin: "10px" }}
        />
        <span>{`${nickname}님의 정답`}</span>
        <Image
          src={WhiteSpeechBubble}
          alt="White Speech Bubble"
          width={33}
          height={30}
          style={{ margin: "10px" }}
        />
      </div>
      <div className={styles.user_answer_box}>
        <p className={styles.user_answer}>{userAnswer}</p>
      </div>
    </div>
  );
}
