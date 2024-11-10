import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const fetchStoryQuestion = async (): Promise<string> => {
    try {
      const response = await axios.get(`${API_URL}/memory/story/question`);
      return response.data;
    } catch (error) {
      console.error("Error fetching story question:", error);
      throw new Error("Failed to fetch story question");
    }
  };

  export const fetchStoryAnswer = async (): Promise<string> => {
    try {
      const response = await axios.get(`${API_URL}/memory/story/answer`);
      return response.data;
    } catch (error) {
      console.error("Error fetching story question:", error);
      throw new Error("Failed to fetch story question");
    }
  };

  export const addRating = async (newRating: number): Promise<string> => {
    try {
      const response = await axios.post(`${API_URL}/rating`, newRating, {
        headers: {
          "Content-Type": "application/json", // Set the correct content type
        },
      });
      return response.data; // Return response message
    } catch (error) {
      console.error("Error adding new rating:", error);
      throw new Error("Failed to add rating");
    }
  };