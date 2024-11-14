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
  id: number;
  question: string;
  answer: string;
  background: string | null;
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
  id,
  question,
  answer,
  background,
}) => {
  const [text, setText] = useState<string>("");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const storyKey = `story_${id}`;

  // 입력 값이 변경될 때 호출되는 핸들러
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  // 성공 횟수와 마지막 성공 날짜 저장 함수
  const saveSuccessToLocalStorage = () => {
    const now = new Date();
    const currentDate = toKSTISOStringFull(now);

    // 로컬 스토리지에서 기존 스토리 데이터 가져오기
    const storyData = JSON.parse(localStorage.getItem(storyKey) || "{}");
    const endTime = storyData.endTime || "";

    if (!endTime) {
      storyData.endTime = currentDate; // endTime이 비어있을 경우 설정
      storyData.state = "correct";
      const storedCheckedProblems = JSON.parse(
        localStorage.getItem("successProblem") || "[]"
      );

      // Check if the ID is already in the list; if not, add it
      if (!storedCheckedProblems.includes(id)) {
        storedCheckedProblems.push(id);

        // Store the updated list back into localStorage
        localStorage.setItem(
          "successProblem",
          JSON.stringify(storedCheckedProblems)
        );
      }
    }

    localStorage.setItem(storyKey, JSON.stringify(storyData));
  };

  const incrementTotalQuestionsAsked = () => {
    const storyData = JSON.parse(localStorage.getItem(storyKey) || "{}");
    const totalQuestionsAsked = Number(storyData.totalQuestionsAsked || 0);
    storyData.totalQuestionsAsked = totalQuestionsAsked + 1;
    localStorage.setItem(storyKey, JSON.stringify(storyData));
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
          ? await submitQuestionToOpenAI(text_temp, question, answer, background)
          : await submitAnswerToOpenAI(text_temp, question, answer, background);

        if (response.startsWith("정답이 맞습니다") || response.startsWith("맞")) {
          saveSuccessToLocalStorage(); // 성공 정보 저장
          router.push(`/thanks?status=correct&id=${id}`);
          // Update story data in local storage with userAnswer
          const storyData = JSON.parse(localStorage.getItem(storyKey) || "{}");
          storyData.userAnswer = text_temp;
          localStorage.setItem(storyKey, JSON.stringify(storyData));
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
      e.preventDefault(); // 기본 Enter 동작 막기
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
