"use client";

import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import styles from "@/styles/stories/SignupModal.module.scss"; // styles 유지
import {
  checkUsername,
  registerUser,
  fetchCaptcha,
  validateCaptcha,
} from "@/app/api/login";
import Image from "next/image";
import CopyButtonImg from "../../../public/images/CopyButton.png";

type SignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "사용 가능" | "이미 사용 중" | "오류 발생" | null
  >(null);
  const [captchaValidStatus, setCaptchaValidStatus] = useState<
    | "보안 코드가 올바릅니다."
    | "보안 코드가 유효하지 않습니다."
    | "오류 발생"
    | null
  >(null);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  const [captchaImage, setCaptchaImage] = useState<string | null>(null); // CAPTCHA 이미지
  const [captchaInput, setCaptchaInput] = useState("");
  const [clientId, setClientId] = useState("");

  const [successModalOpen, setSuccessModalOpen] = useState(false); // 성공 모달 상태
  const [signupResponse, setSignupResponse] = useState<{
    user_id: string;
    security_code: string;
    discriminator: number;
  } | null>(null);

  const fetchNewCaptcha = async () => {
    try {
      const captchaResponse = await fetchCaptcha(); // 서버에서 CAPTCHA 데이터 가져오기
      setCaptchaImage(captchaResponse.captcha_image); // CAPTCHA 이미지 데이터 설정
      setClientId(captchaResponse.client_id); // client_id 저장 (검증 시 필요)
      setCaptchaInput(""); // 입력 필드 초기화
    } catch (error) {
      console.error("CAPTCHA를 로드하는 중 오류가 발생했습니다:", error);
      alert("CAPTCHA를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNewCaptcha(); // 새 CAPTCHA 로드
    } else {
      // 창이 닫힐 때 모든 필드를 초기화
      setUsername("");
      setUsernameStatus(null);
      setNickname("");
      setNicknameError("");
      setPassword("");
      setPasswordConfirm("");
      setPasswordError("");
      setPasswordConfirmError("");
      setCaptchaInput("");
      setClientId("");
      setCaptchaValidStatus(null);
      setCaptchaImage(null);
    }
  }, [isOpen]);

  const checkUsernameHandler = async () => {
    try {
      const isAvailable = await checkUsername(username);
      setUsernameStatus(!isAvailable ? "사용 가능" : "이미 사용 중");
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameStatus("오류 발생");
    }
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    const forbiddenWords = ["badword", "admin", "운영자"];
    const hasForbiddenWord = forbiddenWords.some((word) =>
      value.includes(word)
    );
    setNicknameError(
      hasForbiddenWord ? "금지된 단어가 포함되어 있습니다." : ""
    );
  };

  const validatePasswords = () => {
    const passwordRegex = /^(?=.*[a-zA-Z가-힣])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        "비밀번호는 8자 이상이어야 하며, 숫자, 특수문자, 한글 또는 영어 조합이어야 합니다."
      );
    } else {
      setPasswordError("");
    }
  };

  const validatePasswordsConfirm = () => {
    if (password !== passwordConfirm) {
      setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordConfirmError("");
    }
  };

  const validateCaptchaHandler = async () => {
    try {
      const isValid = await validateCaptcha(clientId, captchaInput);
      setCaptchaValidStatus(
        isValid ? "보안 코드가 올바릅니다." : "보안 코드가 유효하지 않습니다."
      );
    } catch (error) {
      console.error("Error validating CAPTCHA:", error);
      alert("CAPTCHA 유효성 검사 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async () => {
    if (
      usernameStatus === "사용 가능" &&
      !nicknameError &&
      !passwordError &&
      captchaValidStatus === "보안 코드가 올바릅니다."
    ) {
      try {
        const response = await registerUser(username, nickname, password);
        setSignupResponse(response); // 회원가입 결과 저장
        setSuccessModalOpen(true); // 성공 모달 열기
        onClose(); // 회원가입 창 닫기
      } catch (error) {
        console.error("회원가입 실패:", error);
        alert("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } else {
      alert("회원가입 조건을 모두 충족해야 합니다.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("복사되었습니다.");
  };

  return (
    <>
      <ReactModal
        isOpen={isOpen}
        onRequestClose={onClose}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
        ariaHideApp={false}
        shouldCloseOnOverlayClick={false}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalTitle}>회원가입</div>
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>아이디</div>
            <div>
              <input
                type="text"
                className={styles.editableInputId}
                value={username}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // 영어와 숫자만 허용하는 정규식
                  if (/^[a-zA-Z0-9]*$/.test(inputValue)) {
                    setUsername(inputValue); // 유효한 입력만 설정
                  }
                }}
              />
              {usernameStatus && (
                <p className={styles.statusMessage}>{usernameStatus}</p>
              )}
            </div>
            <button
              className={styles.buttonLike}
              onClick={checkUsernameHandler}
            >
              중복 확인
            </button>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>닉네임</div>
            <input
              type="text"
              className={styles.editableInput}
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
            />
            {nicknameError && <p className={styles.error}>{nicknameError}</p>}
          </div>
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>비밀번호</div>
            <div>
              <input
                type="password"
                className={styles.editableInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validatePasswords}
              />
              {passwordError && <p className={styles.error}>{passwordError}</p>}
            </div>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.formLabel}>비밀번호 확인</div>
            <div>
              <input
                type="password"
                className={styles.editableInput}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                onBlur={validatePasswordsConfirm}
              />
              {passwordConfirmError && (
                <p className={styles.error}>{passwordConfirmError}</p>
              )}
            </div>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.captchaBox}>
              <div className={styles.captchaImageBox}>
                {captchaImage && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={captchaImage}
                    alt="CAPTCHA"
                    width={200}
                    height={100}
                    className={styles.captchaImage}
                  />
                )}
                <button className={styles.buttonLike} onClick={fetchNewCaptcha}>
                  새로 고침
                </button>
              </div>
              <div className={styles.captchaInputBox}>
                <div>
                  <input
                    type="text"
                    className={styles.editableInputCaptcha}
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                  />
                  {captchaValidStatus && (
                    <p className={styles.statusMessage}>{captchaValidStatus}</p>
                  )}
                </div>
                <button
                  className={styles.buttonLike}
                  onClick={validateCaptchaHandler}
                >
                  코드 확인
                </button>
              </div>
            </div>
          </div>
          <div className={styles.buttonBox}>
            <button className={styles.closeButtonLike} onClick={onClose}>
              취소
            </button>
            <button className={styles.closeButtonLike} onClick={handleSubmit}>
              완료
            </button>
          </div>
        </div>
      </ReactModal>
      {signupResponse && (
        <ReactModal
          isOpen={successModalOpen}
          onRequestClose={() => setSuccessModalOpen(false)}
          className={styles.signupResponseModal}
          overlayClassName={styles.modalOverlay}
          ariaHideApp={false}
        >
          <div className={styles.signupResponseModalContent}>
            <p className={styles.signupResponseFormLabel}>{"닉네임"}</p>
            <p
              className={styles.securityCodeUserId}
            >{`${signupResponse.user_id}#${signupResponse.discriminator}`}</p>
            <div className={styles.securityCodeBox}>
              <p className={styles.signupResponseLabel}>{"보안코드"}</p>
              <p className={styles.securityCode}>
                {signupResponse.security_code}
              </p>

              <Image
                className={styles.securitybuttonLike}
                src={CopyButtonImg}
                alt="CopyButton"
                width={20}
                height={20}
                onClick={() => copyToClipboard(signupResponse.security_code)}
              />
            </div>
            <p className={styles.signupResponseLabel}>
              위 보안 코드는 아이디 찾기와 비밀번호 찾기에 사용됩니다. 반드시
              보관하세요. 다시는 제공되지 않습니다.
            </p>

            <button
              className={styles.closeButtonLike}
              onClick={() => setSuccessModalOpen(false)}
            >
              닫기
            </button>
          </div>
        </ReactModal>
      )}
    </>
  );
}

export default SignupModal;
