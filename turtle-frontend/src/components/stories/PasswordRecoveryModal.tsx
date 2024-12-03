"use client";

import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import styles from "@/styles/stories/PasswordRecoveryModal.module.scss"; // 비밀번호 찾기 전용 스타일
import { recoverPassword, changePassword } from "@/app/api/login";

type PasswordRecoveryModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function PasswordRecoveryModal({ isOpen, onClose }: PasswordRecoveryModalProps) {
  const [userId, setUserId] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isCodeValid, setIsCodeValid] = useState(false);
  
  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힐 때 상태 초기화
      setUserId("");
      setSecurityCode("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setPasswordConfirmError("");
      setResponseMessage(null);
      setIsCodeValid(false);
    }
  }, [isOpen]);


  const validatePasswords = () => {
    const passwordRegex = /^(?=.*[a-zA-Z가-힣])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "비밀번호는 8자 이상이어야 하며, 숫자, 특수문자, 한글 또는 영어 조합이어야 합니다."
      );
    } else {
      setPasswordError("");
    }
  };

  const validatePasswordsConfirm = () => {
    if (newPassword !== confirmPassword) {
      setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordConfirmError("");
    }
  };

  const handleSecurityCodeValidation = async () => {
    try {
      const isValid = await recoverPassword(userId, securityCode);
      if (isValid) {
        setResponseMessage("보안 코드가 확인되었습니다. 새 비밀번호를 입력하세요.");
        setIsCodeValid(true);
      } else {
        setResponseMessage("보안 코드가 유효하지 않습니다. 다시 확인해주세요.");
        setIsCodeValid(false);
      }
    } catch (error) {
      console.error("Error validating security code:", error);
      setResponseMessage("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handlePasswordChange = async () => {
    validatePasswords();
    validatePasswordsConfirm();

    if (passwordError || passwordConfirmError) return;

    try {
      const result = await changePassword(userId, securityCode, newPassword);
      if (result) {
        setResponseMessage("비밀번호가 성공적으로 변경되었습니다.");
        onClose();
      } else {
        setResponseMessage("비밀번호 변경 실패. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setResponseMessage("오류가 발생했습니다. 다시 시도해주세요.");
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
        <h2>비밀번호 찾기</h2>
        <div className={styles.formGroup}>
          <label>아이디</label>
          <input
            type="text"
            className={styles.input}
            value={userId}
            onChange={(e) => {
                const inputValue = e.target.value;
                // 영어와 숫자만 허용하는 정규식
                if (/^[a-zA-Z0-9]*$/.test(inputValue)) {
                  setUserId(inputValue); // 유효한 입력만 설정
                }
              }}
            disabled={isCodeValid}
          />
        </div>
        <div className={styles.formGroup}>
          <label>보안 코드</label>
          <input
            type="text"
            className={styles.input}
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
            disabled={isCodeValid}
          />
        </div>
        {isCodeValid && (
          <>
            <div className={styles.formGroup}>
              <label>새 비밀번호</label>
              <input
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={validatePasswords}
              />
              {passwordError && <p className={styles.error}>{passwordError}</p>}
            </div>
            <div className={styles.formGroup}>
              <label>비밀번호 확인</label>
              <input
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={validatePasswordsConfirm}
              />
              {passwordConfirmError && (
                <p className={styles.error}>{passwordConfirmError}</p>
              )}
            </div>
          </>
        )}
        {responseMessage && (
          <p className={styles.validError}>
            {responseMessage}
          </p>
        )}
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={onClose}>
            취소
          </button>
          {!isCodeValid ? (
            <button className={styles.button} onClick={handleSecurityCodeValidation}>
              확인
            </button>
          ) : (
            <button className={styles.button} onClick={handlePasswordChange}>
              비밀번호 변경
            </button>
          )}
        </div>
      </div>
    </ReactModal>
  );
}

export default PasswordRecoveryModal;
