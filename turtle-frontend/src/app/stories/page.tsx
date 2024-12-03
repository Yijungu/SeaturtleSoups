"use client";

import styles from "../../styles/StoryPage.module.scss";
import { motion } from "framer-motion";
import Footer from "@/components/common/Footer";
import StoryCarousel from "@/components/stories/StoryCarousel";
import StoriesHeader from "@/components/stories/StoriesHeader";
import LoginModalButton from "@/components/stories/LoginModalButton";

export default function Stories() {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: "flex", // Flexbox 사용
        justifyContent: "center", // 가로로 가운데 정렬
      }}
    >
      <div className={styles.container}>
        <LoginModalButton/>
        <StoriesHeader/>
        <StoryCarousel />
        <Footer />
      </div>
    </motion.div>
  );
}
