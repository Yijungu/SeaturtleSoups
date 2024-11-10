"use client";

import React, { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import Image from "next/image";
import styles from "../../styles/problem/KeyButton.module.scss";

// 이미지 import
import TipButton from "../../../public/images/KeyButton.png";
import TipText from "../../../public/images/KeyText.png";

interface KeyButtonProps {
  initialShowTip?: boolean;
  toggleTip: () => void;
}

const KeyButton: React.FC<KeyButtonProps> = ({
  initialShowTip = false,
  toggleTip,
}) => {
  const [showTip, setShowTip] = useState(initialShowTip);

  useEffect(() => {
    setShowTip(initialShowTip);
  }, [initialShowTip]);

  return (
    <div className={styles.container}>
      <button className={styles.roundButtonKey} onClick={toggleTip}>
        <Image src={TipButton} alt="Go to tip" width={40} height={40} />
      </button>
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
        <Image
          className={styles.keyText}
          src={TipText}
          alt="tip text"
          width={260}
          height={590}
        />
      </CSSTransition>
    </div>
  );
};

export default KeyButton;
