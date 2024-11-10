"use client";

import { useState } from "react";
import styles from "../../styles/admin/CustomCalendar.module.scss";
import DateModal from "../../components/admin/DateModal"; // 모달 컴포넌트 임포트
import { getDaysInMonth, getFirstDayOfMonth, toKSTISOString } from "../../utils/dateUtils";
interface Story {
  id: number;
  question: string;
  answer: string;
  hint1: string;
  hint2: string;
  date: string;
  success_count: number;
  rating: number;
}

interface CustomCalendarProps {
  stories: Story[];
  onDateChange: (date: Date) => void;
  selectedDate: Date | null;
  refreshStories: () => void; 
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  stories,
  onDateChange,
  selectedDate,
  refreshStories,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStories, setSelectedStories] = useState<Story[]>([]); // 선택된 날짜의 스토리

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  
  const handleDateClick = (day: number) => {
    const newSelectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
  
    const storiesForSelectedDate = storiesByDate(newSelectedDate);
    setSelectedStories(storiesForSelectedDate); // 선택된 날짜의 스토리 설정

    onDateChange(newSelectedDate);
    setIsModalOpen(true); // 모달 열기
  };

  const storiesByDate = (date: Date) => {
    // 서울 시간(KST)으로 변환
    const dateString = toKSTISOString(date);
  
    return stories.filter((story) => story.date === dateString);
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.navigation}>
        <button onClick={handlePrevMonth}>{"<"}</button>
        <h3>
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {currentDate.getFullYear()}
        </h3>
        <button onClick={handleNextMonth}>{">"}</button>
      </div>

      <div className={styles.daysOfWeek}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {Array(firstDayOfMonth)
          .fill(null)
          .map((_, idx) => (
            <div key={idx} className={styles.emptyTile}></div>
          ))}

        {Array.from({ length: daysInMonth }, (_, idx) => idx + 1).map((day) => {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );
          const hasStories = storiesByDate(date).length > 0;

          return (
            <div
              key={day}
              className={`${styles.tile} ${
                selectedDate?.getDate() === day ? styles.selected : ""
              }`}
              onClick={() => handleDateClick(day)}
            >
              <span>{day}</span>
              {hasStories && (
                <div className={styles.storyIndicator}>
                  {storiesByDate(date).map((story) => (
                    <div key={story.id} className={styles.storyBox}>
                      <p>{story.question.substring(0, 15)}...</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 모달 컴포넌트 */}
      <DateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        stories={selectedStories} // 선택된 날짜의 스토리 전달
        refreshStories={refreshStories}
      />
    </div>
  );
};

export default CustomCalendar;
