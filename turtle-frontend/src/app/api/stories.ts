import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 주차별 스토리 조회
export async function fetchStoriesByMonth(month : string) {
  try {
    const response = await axios.get(`${API_URL}/stories/month?month=${month}`);
    return response.data; // 스토리 데이터 반환
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    throw new Error("스토리 목록을 불러오는 중 오류가 발생했습니다.");
  }
}

export async function fetchReviewedStories() {
  try {
    const response = await axios.get(`${API_URL}/stories/reviewed`);
    return response.data; // 검토된 스토리 데이터 반환
  } catch (error) {
    console.error("Failed to fetch reviewed stories:", error);
    throw new Error("검토된 스토리 목록을 불러오는 중 오류가 발생했습니다.");
  }
}