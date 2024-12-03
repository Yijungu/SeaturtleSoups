"use client";

import { useState } from "react";
import styles from "../../styles/stories/LoginModalButton.module.scss";
import LoginComponent from "./LoginComponent";
import SignupModal from "./SignupModal";

export default function LoginModalButton() {
  const [isOpenLogin, setIsOpenLogin] = useState(false);
  const [isOpenSignUp, setIsOpenSignUp] = useState(false);

  return (
    <>
      <div className={styles.loginModalButton}>
        <div
          onClick={() => setIsOpenSignUp(!isOpenSignUp)}
          className={styles.loginModalButtonV}
        >
          {"회원가입"}
        </div>
        <div
          onClick={() => setIsOpenLogin(!isOpenLogin)}
          className={styles.loginModalButtonLogin}
        >
          {"로그인"}
        </div>
        {isOpenLogin && <LoginComponent />}
      </div>
      <SignupModal
        isOpen={isOpenSignUp}
        onClose={() => setIsOpenSignUp(!isOpenSignUp)}
      />
    </>
  );
}
