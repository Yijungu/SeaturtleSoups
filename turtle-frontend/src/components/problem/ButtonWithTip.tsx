"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import { CSSTransition } from "react-transition-group";
import styles from "../../styles/problem/ButtonWithTip.module.scss";
import TipButton from "../../../public/images/TipButton.png";

interface ButtonWithTipProps {
  initialShowTip?: boolean;
  toggleTip: () => void;
}

const ButtonWithTip: React.FC<ButtonWithTipProps> = ({
  initialShowTip = false,
  toggleTip,
}) => {
  const [showTip, setShowTip] = useState(initialShowTip);

  useEffect(() => {
    setShowTip(initialShowTip);
  }, [initialShowTip]);

  return (
    <div className={styles.round_button}>
      <div onClick={toggleTip}>
        <Image src={TipButton} alt="Go to tip" width={40} height={40} />

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
          <div className={styles["tip-content"]}>
            <h2 className={styles["tip-title"]}>mysouprecipe TIP!</h2>
            <p>마이스프레시피 더 맛있게 끓이는 법</p>
            <ol>
              <li>+ 주어를 넣어 입력해주세요.</li>
              <li>+ 긍정의문문으로 적어주세요.</li>
              <li>+ 시제를 고려해보는 것도 좋아요.</li>
              <p>• 비슷한 내용도 시제가 다르면 다른 답을 받을 수 있습니다.</p>
              <li>+ 질문 창에서 TAB키를 누르면 정답 버튼으로 바뀌어요.</li>
            </ol>
          </div>
        </CSSTransition>
      </div>
    </div>
  );
};

export default ButtonWithTip;
