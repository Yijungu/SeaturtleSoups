"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");

    if (!jwt) {
      // JWT가 없으면 로그인 페이지로 리다이렉트
      router.push("/admin/login");
    } else {
      // 인증된 경우 대시보드로 이동
      router.push("/admin/dashboard");
    }
  }, []);

  return null; // 이 페이지는 리다이렉트만 담당
}
