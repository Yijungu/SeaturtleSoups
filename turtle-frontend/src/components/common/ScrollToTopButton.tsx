"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import scrollToTopImage from "../../../public/images/ScrollToTopButton.png";
import styles from '../../styles/common/ScrollToTopButton.module.scss';


const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 위치에 따라 버튼 가시성 토글
  const toggleVisibility = () => {
    if (window.pageYOffset > 0) { // 스크롤이 맨 위가 아니면
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // 화면 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div
      className={`${styles.scrollToTop} ${isVisible ? styles.visible : ''}`} 
    >
      <div onClick={scrollToTop}>
      <Image src={scrollToTopImage} alt="Go to top" width={40} height={40} />
      </div>
    </div>
  );
};

export default ScrollToTopButton;
