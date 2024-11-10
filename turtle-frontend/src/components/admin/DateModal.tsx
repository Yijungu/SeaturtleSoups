"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/admin/DateModal.module.scss";
import { getResponse, insertStory } from "../../app/api/admin";
import { toKSTISOString } from "../../utils/dateUtils";
import ExcelJS from "exceljs"; 

interface Story {
  id: number;
  question: string;
  answer: string;
  hint1: string;
  hint2: string;
  date: string;
  success_count: number;
  rating: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  stories: Story[];
  refreshStories: () => void;
}

interface ResponseData {
  id: number;
  question: string;
  response: string;
  created_at: string;
}

const DateModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  stories,
  refreshStories,
}) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [hint1, setHint1] = useState("");
  const [hint2, setHint2] = useState("");
  const [successCount, setSuccessCount] = useState(0);
  const [rating, setRating] = useState(0);

  // 기존 스토리 데이터를 미리 채우는 useEffect
  useEffect(() => {
    if (selectedDate) {
      const existingStory = stories.find(
        (story) => story.date === toKSTISOString(selectedDate)
      );

      if (existingStory) {
        setQuestion(existingStory.question);
        setAnswer(existingStory.answer);
        setHint1(existingStory.hint1);
        setHint2(existingStory.hint2);
        setSuccessCount(existingStory.success_count);
        setRating(existingStory.rating);
      } else {
        setQuestion("");
        setAnswer("");
        setHint1("");
        setHint2("");
        setSuccessCount(0);
        setRating(0);
      }
    }
  }, [selectedDate, stories]);

  const handleSaveStory = async () => {
    if (!selectedDate) return;

    try {
      await insertStory({
        question,
        answer,
        hint1,
        hint2,
        date: toKSTISOString(selectedDate),
      });
      refreshStories();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetQuestion = async () => {
    if (!selectedDate) return;

    try {
      const dateString = toKSTISOString(selectedDate).split("T")[0]; // 날짜 형식 변환
      const response = await getResponse(dateString); // 서버로부터 응답 받기
      downloadExcel(response); // 엑셀 파일로 다운로드
    } catch (error) {
      console.error("Failed to download question:", error);
    }
  };

  const downloadExcel = async (data: ResponseData[]) => {
    const workbook = new ExcelJS.Workbook(); // 새로운 워크북 생성
    const worksheet = workbook.addWorksheet("Responses"); // 워크시트 추가

    // 워크시트에 헤더 설정 (테이블 칼럼에 맞춤)
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "질문", key: "question", width: 30 },
      { header: "응답", key: "response", width: 30 },
      { header: "생성일", key: "created_at", width: 20 },
    ];

    // 데이터를 행으로 추가
    data.forEach((response) => {
      worksheet.addRow(response);
    });

    // 엑셀 파일 생성 및 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `responses_${Date.now()}.xlsx`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>
          {selectedDate?.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          의 스토리
        </h2>

        <input
          type="text"
          placeholder="질문 입력"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={styles.inputField}
        />
        <textarea
          placeholder="답변 입력"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="힌트 1 입력"
          value={hint1}
          onChange={(e) => setHint1(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="힌트 2 입력"
          value={hint2}
          onChange={(e) => setHint2(e.target.value)}
          className={styles.inputField}
        />

        <button className={styles.actionButton} onClick={handleSaveStory}>
          저장
        </button>

        <button
          className={`${styles.actionButton} ${styles.closeButton}`}
          onClick={onClose}
        >
          닫기
        </button>

        
      </div>
      <div className={styles.sidePanel}>
          <p className={styles.infoText}>
            성공 수: <strong>{successCount}</strong>
          </p>
          <p className={styles.infoText}>
            평점: <strong>{rating}</strong>
          </p>

        <button className={styles.actionButton} onClick={handleGetQuestion}>
          질문 다운로드
        </button>
        </div>
    </div>
  );
};

export default DateModal;
