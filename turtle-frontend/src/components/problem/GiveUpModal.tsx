"use client";

import React from "react";
import Modal from "react-modal";
import styles from "../../styles/problem/GiveUpModal.module.scss";
import { useRouter } from "next/navigation";
import { isSameDay } from "../../helpers/dateHelpers"; 
import { toKSTISOStringFull } from "../../utils/dateUtils";

interface GiveUpModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const GiveUpModal: React.FC<GiveUpModalProps> = ({
  isOpen,
  onRequestClose,
}) => {
  const router = useRouter();
  // 기브업 정보 저장 함수
  const saveGiveUpToLocalStorage = () => {
    const now = new Date();
    const currentDate = toKSTISOStringFull(now);

    // 로컬 스토리지에서 기존 값 가져오기
    const savedGiveUpCount = Number(localStorage.getItem("giveUpCount") || 0);
    const lastCorrectDate = localStorage.getItem("lastCorrectDate") || "";
    const lastGiveUpDate = localStorage.getItem("lastGiveUpDate") || "";

    // 같은 날 중복 저장 방지
    if (!isSameDay(lastCorrectDate) && !isSameDay(lastGiveUpDate)) {
      localStorage.setItem("lastGiveUpDate", currentDate);
      localStorage.setItem("giveUpCount", (savedGiveUpCount + 1).toString());
    }
  };

  // 확인 버튼 클릭 핸들러
  const handleConfirm = () => {
    saveGiveUpToLocalStorage(); // 기브업 정보 저장
    router.push("/thanks?status=giveup");
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={styles.ModalContent}
      overlayClassName="ReactModal__Overlay"
    >
      <p>정말 포기하시겠습니까?</p>
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.modalButton} ${styles.cancel}`}
          onClick={onRequestClose}
        >
          취소
        </button>
        <button className={styles.modalButton} onClick={handleConfirm}>
          확인
        </button>
      </div>
    </Modal>
  );
};

export default GiveUpModal;
