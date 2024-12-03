"use client";

import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import styles from "@/styles/stories/UsernameRecoveryModal.module.scss"; // 아이디 찾기 전용 스타일
import { findUsername } from "@/app/api/login";

type UsernameRecoveryModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function UsernameRecoveryModal({
  isOpen,
  onClose,
}: UsernameRecoveryModalProps) {
  const [securityCode, setSecurityCode] = useState("");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSecurityCode("");
      setResponseMessage(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      const username = await findUsername(securityCode);
      setResponseMessage(`아이디는 "${username}"입니다.`);
    } catch (error) {
      console.error("Error finding username:", error);
      setResponseMessage("아이디 찾기 실패. 입력 정보를 확인해주세요.");
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.modalOverlay}
      ariaHideApp={false}
      shouldCloseOnOverlayClick={false}
    >
      <div className={styles.modalContent}>
        <h2>아이디 찾기</h2>
        <div className={styles.formGroup}>
          <label>보안 코드</label>
          <input
            type="text"
            className={styles.input}
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
          />
        </div>
        {responseMessage && (
          <p className={styles.responseMessage}>{responseMessage}</p>
        )}
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={onClose}>
            {responseMessage ? "확인" : "취소"}
          </button>
          {!responseMessage && (
            <button className={styles.button} onClick={handleSubmit}>
              제출
            </button>
          )}
        </div>
      </div>
    </ReactModal>
  );
}

export default UsernameRecoveryModal;
