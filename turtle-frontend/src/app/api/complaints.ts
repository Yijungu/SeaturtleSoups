import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 불만 사항 타입 정의
interface Complaint {
  description: string;
}

// 서버 응답 타입 정의
interface ComplaintResponse {
  id: number;
}

// 불만 사항 생성
export async function createComplaint(
  complaint: Complaint
): Promise<ComplaintResponse> {
  try {
    const response = await axios.post<ComplaintResponse>(
      `${API_URL}/complaints`,
      complaint
    );
    return response.data; // 생성된 불만 사항의 ID 반환
  } catch (error) {
    console.error("Failed to create complaint:", error);
    throw new Error("불만 사항을 생성하는 중 오류가 발생했습니다.");
  }
}
