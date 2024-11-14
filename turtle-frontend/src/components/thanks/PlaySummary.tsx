"use client";

import styles from "../../styles/thanks/PlaySummary.module.scss";
import CopyButton from "./CopyButton";
import { useState, useEffect } from "react";
import { isSameDay } from "../../helpers/dateHelpers";
import WarehouseButton from "../common/WarehouseButton";

interface PlaySummaryProps {
  id: number; // Story ID for managing play data
}

const PlaySummary: React.FC<PlaySummaryProps> = ({ id }) => {
  const storyKey = `story_${id}`;
  const [work, setWork] = useState<boolean>(true);
  const [nickname, setNickName] = useState<string>("사용자");
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [giveUpCount, setGiveUpCount] = useState<number>(0);
  const [totalQuestionsAsked, setTotalQuestionsAsked] = useState<number>(0);
  const [workTime, setWorkTime] = useState<string>("0시간 0분 0초");
  const [hintCount, setHintCount] = useState<number>(0);

  useEffect(() => {
    const storyData = JSON.parse(localStorage.getItem(storyKey) || "{}");
    const timeSpent = getTimeDifference(new Date(storyData.startTime), new Date(storyData.endTime));
    setWorkTime(timeSpent);
    setHintCount(storyData.openedHintCount || 0);
    setNickName(localStorage.getItem("nickname") || "사용자");
    const storedSuccessProblems = JSON.parse(
      localStorage.getItem("successProblem") || "[]"
    );
    const storedGiveUpProblems = JSON.parse(
      localStorage.getItem("giveupProblem") || "[]"
    );
    setCorrectAnswers(storedSuccessProblems.length);
    setGiveUpCount(storedGiveUpProblems.length);
    setTotalQuestionsAsked(storyData.totalQuestionsAsked || 0);
  }, [id]);

  const handleCopy = () => {
    const rootUrl = window.location.origin;
    const textToCopy = `
  [플레이 요약]
  닉네임: ${nickname}
  정답 횟수: ${correctAnswers}
  포기 횟수: ${giveUpCount}
  총 질문 횟수: ${totalQuestionsAsked}
  총 소요 시간: ${workTime}
  
  [플레이 주소]
  ${rootUrl}
    `;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => alert("플레이 요약이 복사되었습니다!"))
      .catch((err) => console.error("복사 중 오류가 발생했습니다:", err));
  };

  const getTimeDifference = (startTime: Date, endTime: Date) => {
    const timeDifferenceInSeconds = Math.round(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    const hours = Math.floor(timeDifferenceInSeconds / 3600);
    const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60);
    const seconds = timeDifferenceInSeconds % 60;

    return `${hours}시간 ${minutes}분 ${seconds}초`;
  };

  return (
    <div className={styles.my_play_box}>
      <div className={styles.copy_button_wrapper}>
        <CopyButton handleCopy={handleCopy} />
      </div>

      <div className={styles.copy_phrase}>
        <span className={styles.my_play_3}>
          <div className={styles.line}>
            {work
              ? `${nickname}님 축하합니다! ${correctAnswers}번째 정답을 맞추셨습니다!`
              : `다음 문제를 노려보세요!`}
          </div>
          <p>{`오늘의 총 질문 수 : ${totalQuestionsAsked} 사용한 힌트 수 : ${hintCount}`}</p>
          <p>{`정답 횟수: ${correctAnswers} / 포기 횟수: ${giveUpCount}`}</p>
          <p>{`총 소요 시간: ${workTime}`}</p>
        </span>
      </div>
      <WarehouseButton />
    </div>
  );
};

export default PlaySummary;
