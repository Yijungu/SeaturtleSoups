"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import GreenTurtle from "../../../public/images/GreenTurtle.png";
import WhiteTurtle from "../../../public/images/WhiteTurtle.png";
import styles from "../../styles/thanks/AIAnswer.module.scss";

interface AIAnswerProps {
  id: string | null; // Add id prop to retrieve the specific story data
}

export default function AIAnswer({ id }: AIAnswerProps) {
  const [answer, setAnswer] = useState<string | null>(null); // 상태로 답변 관리
  const [marginTop, setMarginTop] = useState<number>(15);

  // 컴포넌트가 마운트될 때 fetchStoryAnswer 호출
  useEffect(() => {
    const fetchAnswer = async () => {
      const storedStoryQueue = localStorage.getItem("storyQueue");

      if (!storedStoryQueue) {
        console.warn("No storyQueue found in localStorage.");
        return;
      }

      const storyQueue = JSON.parse(storedStoryQueue);
      const story = storyQueue.find(
        (item: { id: number }) => item.id === Number(id)
      );
      if (story) {
        setAnswer(story.answer || "답변이 존재하지 않습니다.");
      }
    };

    const fetchUserAnswer = () => {
      const storyData = JSON.parse(localStorage.getItem(`story_${id}`) || "{}");
      const fetchedAnswer = storyData.userAnswer || null;
      setMarginTop(!fetchedAnswer ? 70 : 15);
    };

    fetchAnswer();
    fetchUserAnswer();
  }, [id]);

  return (
    <div className={styles.Ai_answer_layout} style={{ marginTop }}>
      <div className={styles.AI_answer_box_tag}>
        <Image
          src={GreenTurtle}
          alt="Turtle"
          width={40}
          height={30}
          style={{ margin: "10px" }}
        />
        정답!
        <Image
          src={WhiteTurtle}
          alt="Turtle"
          width={40}
          height={30}
          style={{ margin: "10px" }}
        />
      </div>
      <div className={styles.AI_answer_box}>
        <p className={styles.AI_answer}>{answer}</p>
      </div>
    </div>
  );
}
