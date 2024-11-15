"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../styles/admin/Dashboard.module.scss";
import LogoutButton from "../../../components/admin/LogoutButton";
import CustomCalendar from "../../../components/admin/CustomCalendar"; // 분리된 캘린더 컴포넌트 import
import { fetchStoriesByWeek } from "../../../app/api/admin"; // API 호출 함수 import
import RefreshButton from "@/components/admin/RefreshButton";

interface Story {
  id: number;
  title: string;
  answer: string;
  question: string;
  date: string;
  success_count: number;
  rating: number;
  hint1: string;
  hint2: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // 선택된 날짜
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      router.push("/admin/login");
    } else {
      loadStories(); // 초기 로드
    }
  }, [router]);

  // 스토리 목록 불러오기 함수
  const loadStories = async () => {
    setLoading(true); // 로딩 상태 설정
    try {
      const data = await fetchStoriesByWeek(); // 현재 주차 스토리 조회
      setStories(data);
    } catch (error) {
      setError((error as Error).message); // Error 타입으로 단언
    } finally {
      setLoading(false); // 로딩 완료
    }
  };

  // 스토리 목록 새로고침 함수
  const refreshStories = () => {
    loadStories();
  };

  if (loading) return <p className={styles.loading}>로딩 중...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <RefreshButton />
      <LogoutButton />
      <CustomCalendar 
        stories={stories} 
        onDateChange={setSelectedDate} 
        selectedDate={selectedDate} 
        refreshStories={refreshStories} // 새로고침 함수 전달
      />
    </div>
  );
}
