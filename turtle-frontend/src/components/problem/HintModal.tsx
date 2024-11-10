"use client";

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../../styles/problem/HintModal.module.scss";
import { fetchHints } from "@/app/api/qnaApi";

interface HintModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const HintModal: React.FC<HintModalProps> = ({ isOpen, onRequestClose }) => {
  const [openedHints, setOpenedHints] = useState<boolean[]>([false, false]);
  const [updatedHints, setUpdatedHints] = useState<boolean[]>([false, false]);
  const [hints, setHints] = useState<string[]>(["", ""]); // 힌트 상태 정의

  useEffect(() => {
    // 로컬 스토리지에서 상태 복원
    const storedOpenedHints = JSON.parse(localStorage.getItem("openedHints") || "[false, false]");
    const storedUpdatedHints = JSON.parse(localStorage.getItem("updatedHints") || "[false, false]");

    // 상태 초기화
    setOpenedHints(storedOpenedHints);
    setUpdatedHints(storedUpdatedHints);

    // 힌트 데이터 로드
    const loadHints = async () => {
      try {
        const fetchedHints = await fetchHints();
        setHints([fetchedHints.hint1, fetchedHints.hint2]);
      } catch (error) {
        console.error("Error fetching hints: ", error);
      }
    };

    loadHints();
  }, []);

  const toggleHint = (index: number) => {
    const newOpenedHints = [...openedHints];
    const newUpdatedHints = [...updatedHints];

    newOpenedHints[index] = !newOpenedHints[index];
    setOpenedHints(newOpenedHints);

    if (!newUpdatedHints[index]) {
      newUpdatedHints[index] = true;
      setUpdatedHints(newUpdatedHints);

      const openedHintCount = Number(localStorage.getItem("openedHintCount")) || 0;
      localStorage.setItem("openedHintCount", (openedHintCount + 1).toString());
    }

    // 로컬 스토리지에 상태 저장
    localStorage.setItem("openedHints", JSON.stringify(newOpenedHints));
    localStorage.setItem("updatedHints", JSON.stringify(newUpdatedHints));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={styles.ModalContent}
      overlayClassName="ReactModal__Overlay"
      ariaHideApp={false}
    >
      <h2 className={styles.title}>힌트 목록</h2>

      <div className={styles.hintButtons}>
        {hints.map((hint, index) => (
          <AnimatePresence key={index}>
            {openedHints[index] ? (
              <motion.div
                onClick={() => toggleHint(index)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className={styles.hintContent}
                style={{ fontSize: 15 }}
              >
                <p>{hint}</p>
              </motion.div>
            ) : (
              <motion.button
                className={styles.hintButton}
                onClick={() => toggleHint(index)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: 15 }}
              >
                힌트 {index + 1}
              </motion.button>
            )}
          </AnimatePresence>
        ))}
      </div>

      <button className={styles.modalButton} onClick={onRequestClose}>
        닫기
      </button>
    </Modal>
  );
};

export default HintModal;
