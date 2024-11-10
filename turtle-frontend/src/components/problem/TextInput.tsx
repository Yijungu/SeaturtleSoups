"use client";

import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  submitQuestionToOpenAI,
  submitAnswerToOpenAI,
} from "../../app/api/qnaApi";
import styles from "../../styles/problem/TextInput.module.scss";
import { isSameDay } from "../../helpers/dateHelpers";
import { toKSTISOStringFull } from "../../utils/dateUtils";

interface TextInputProps {
  addQna: (question: string, answer: string) => Qna[];
  tabPressed: boolean;
  onQuestionCheck: () => void;
  onAnswerCheck: () => void;
  updateLastQnaAnswer: (loadingQnas: Qna[], answer: string) => void;
}
interface Qna {
  question: string;
  answer: string;
}

const TextInput: React.FC<TextInputProps> = ({
  addQna,
  tabPressed,
  onQuestionCheck,
  onAnswerCheck,
  updateLastQnaAnswer,
}) => {
  const [text, setText] = useState<string>("");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 입력 값이 변경될 때 호출되는 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  // 성공 횟수와 마지막 성공 날짜 저장 함수
  const saveSuccessToLocalStorage = () => {
    const now = new Date();
    const currentDate = toKSTISOStringFull(now);

    // 로컬 스토리지에서 기존 값 가져오기
    const savedCorrectAnswers = Number(
      localStorage.getItem("correctAnswers") || 0
    );
    const lastCorrectDate = localStorage.getItem("lastCorrectDate") || "";
    const lastGiveUpDate = localStorage.getItem("lastGiveUpDate") || "";

    // 같은 날 중복 저장 방지
    if (!isSameDay(lastCorrectDate) && !isSameDay(lastGiveUpDate)) {
      localStorage.setItem("lastCorrectDate", currentDate);
      localStorage.setItem(
        "correctAnswers",
        (savedCorrectAnswers + 1).toString()
      );
    }
  };

  const incrementTotalQuestionsAsked = () => {
    const totalQuestionsAsked = Number(
      localStorage.getItem("totalQuestionsAsked") || 0
    );
    localStorage.setItem(
      "totalQuestionsAsked",
      (totalQuestionsAsked + 1).toString()
    );
  };

  // 제출 버튼 클릭 시 호출되는 핸들러
  const handleSubmit = async () => {
    if (isSubmitting) return; // 이미 제출 중이면 실행하지 않음
    setIsSubmitting(true); // 제출 시작

    if (text) {
      try {
        incrementTotalQuestionsAsked();
        const text_temp = text;
        const loadingQnas = addQna(text_temp, "응답 중...");
        const response = tabPressed
          ? await submitQuestionToOpenAI(text_temp)
          : await submitAnswerToOpenAI(text_temp);
        if (
          response.startsWith("정답이 맞습니다") ||
          response.startsWith("맞")
        ) {
          saveSuccessToLocalStorage(); // 성공 정보 저장
          router.push("/thanks?status=correct"); // /thanks 페이지로 이동
          localStorage.setItem("userAnswer", text_temp);
        } else {
          setText("");
          updateLastQnaAnswer(loadingQnas, response); // QnA 추가
        }
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    }

    setIsSubmitting(false); // 제출 완료
  };

  // Tab 키 입력 시 tabPressed 상태 전환
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault(); // 기본 Tab 동작 막기
      if (tabPressed) {
        onQuestionCheck();
      } else {
        onAnswerCheck();
      }
    }
    if (e.key === "Enter") {
      e.preventDefault(); // 기본 Tab 동작 막기
      handleSubmit();
    }
  };

  return (
    <div className={styles.inputContainer}>
      {!isSubmitting ? (
        <input
          className={styles.textbox}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="주어를 넣어서 입력해주세요."
        />
      ) : (
        <div className={styles.textboxfake}>주어를 넣어서 입력해주세요.</div>
      )}
      <button
        className={`${styles.inputButton} ${
          tabPressed ? styles.questionMode : styles.answerMode
        }`}
        onClick={handleSubmit}
      >
        {tabPressed ? "질문" : "정답"}
      </button>
    </div>
  );
};

export default TextInput;
