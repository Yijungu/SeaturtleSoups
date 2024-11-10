"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "../../styles/ProblemPage.module.scss";
import HintModal from "../../components/problem/HintModal";
import GiveUpModal from "../../components/problem/GiveUpModal";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";
import ButtonWithTip from "../../components/problem/ButtonWithTip";
import ProblemQA from "../../components/problem/ProblemQA";
import Nickname from "../../components/common/Nickname";
import QuestionSection from "../../components/problem/QuestionSection";
import TextInput from "../../components/problem/TextInput";
import QuestionActionBar from "../../components/problem/QuestionActionBar";
import LogoButton from "../../components/common/LogoButton";
import Footer from "@/components/common/Footer";
import SideButton from "@/components/common/SideButton";
import FeedbackButton from "@/components/common/FeedbackButton";

interface Qna {
  question: string;
  answer: string;
}

export default function ProblemPage() {
  const [qnas, setQnas] = useState<Qna[]>([]);
  const [showTipTwo, setShowTipTwo] = useState(false);
  const [tabPressed, setTabPressed] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [hintModalIsOpen, setHintModalIsOpen] = useState(false);

  // 로컬 스토리지에서 QnA 로드
  useEffect(() => {
    const savedQnas = localStorage.getItem("qnas");
    if (savedQnas) {
      setQnas(JSON.parse(savedQnas));
    }
  }, []);

  // QnA를 로컬 스토리지에 저장하는 함수
  const saveQnasToLocalStorage = (qnas: Qna[]) => {
    localStorage.setItem("qnas", JSON.stringify(qnas));
  };

  const addQna = (question: string, answer: string): Qna[] => {
    const newQna = { question, answer };
    const updatedQnas = [newQna, ...qnas];
    setQnas(updatedQnas);
    return updatedQnas;
  };

  const deleteQna = (index: number) => {
    const updatedQnas = qnas.filter((_, i) => i !== index);
    setQnas(updatedQnas);
    saveQnasToLocalStorage(updatedQnas); // 로컬 스토리지에 저장
  };
  
  const updateLastQnaAnswer = (loadingQnas: Qna[], newAnswer: string) => {
    loadingQnas[0] = { ...loadingQnas[0], answer: newAnswer }; // 마지막 qna의 answer만 업데이트
    const updatedQnas = [...loadingQnas];
    setQnas(updatedQnas);
    saveQnasToLocalStorage(loadingQnas); // 로컬 스토리지에 저장
  };

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
          <LogoButton />
          <Nickname />
          <QuestionSection />
          <QuestionActionBar
            tabPressed={tabPressed}
            onQuestionCheck={() => setTabPressed(false)}
            onAnswerCheck={() => setTabPressed(true)}
            onHintClick={() => setHintModalIsOpen(true)}
            onGiveUpClick={() => setModalIsOpen(true)}
          />

          <HintModal
            isOpen={hintModalIsOpen}
            onRequestClose={() => setHintModalIsOpen(false)}
          />
          <GiveUpModal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
          />

          <TextInput
            addQna={addQna}
            tabPressed={tabPressed}
            onQuestionCheck={() => setTabPressed(false)}
            onAnswerCheck={() => setTabPressed(true)}
            updateLastQnaAnswer={updateLastQnaAnswer}
          />

          {qnas.map((qna, index) => (
            <ProblemQA
              key={index}
              {...qna}
              deleteQna={() => deleteQna(index)}
            />
          ))}
          <SideButton/>
          <FeedbackButton/>
          <ButtonWithTip
            initialShowTip={showTipTwo}
            toggleTip={() => setShowTipTwo(!showTipTwo)}
          />
          <ScrollToTopButton />
          <Footer/>
        </div>
      </motion.div>
    
  );
}
