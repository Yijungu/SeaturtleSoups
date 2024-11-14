"use client";

import StoryList from "@/components/stories/StoryList";
import styles from "../../styles/StoryPage.module.scss";
import { motion } from "framer-motion";
import Nickname from "@/components/common/Nickname";
import LogoButtonLeft from "@/components/common/LogoButtonLeft";
import Footer from "@/components/common/Footer";

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
        <LogoButtonLeft />
        <Nickname />
        <StoryList />
        <Footer />
      </div>
    </motion.div>
  );
}
