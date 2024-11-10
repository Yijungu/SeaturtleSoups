"use client";

import { useEffect, useState } from "react";
import Modal from "react-modal";

export default function ClientSetup() {
  const [isMounted, setIsMounted] = useState(false); // 마운트 여부를 확인하는 상태

  useEffect(() => {
    // DOM이 마운트된 후 실행
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // 마운트된 후에만 Modal 설정
    if (isMounted) {
      Modal.setAppElement("#__next");
    }
  }, [isMounted]);

  return null; // UI를 반환하지 않음
}
