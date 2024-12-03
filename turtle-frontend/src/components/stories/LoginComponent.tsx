"use client";

import React, { useState } from "react";
import styles from "@/styles/stories/LoginComponent.module.scss";
import UsernameRecoveryModal from "./UsernameRecoveryModal";
import PasswordRecoveryModal from "./PasswordRecoveryModal";
import { loginUser } from "@/app/api/login";

const LoginComponent: React.FC = () => {
  const [user_id, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUsernameRecoveryOpen, setIsUsernameRecoveryOpen] = useState(false);
  const [isPasswordRecoveryOpen, setIsPasswordRecoveryOpen] = useState(false);

  const handleLogin = async () => {
    try {
      if (!user_id || !password) {
        alert("아이디와 비밀번호를 입력해주세요.");
        return;
      }
      const response = await loginUser(user_id, password);
      alert("로그인 성공! 환영합니다.");
      console.log("로그인 성공:", response);
      // 로그인 성공 후 추가 로직 (예: 페이지 이동)
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginContainer}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="아이디"
            className={styles.inputField}
            value={user_id}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            className={styles.inputField}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className={styles.loginButton}>
          <button onClick={handleLogin}>로그인</button>
        </div>
      </div>
      <div className={styles.options}>
        {/* 아이디 찾기 버튼 */}
        <button
          className={styles.optionButton}
          onClick={() => setIsUsernameRecoveryOpen(true)}
        >
          아이디 찾기
        </button>
        {/* 비밀번호 찾기 버튼 */}
        <button
          className={styles.optionButton}
          onClick={() => setIsPasswordRecoveryOpen(true)}
        >
          비밀번호 찾기
        </button>
      </div>
      {/* 아이디 찾기 모달 */}
      <UsernameRecoveryModal
        isOpen={isUsernameRecoveryOpen}
        onClose={() => setIsUsernameRecoveryOpen(false)}
      />
      {/* 비밀번호 찾기 모달 */}
      <PasswordRecoveryModal
        isOpen={isPasswordRecoveryOpen}
        onClose={() => setIsPasswordRecoveryOpen(false)}
      />
    </div>
  );
};

export default LoginComponent;
