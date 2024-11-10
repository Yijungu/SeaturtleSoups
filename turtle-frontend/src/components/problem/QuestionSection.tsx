// components/QuestionSection.tsx
"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/problem/QuestionSection.module.scss";
import { fetchStoryQuestion } from "../../app/api/qnaApi"; // API 함수 가져오기
import { isSameDay } from "../../helpers/dateHelpers";
import { toKSTISOStringFull } from "../../utils/dateUtils";

const QuestionSection: React.FC = () => {
  const [question, setQuestion] = useState<string | null>(null); // 문제 상태 관리
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태 관리

  // 로컬 스토리지의 startTime을 확인하고 초기화하는 함수
  const initializeStartTime = () => {
    const currentDate = toKSTISOStringFull(new Date());
    const storedStartTime = localStorage.getItem("startTime") || "";
    
    if (!isSameDay(storedStartTime)) {
      // 만약 startTime이 오늘이 아니면 업데이트하고 totalQuestionsAsked를 0으로 초기화
      localStorage.setItem("startTime", currentDate);
      localStorage.setItem("totalQuestionsAsked", "0");
      localStorage.setItem("qnas", "");
      localStorage.setItem("rating", "-1");
      localStorage.setItem("userAnswer", "");
      localStorage.setItem("openedHintCount", "");
      localStorage.setItem("openedHints", "");
    }
  };

  useEffect(() => {
    // 페이지 마운트 시 startTime 초기화
    initializeStartTime();

    // 백엔드에서 문제를 가져오는 함수
    const loadQuestion = async () => {
      try {
        const fetchedQuestion = await fetchStoryQuestion();
        setQuestion(fetchedQuestion);
      } catch (error) {
        setQuestion("문제를 가져올 수 없습니다."); // 에러 시 메시지 설정
        console.error("Error fetching story question: ", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, []);

  if (loading) {
    return <div>로딩 중...</div>; // 로딩 상태 표시
  }

  return (
    <div className={styles.question_section}>
      <span className={styles.description}>
        텍스트 입력 칸에 추측한 내용을 적으면 &apos;네&apos; 또는 &apos;아니오&apos; 형식의 답을 받을 수 있습니다.
      </span>

      <div className={styles.question_box}>
        <span className={styles.Question}>{question}</span>
      </div>
    </div>
  );
};

export default QuestionSection;
