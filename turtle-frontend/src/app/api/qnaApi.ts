import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface Hints {
  hint1: string;
  hint2: string;
}

interface Story {
  id: number;
  title: string;
  question: string;
  answer: string;
  background: string | null;
  date: string;
  success_count: number;
  rating: number;
  hint1: string | null;
  hint2: string | null;
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

export const fetchTodayStory = async (): Promise<Story> => {
  try {
    const response = await axios.get(`${API_URL}/story/today`);
    return response.data;
  } catch (error) {
    console.error("Error fetching story question:", error);
    throw new Error("Failed to fetch story question");
  }
};

export const fetchStoryById = async (id: number): Promise<Story> => {
  try {
    const response = await axios.get(`${API_URL}/stories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching story by id:", error);
    throw new Error("Failed to fetch story by id");
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

export const submitQuestionToOpenAI = async (
  prompt: string,
  storyQuestion: string,
  storyAnswer: string,
  storyBackground: string | null
): Promise<string> => {
  try {
    const response = await axios.post(
      `${API_URL}/openai`,
      {
        data: prompt,
        question: storyQuestion,
        answer: storyAnswer,
        background: storyBackground,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting question to OpenAI:", error);
    throw new Error("Failed to submit question to OpenAI");
  }
};

export const submitAnswerToOpenAI = async (
  prompt: string,
  storyQuestion: string,
  storyAnswer: string,
  storyBackground: string | null
): Promise<string> => {
  try {
    const response = await axios.post(
      `${API_URL}/openai/answer`,
      {
        data: prompt,
        question: storyQuestion,
        answer: storyAnswer,
        background: storyBackground,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting answer to OpenAI:", error);
    throw new Error("Failed to submit answer to OpenAI");
  }
};