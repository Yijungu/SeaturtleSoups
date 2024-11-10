"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import GreenTurtle from "../../../public/images/GreenTurtle.png";
import WhiteTurtle from "../../../public/images/WhiteTurtle.png";
import styles from "../../styles/thanks/AIAnswer.module.scss";
import { fetchStoryAnswer } from "../../app/api/thanks";

export default function AIAnswer() {
  const [answer, setAnswer] = useState<string | null>(null); // 상태로 답변 관리
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태 관리
  const [error, setError] = useState<string | null>(null); // 에러 관리
  const [marginTop, setMarginTop] = useState<number>(15); 

  // 컴포넌트가 마운트될 때 fetchStoryAnswer 호출
  useEffect(() => {
    const fetchAnswer = async () => {
      try {
        const fetchedAnswer = await fetchStoryAnswer();
        setAnswer(fetchedAnswer);
      } catch (err) {
        console.error("Error fetching story answer:", err);
        setError("답변을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };
    const fetchUserAnswer = () => {
      try {
        const userAnswer = localStorage.getItem("userAnswer") || null;
        setMarginTop(!userAnswer ? 70 : 15); // 조건부로 marginTop 설정
      } catch (err) {
        console.error("Error fetching user answer:", err);
        setError("답변을 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchAnswer();
    fetchUserAnswer(); // 유저 답변을 불러옴
  }, []);

  // 로딩 상태 표시
  if (loading) {
    return <p className={styles.loading}>로딩 중...</p>;
  }

  // 에러 상태 표시
  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.Ai_answer_layout} style={{ marginTop }}>
      <div className={styles.AI_answer_box_tag}>
        <Image src={GreenTurtle} alt="Turtle" width={40} height={30} style={{ margin: "10px" }} />
        정답!
        <Image src={WhiteTurtle} alt="Turtle" width={40} height={30} style={{ margin: "10px" }} />
      </div>
      <div className={styles.AI_answer_box}>
        <p className={styles.AI_answer}>{answer}</p>
      </div>
    </div>
  );
}
