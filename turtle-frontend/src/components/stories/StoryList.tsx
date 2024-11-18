"use client";

import React, { useEffect, useState } from "react";
import { fetchStoriesByMonth } from "../../app/api/stories";
import styles from "../../styles/stories/StoryList.module.scss";
import { addMonths, format } from "date-fns"; // date-fns 라이브러리 사용
import { toKSTISOString } from "@/utils/dateUtils";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import StoryModal from "./StoryModal";

// StorySummary 타입 정의
interface StorySummary {
  id: number;
  title: string;
  question: string;
  date: string;
  success_count: number;
  rating: number;
}

const StoryList: React.FC = () => {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [expandedId, setExpandedId] = useState<number | null>(null); // 확장된 항목 ID 관리
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [giveupIds, setGiveUpIds] = useState<number[]>([]);
  const [modalStory, setModalStory] = useState<StorySummary | null>(null);
  const [reachedMinMonth, setReachedMinMonth] = useState<boolean>(false);
  const [reachedMaxMonth, setReachedMaxMonth] = useState<boolean>(true);

  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [targetMonth, setTargetMonth] = useState(
    format(currentMonth, "yyyy-MM")
  );
  const today = toKSTISOString(new Date());
  const offset = 9 * 60 * 60 * 1000;
  const minMonth = new Date("2024-10-01"); // 2024년 10월
  const maxMonth = new Date(Date() + offset); // 현재 달

  useEffect(() => {
    const storedSucceessProblems = localStorage.getItem("successProblem");
    if (storedSucceessProblems) {
      const parsedIds = JSON.parse(storedSucceessProblems);
      setCheckedIds(parsedIds);
    }
    const storedGiveUpProblems = localStorage.getItem("giveupProblem");
    if (storedGiveUpProblems) {
      const parsedIds = JSON.parse(storedGiveUpProblems);
      setGiveUpIds(parsedIds);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchStoriesByMonth(targetMonth);

        const filteredData = data
          .filter((story: StorySummary) => story.date <= today)
          .sort(
            (a: StorySummary, b: StorySummary) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        setStories(filteredData);
      } catch (err) {
        setError("스토리 목록을 불러오는 중 오류가 발생했습니다.");
        console.error(err);
      }
    }

    fetchData();
  }, [targetMonth, today]);

  useEffect(() => {
    const newMinousMonth = addMonths(currentMonth, -1);
    const newPlusMonth = addMonths(currentMonth, 1);

    // 새로운 월이 최소 월과 최대 월 범위 내에 있는지 확인
    if (newMinousMonth < minMonth) {
      setReachedMinMonth(true);
      setReachedMaxMonth(false);
    } else if (newPlusMonth > maxMonth) {
      setReachedMaxMonth(true);
      setReachedMinMonth(false);
    } else {
      setReachedMaxMonth(false);
      setReachedMinMonth(false);
    }
  }, [currentMonth]);

  const navigateToProblem = (id: number) => {
    router.push(`/problem?id=${id}`);
  };

  const handleMonthChange = (months: number) => {
    const newMonth = addMonths(currentMonth, months);

    // 새로운 월이 최소 월과 최대 월 범위 내에 있는지 확인
    if (newMonth >= minMonth && newMonth <= maxMonth) {
      setCurrentMonth(newMonth);
      setTargetMonth(format(newMonth, "yyyy-MM"));
    } else if (reachedMaxMonth || reachedMinMonth) {
      setTargetMonth("");
      setReachedMaxMonth(true);
      setReachedMinMonth(true);
    }
  };

  const toggleQuestion = (story: StorySummary) => {
    if (isMobile) {
      setModalStory(story);
    } else {
      setExpandedId(expandedId === story.id ? null : story.id);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;
      stars.push(
        <div className={styles.star} key={i}>
          <div
            className={styles.starFilled}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      );
    }
    return <div className={styles.ratingStars}>{stars}</div>;
  };

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.pageTitleHeader}>
        {targetMonth
          ? "🏭 이곳은 지금까지 쌓아져온 바다거북수프 공장 창고입니다. 🏭"
          : "📚 이곳은 직접 문제를 만들고 풀 수 있는 개방형 도서관입니다. 📚"}
      </div>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {targetMonth ? `${format(targetMonth, "MM")} 월` : "놀이터"}
        </h2>
      </div>

      <div className={styles.listBox}>
        <button
          onClick={() => handleMonthChange(-1)}
          className={`${styles.navButton} ${
            reachedMinMonth ? styles.navButtonLimited : ""
          }`}
        >
          {"<"}
        </button>
        <div className={styles.list}>
          {stories.map((story) => (
            <>
              <div
                key={story.id}
                className={`${styles.card} ${
                  story.date === today ? styles.todayCard : ""
                }`}
                onClick={() => toggleQuestion(story)}
              >
                {story.date === today && (
                  <div className={styles.todayCardHeader}>오늘의 스토리</div>
                )}
                <div className={styles.cardHeader}>
                  {checkedIds.includes(story.id) ? (
                    <div className={styles.checkedIcon}>{"성공"}</div>
                  ) : giveupIds.includes(story.id) ? (
                    <div className={styles.checkedIcon3}>{"완료"}</div>
                  ) : (
                    <div className={styles.checkedIcon2}>{"미완료"}</div>
                  )}
                  {story.title}
                </div>
                <div className={styles.cardContent}>
                  <span>
                    <span className={styles.cardLabel}>
                      성공 횟수: {story.success_count}
                    </span>
                  </span>
                  <span>
                    <span className={styles.cardLabel}>
                      평점 : {renderStars(story.rating)}
                    </span>
                  </span>
                </div>
              </div>
              {/* 질문 표시 영역 */}
              {!isMobile && expandedId === story.id && (
                <div className={styles.filpedCard}>
                  <div className={styles.qestion}>문제</div>
                  <div className={styles.qestionContent}>{story.question}</div>
                  <button
                    className={styles.joinButton}
                    onClick={() => navigateToProblem(story.id)}
                  >
                    문제 풀기
                  </button>
                </div>
              )}
            </>
          ))}
        </div>
        <button
          onClick={() => handleMonthChange(1)}
          className={`${styles.navButton} ${
            reachedMaxMonth ? styles.navButtonLimited : ""
          }`}
        >
          {">"}
        </button>
      </div>

      {/* 모바일 모달 */}
      {isMobile && modalStory && (
        <StoryModal
          story={modalStory}
          isOpen={!!modalStory}
          onClose={() => setModalStory(null)}
          onNavigate={() => navigateToProblem(modalStory.id)}
        />
      )}
    </div>
  );
};

export default StoryList;
