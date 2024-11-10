import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 주차별 스토리 조회
export async function fetchStoriesByWeek() {
  try {
    const response = await axios.get(`${API_URL}/stories`);
    return response.data; // 스토리 데이터 반환
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    throw new Error("스토리 목록을 불러오는 중 오류가 발생했습니다.");
  }
}

// 스토리 삽입
export async function insertStory(story: {
  question: string;
  answer: string;
  date: string;
  hint1: string;
  hint2: string;
}) {
  try {
    const response = await axios.post(`${API_URL}/stories`, story);
    return response.data; // 성공 메시지 반환
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to insert story:", error.response?.data);
      throw new Error(
        error.response?.data || "스토리 추가 중 오류가 발생했습니다."
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("알 수 없는 오류가 발생했습니다.");
    }
  }
}

// 스토리 삭제
export async function deleteStory(date: string) {
  try {
    const response = await axios.delete(`${API_URL}/stories/${date}`);
    return response.data; // 성공 메시지 반환
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to delete story:", error);
      throw new Error(
        error.response?.data || "스토리 삭제 중 오류가 발생했습니다."
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("알 수 없는 오류가 발생했습니다.");
    }
  }
}

export async function getResponse(date: string) {
  try {
    const response = await axios.get(`${API_URL}/responses/${date}`);
    return response.data; // 받은 데이터 반환
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to get response:", error);
      throw new Error(
        error.response?.data || "질문을 받아오는 중 오류가 발생했습니다."
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("알 수 없는 오류가 발생했습니다.");
    }
  }
}

export async function refreshStory() {
  try {
    const response = await axios.get(`${API_URL}/stories/refresh`);
    return response.data; // 받은 데이터 반환
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    throw new Error("스토리를 불러오는 중 오류가 발생했습니다.");
  }
}
