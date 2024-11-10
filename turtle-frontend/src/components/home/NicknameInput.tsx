"use client"; // 클라이언트 컴포넌트 선언

import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import styles from '../../styles/home/NicknameInput.module.scss';
import Image from 'next/image';
import profileImage from '../../../public/images/Profile.png';

export default function NicknameInput() {
  const [nickname, setNickname] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('nickname') || '' : ''
  );
  const [isAnimating, setIsAnimating] = useState<boolean>(false); // 컴포넌트 내부 상태로 변경

  // 입력이 변경될 때마다 발생하는 handleChange 함수
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value); // 상태 업데이트
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setIsAnimating(true); // 애니메이션 시작
      setTimeout(() => setIsAnimating(false), 900); // 애니메이션 종료 (0.9초 후)
      if (typeof window !== 'undefined') {
        localStorage.setItem('nickname', nickname); // 로컬 스토리지에 닉네임 저장
      }
    }
  };

  return (
    <div className={styles.nicknameContainer}>
      <Image className={styles.profilePhoto} src={profileImage} alt="Profile" width={36} height={36} />
      <input
        type="text"
        className={styles.nicknameInput}
        value={nickname} // 상태값을 바인딩
        onChange={handleChange} // 입력이 변경될 때마다 발생
        onKeyDown={handleKeyPress} // Enter 키 이벤트
        placeholder="닉네임을 입력하세요."
      />
      <div className={styles.checkmarkBox}>
        {isAnimating && <div className={styles.checkmark}></div>} {/* 애니메이션 표시 */}
      </div>
    </div>
  );
}
