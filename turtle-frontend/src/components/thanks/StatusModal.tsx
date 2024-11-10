"use client";

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Image from "next/image";
import successImage from "../../../public/images/SuccessImage.png";
import sadCharacter from "../../../public/images/GiveUpImage.png";
import styles from "../../styles/thanks/StatusModal.module.scss";

interface StatusModalProps {
  isOpen: boolean;
  status: "correct" | "giveup";
  onClose: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({ isOpen, status, onClose }) => {
  const [closing, setClosing] = useState(false); // 모달 닫힘 상태 관리

  useEffect(() => {
    if (!isOpen) return;

    // 3초 후 서서히 닫히기 시작
    const timer = setTimeout(() => setClosing(true), 1500);
    // 닫히는 애니메이션 후 onClose 호출
    const closeTimer = setTimeout(() => {
      setClosing(false); 
      onClose();
    }, 2500); // 애니메이션 시간(1초) 포함

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen || closing}
      className={`${styles.ModalContent} ${closing ? styles.ModalClosing : ""}`}
      overlayClassName="ReactModal__Overlay" 
      ariaHideApp={false}
    >
      <div className={styles.content}>
        {status === "correct" ? (
          <>
            <Image
              src={successImage}
              alt="Success"
              width={350}
              height={350}
            />
            <p className={styles.message}>축하합니다! 정답을 맞히셨습니다!</p>
          </>
        ) : (
          <>
            <Image
              src={sadCharacter}
              alt="Give Up"
              width={350}
              height={350}
            />
            <p className={styles.message}>내일은 더 좋은 문제로! 화이팅!</p>
          </>
        )}
      </div>
    </Modal>
  );
};

export default StatusModal;
