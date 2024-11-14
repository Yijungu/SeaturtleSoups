"use client";

import styles from '../styles/Home.module.scss';
import { motion } from 'framer-motion';
import Header from '../components/home/Header';
import StartButton from '../components/home/StartButton';
import ConversationImage from '../components/home/ConversationImage';
import NicknameInput from '../components/home/NicknameInput';
import QnA from '../components/home/QnA';
import Footer from '../components/common/Footer';
import ScrollToTopButton from '../components/common/ScrollToTopButton';
import WarehouseButtonHome from '@/components/common/WarehouseButtonHome';

export default function Home() {
  return (
    <motion.div initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      display: "flex", // Flexbox 사용
      justifyContent: "center", // 가로로 가운데 정렬
    }}>
      <div className={styles.container}>
        <Header />
        <StartButton />
        <WarehouseButtonHome/>
        <ConversationImage />
        <NicknameInput/>
        <QnA />
        <ScrollToTopButton />
        <Footer />
      </div>
    </motion.div>
  );
}
