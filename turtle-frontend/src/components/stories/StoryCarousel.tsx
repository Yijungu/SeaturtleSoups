"use client";

import React, { useState, useEffect } from "react";
import styles from "../../styles/stories/StoryCarousel.module.scss";
import Image from "next/image";
import { fetchReviewedStories } from "@/app/api/stories";

interface Story {
  id: number;
  title: string;
  question: string;
  date: string; // 날짜를 문자열로 처리
  success_count: number | null;
  rating: number | null;
  thumbnail: string; // 섬네일 URL
  creater_id: string;
  is_reviewed: boolean;
}

interface StorySummary {
  id: number;
  title: string;
  question: string;
  date: string; // 날짜를 문자열로 처리
  success_count: number | null;
  rating: number | null;
  thumbnail: string; // 섬네일 URL
  creater_id: string;
}

const StoryCarousel: React.FC = () => {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [successProblemSet, setSuccessProblemSet] = useState<Set<number>>(
    new Set()
  );
  const [filterType, setFilterType] = useState<"all" | "success" | "unsuccess">(
    "all"
  ); // 필터 상태

  useEffect(() => {
    // API 호출하여 데이터 가져오기
    const fetchStories = async () => {
      try {
        const response = await fetchReviewedStories();
        const mappedStories = response.map((story: Story) => ({
          id: story.id,
          title: story.title || "Untitled",
          question: story.question,
          date: story.date,
          success_count: story.success_count,
          rating: story.rating,
          thumbnail: story.thumbnail.normalize("NFD"),
          creater_id: story.creater_id,
        }));
        setStories(mappedStories);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      }
    };
    fetchStories();
  }, []);

  useEffect(() => {
    const storedSuccessProblems = localStorage.getItem("successProblem");
    if (storedSuccessProblems) {
      const parsedIds = JSON.parse(storedSuccessProblems);
      setSuccessProblemSet(new Set(parsedIds)); // Set으로 변환하여 저장
    }
  }, []);

  const handleSelect = (index: number) => {
    setCurrentIndex(index - 2);
    setFlippedIndex(null);
  };

  const handleFlip = (index: number) => {
    if (flippedIndex === index) {
      setFlippedIndex(null);
    } else {
      setFlippedIndex(index);
    }
  };

  const handleFilterChange = (type: "all" | "success" | "unsuccess") => {
    if (filterType === type) {
      setFilterType("all");
      setCurrentIndex(0); 
    } else {
      setFilterType(type);
      setCurrentIndex(-2); 
    }
  };

  const filteredStories = stories.filter((story) => {
    if (filterType === "success") {
      return successProblemSet.has(story.id);
    } else if (filterType === "unsuccess") {
      return !successProblemSet.has(story.id);
    }
    return true; // "all" 필터
  });

  if (filteredStories.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carousel}>
        <div className={styles.carouselButton}>
          <div
            className={`${styles.notSuccessButton} ${
              filterType === "unsuccess" ? styles.active : ""
            }`}
            onClick={() => handleFilterChange("unsuccess")}
          >
            미해결
          </div>
          <div
            className={`${styles.successButton} ${
              filterType === "success" ? styles.active : ""
            }`}
            onClick={() => handleFilterChange("success")}
          >
            해결
          </div>
        </div>
        {filteredStories.map((story, index) => {
          const offset = index - currentIndex;
          const isSuccess = successProblemSet.has(story.id); // 필요 시만 계산
          return (
            <StoryCard
              key={story.id}
              story={story}
              offset={offset}
              isFlipped={flippedIndex === index}
              onClick={() => handleSelect(index)}
              onFlip={() => handleFlip(index)}
              isSuccess={isSuccess} // 필터링된 값만 전달
            />
          );
        })}
      </div>
    </div>
  );
};

interface StoryCardProps {
  story: StorySummary;
  offset: number;
  isFlipped: boolean;
  isSuccess: boolean;
  onClick: () => void;
  onFlip: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({
  story,
  offset,
  isFlipped,
  isSuccess,
  onClick,
  onFlip,
}) => {
  if (offset >= 5 || offset < 0) {
    return null;
  }

  const handleClick = () => {
    if (offset === 2) {
      onFlip();
    } else {
      onClick();
    }
  };

  return (
    <div className={styles.card} data-offset={offset} onClick={handleClick}>
      <div className={`${styles.cardInner} ${isFlipped ? styles.flipped : ""}`}>
        <div
          className={`${styles.cardContent} ${styles.front}`}
          data-offset={offset}
          data-success-problem={isSuccess}
        >
          <div
            className={styles.successMark}
            style={{ color: isSuccess ? "#00B469" : "#E40000" }}
          >
            {isSuccess ? "해결" : "미해결"}
          </div>
          <Image
            className={styles.thumbnailImage}
            src={story.thumbnail}
            alt={story.title}
            width={180}
            height={300}
            objectFit="cover"
            draggable={false}
          />
          <div className={styles.gradientOverlay}></div>
          <h3 className={styles.cardTitleFront}>{story.title}</h3>
        </div>
        <div
          className={`${styles.cardContent} ${styles.back}`}
          data-success-problem={isSuccess}
        >
          <div className={styles.cardDetails}>
            <h3 className={styles.cardTitleBack}>{story.title}</h3>
            <div className={styles.cardQuestion}>
              <p>평균 질문 수 : 0</p>
              <p>성공 횟수 : 0</p>
              <p>포기 횟수 : 0</p>
            </div>
            <div className={styles.cardMeta}>
              <p className={styles.cardDate}>{story.date.replace(/-/g, ".")}</p>
              <p className={styles.cardCreator}>Made by {story.creater_id}</p>
            </div>
            <Image
              className={styles.thumbnailImageBack}
              src={story.thumbnail}
              alt={story.title}
              width={300}
              height={400}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCarousel;
