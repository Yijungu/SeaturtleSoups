"use client";

import React, { useEffect, useState } from 'react';
import styles from '../../styles/common/Nickname.module.scss';
import Image from 'next/image';
import profileImage from '../../../public/images/Profile.png';

export default function Nickname() {
  const [nickname, setNickname] = useState<string | null>(null);

  // Use useEffect to access localStorage after component mounts
  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname') || '';
    setNickname(storedNickname);
  }, []);

  // If nickname is null, don't render the nickname to avoid hydration issues
  if (nickname === null) return null;

  return (
    <div className={styles.nicknameContainer}>
      <Image
        className={styles.profilePhoto}
        src={profileImage}
        alt="Profile"
        width={36}
        height={36}
      />
      <div className={styles.nickname}>
        {nickname ? `${nickname}님` : '사용자님'}
      </div>
    </div>
  );
}
