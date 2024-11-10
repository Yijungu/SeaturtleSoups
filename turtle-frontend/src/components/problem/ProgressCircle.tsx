// components/ProgressCircle.tsx
import React from "react";
import styles from "../../styles/problem/ProgressCircle.module.scss";

interface ProgressCircleProps {
  percentage: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ percentage }) => {
  // 퍼센티지 범위에 따라 클래스 이름을 설정
  const colorClass =
    percentage <= 30
      ? styles.red
      : percentage <= 69
      ? styles.yellow
      : styles.green;

  return (
    <div className={styles.progressContainer}>
      <div
        className={`${styles.progressCircle} ${colorClass}`}
        style={{ "--percentage": percentage } as React.CSSProperties}
      >
        <span className={styles.percentageText}>{percentage}%</span>
      </div>
    </div>
  );
};

export default ProgressCircle;
