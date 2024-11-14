// components/HintModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../../styles/problem/HintModal.module.scss";

interface HintModalProps {
  id: number;
  isOpen: boolean;
  onRequestClose: () => void;
  hint1: string | null;
  hint2: string | null;
}

const HintModal: React.FC<HintModalProps> = ({ id, hint1, hint2, isOpen, onRequestClose }) => {
  const [openedHints, setOpenedHints] = useState<boolean[]>([false, false]);
  const [updatedHints, setUpdatedHints] = useState<boolean[]>([false, false]);

  const storyKey = `story_${id}`;

  useEffect(() => {
    // Load hint states from local storage
    const storyData = JSON.parse(localStorage.getItem(storyKey) || "{}");

    // Set initial hint state
    setOpenedHints(storyData.openedHints || [false, false]);
    setUpdatedHints(storyData.updatedHints || [false, false]);
  }, [storyKey]);

  const toggleHint = (index: number) => {
    const newOpenedHints = [...openedHints];
    const newUpdatedHints = [...updatedHints];

    newOpenedHints[index] = !newOpenedHints[index];
    setOpenedHints(newOpenedHints);

    if (!newUpdatedHints[index]) {
      newUpdatedHints[index] = true;
      setUpdatedHints(newUpdatedHints);

      const storyData = JSON.parse(localStorage.getItem(storyKey) || "{}");
      const openedHintCount = storyData.openedHintCount || 0;

      if (!storyData.state){
        storyData.openedHintCount = openedHintCount + 1;
      }
      // Save updated data to local storage
      localStorage.setItem(storyKey, JSON.stringify(storyData));
    }

    // Save hint states within the story-specific storage
    const updatedStoryData = {
      ...JSON.parse(localStorage.getItem(storyKey) || "{}"),
      openedHints: newOpenedHints,
      updatedHints: newUpdatedHints,
    };
    localStorage.setItem(storyKey, JSON.stringify(updatedStoryData));
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
        {[hint1, hint2].map((hint, index) => (
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
