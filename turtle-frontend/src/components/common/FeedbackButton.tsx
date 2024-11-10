"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CSSTransition } from "react-transition-group";
import styles from "../../styles/common/FeedbackButton.module.scss";
import FeedBackButton from "../../../public/images/FeedbackButton.png";
import { createComplaint } from "@/app/api/complaints";

const FeedbackButton: React.FC = () => {
  const [showTip, setShowTip] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태 관리

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      alert("건의 사항을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true); // 제출 중 상태로 설정

    try {
      const id = await createComplaint({ description: feedback });
      setResponseMessage(`불만 사항이 접수되었습니다! ID: ${id}`);
      // 응답 메시지를 3초 동안 보여주고 초기화
      setTimeout(() => {
        setResponseMessage(null);
        setShowTip(false); // 폼 닫기
      }, 1000);
    } catch (error: unknown) {
      console.error("Error submitting complaint:", error);
      setResponseMessage("불만 사항 제출 중 오류가 발생했습니다.");

      // 오류 메시지도 3초 동안 표시 후 초기화
      setTimeout(() => setResponseMessage(null), 3000);
    } finally {
      setFeedback(""); // 제출 후 입력 초기화
      setIsSubmitting(false); // 제출 상태 해제
    }
  };

  return (
    <div className={styles.round_button}>
      <div onClick={() => setShowTip(!showTip)}>
        <Image src={FeedBackButton} alt="feedback" width={40} height={40} />
      </div>

      <CSSTransition
        in={showTip}
        timeout={500}
        classNames={{
          enter: styles["slide-enter"],
          enterActive: styles["slide-enter-active"],
          exit: styles["slide-exit"],
          exitActive: styles["slide-exit-active"],
        }}
        unmountOnExit
      >
        <div className={styles.feedback_form}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="건의 사항을 적어주세요."
            rows={4}
          />
          <button onClick={handleSubmit} disabled={isSubmitting}>
            {responseMessage || "제출"}
          </button>
        </div>
      </CSSTransition>
    </div>
  );
};

export default FeedbackButton;
