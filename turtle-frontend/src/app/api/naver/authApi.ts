// src/app/api/authApi.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function loginWithNaver(accessToken: string) {
  try {
    const response = await axios.post(`${API_URL}/login/naver`, {
      access_token: accessToken,
    });
    return response.data; // JWT 토큰 반환
  } catch (error) {
    console.error('Login with Naver failed:', error);
    throw error;
  }
}
