import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Hints {
  hint1: string;
  hint2: string;
}

export const fetchStoryQuestion = async (): Promise<string> => {
  try {
    const response = await axios.get(`${API_URL}/memory/story/question`);
    return response.data;
  } catch (error) {
    console.error("Error fetching story question:", error);
    throw new Error("Failed to fetch story question");
  }
};

export const fetchHints = async (): Promise<Hints> => {
  try {
    const response = await axios.get<Hints>(`${API_URL}/memory/story/hint`);

    if (response.status === 200) {
      return response.data; // 힌트 데이터 반환
    } else {
      throw new Error(`Failed to fetch hints: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error fetching story hints:", error);
    throw new Error("Failed to fetch story hints");
  }
};

export const submitQuestionToOpenAI = async (question: string): Promise<string> => {
  try {
    const response = await axios.post(`${API_URL}/openai`, { data: question }, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting question to OpenAI:", error);
    throw new Error("Failed to submit question to OpenAI");
  }
};

export const submitAnswerToOpenAI = async (question: string): Promise<string> => {
  try {
    const response = await axios.post(`${API_URL}/openai/answer`, { data: question }, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting question to OpenAI:", error);
    throw new Error("Failed to submit question to OpenAI");
  }
};