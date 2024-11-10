"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginWithNaver } from "../../../app/api/naver/authApi"; // API 함수 import

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (accessToken) {
      // 네이버 로그인 API 호출
      loginWithNaver(accessToken)
        .then((token) => {
          localStorage.setItem("jwt", token); // JWT 저장
          router.push("/admin/dashboard"); // 대시보드로 이동
        })
        .catch((error) => console.error("Login failed", error));
    }
  }, [router]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>관리자 로그인</h1>
      <button onClick={handleLogin}>네이버로 로그인</button>
    </div>
  );

  function handleLogin() {
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI ??
        (() => {
          throw new Error("NEXT_PUBLIC_NAVER_REDIRECT_URI 환경 변수가 필요합니다.");
        })()
    );
    const state = Math.random().toString(36).substring(2, 15);

    const loginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
    window.location.href = loginUrl;
  }
}
