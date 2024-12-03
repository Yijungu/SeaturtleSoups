import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface RegisterUserResponse {
    user_id: string;
    security_code: string;
    discriminator: number;
  }
/**
 * 아이디 중복 확인
 */
export async function checkUsername(user_id: string): Promise<boolean> {
  try {
    const response = await axios.post(`${API_URL}/users/check-username`, {
        user_id,
    });
    return response.data;
  } catch (error) {
    console.error("Error checking username:", error);
    throw new Error("아이디 중복 확인 중 오류가 발생했습니다.");
  }
}

/**
 * 사용자 등록
 */
export async function registerUser(
  userId: string,
  username: string,
  password: string
): Promise<RegisterUserResponse> {
  try {
    const response = await axios.post(`${API_URL}/users`, {
      user_id: userId,
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw new Error("사용자 등록 중 오류가 발생했습니다.");
  }
}

/**
 * 로그인
 */
export async function loginUser(
  user_id: string,
  password: string
): Promise<string> {
  try {
    const response = await axios.post(`${API_URL}/login`, {
        user_id,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error("로그인 중 오류가 발생했습니다.");
  }
}

/**
 * 비밀번호 복구
 */
export async function recoverPassword(
    user_id: string,
  securityCode: string
): Promise<boolean> {
  try {
    const response = await axios.post(`${API_URL}/recover-password`, {
        user_id,
      security_code: securityCode,
    });
    return response.data;
  } catch (error) {
    console.error("Error recovering password:", error);
    throw new Error("비밀번호 복구 중 오류가 발생했습니다.");
  }
}

/**
 * 아이디 찾기
 */
export async function findUsername(securityCode: string): Promise<string> {
  try {
    const response = await axios.post(`${API_URL}/find-username`, {
      security_code: securityCode,
    });
    return response.data;
  } catch (error) {
    console.error("Error finding username:", error);
    throw new Error("아이디 찾기 중 오류가 발생했습니다.");
  }
}

interface CaptchaResponse {
    client_id: string;
    captcha_image: string;
  }

export async function fetchCaptcha(): Promise<CaptchaResponse> {
    try {
      const response = await axios.get(`${API_URL}/generate-captcha`);
      return response.data; // { client_id, captcha } 반환
    } catch (error) {
      console.error("Error fetching CAPTCHA:", error);
      throw new Error("CAPTCHA 가져오기 중 오류가 발생했습니다.");
    }
  }
  
  /**
   * CAPTCHA 유효성 검사
   * 사용자가 입력한 CAPTCHA와 서버에서 생성한 CAPTCHA를 비교합니다.
   */
  export async function validateCaptcha(clientId: string, captchaInput: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/validate-captcha`, {
        client_id: clientId,
        captcha_input: captchaInput,
      });
      return response.status === 200; // 200 OK일 경우 유효성 검증 성공
    } catch (error) {
      console.error("Error validating CAPTCHA:", error);
      return false; // 검증 실패
    }
  }

  export async function changePassword(
    user_id: string,
    security_code: string,
    new_password: string
  ): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}/change-password`, {
        user_id,
        security_code,
        new_password,
      });
      return response.data; // 성공 메시지 반환
    } catch (error) {
      console.error("Error changing password:", error);
      throw new Error("비밀번호 변경 중 오류가 발생했습니다.");
    }
  }