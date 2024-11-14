"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { fetchStoryById, fetchTodayStory } from "../api/qnaApi";
import { toKSTISOString, toKSTISOStringFull } from "@/utils/dateUtils";

interface Qna {
  question: string;
  answer: string;
}

interface Story {
  id: number;
  title: string;
  question: string;
  answer: string;
  background: string | null;
  date: string;
  success_count: number;
  rating: number;
  hint1: string | null;
  hint2: string | null;
}

export default function ProblemPage() {
  const searchParams = useSearchParams();
  const storyId = searchParams.get("id");

  const [qnas, setQnas] = useState<Qna[]>([]);
  const [showTipTwo, setShowTipTwo] = useState(false);
  const [tabPressed, setTabPressed] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [hintModalIsOpen, setHintModalIsOpen] = useState(false);
  const [story, setStory] = useState<Story | null>(null);

  const storyKey = `story_${storyId || "today"}`;
  const todayDate = toKSTISOString(new Date());

  // Utility function to manage the story queue in local storage
  const updateStoryQueue = (newStory: Story) => {
    const cachedStories = JSON.parse(localStorage.getItem("storyQueue") || "[]");

    // Check if story already exists in the queue
    const existingIndex = cachedStories.findIndex(
      (s: Story) => s.id === newStory.id
    );
    if (existingIndex !== -1) {
      // Move the existing story to the end of the queue (most recent)
      cachedStories.splice(existingIndex, 1);
    } else if (cachedStories.length >= 2) {
      // Remove the oldest story if queue has two stories already
      cachedStories.shift();
    }

    // Add the new story to the end of the queue
    cachedStories.push(newStory);

    // Update local storage with the new queue
    localStorage.setItem("storyQueue", JSON.stringify(cachedStories));
  };

  // Function to check if a story is in the cache and retrieve it if available
  const getStoryFromCache = (id?: number, date?: string): Story | null => {
    const cachedStories = JSON.parse(localStorage.getItem("storyQueue") || "[]");
    if (id) {
      return cachedStories.find((s: Story) => s.id === id) || null;
    }
    if (date) {
      return cachedStories.find((s: Story) => s.date === date) || null;
    }
    return null;
  };

  // Fetching story data, with cache checking
  useEffect(() => {
    const loadStory = async () => {
      if (storyId) {
        const cachedStory = getStoryFromCache(Number(storyId));
        if (cachedStory) {
          setStory(cachedStory);
        } else {
          try {
            const fetchedStory = await fetchStoryById(Number(storyId));
            setStory(fetchedStory);
            updateStoryQueue(fetchedStory);
          } catch (error) {
            console.error("Error fetching story by ID:", error);
          }
        }
      } else {
        const cachedTodayStory = getStoryFromCache(undefined, todayDate);
        if (cachedTodayStory) {
          setStory(cachedTodayStory);
        } else {
          try {
            const todayStory = await fetchTodayStory();
            setStory(todayStory);
            updateStoryQueue(todayStory);
          } catch (error) {
            console.error("Error fetching today's story:", error);
          }
        }
      }
    };
    loadStory();
  }, [storyId, todayDate]);

  // Load QnAs from localStorage
  useEffect(() => {
    const storyData = JSON.parse(localStorage.getItem(storyKey) || "{}");
    if (storyData.qnas) {
      setQnas(storyData.qnas);
    }

    if (!storyData.startTime) {
      const now = new Date();
      const currentDate = toKSTISOStringFull(now);
      storyData.startTime = currentDate;
    }
  }, [storyKey]);

  // Save QnAs to localStorage
  const saveQnasToLocalStorage = (qnas: Qna[]) => {
    const storyData = JSON.parse(localStorage.getItem(storyKey) || "{}");
    storyData.qnas = qnas;
    localStorage.setItem(storyKey, JSON.stringify(storyData));
  };

  const addQna = (question: string, answer: string): Qna[] => {
    const newQna = { question, answer };
    const updatedQnas = [newQna, ...qnas];
    setQnas(updatedQnas);
    saveQnasToLocalStorage(updatedQnas);
    return updatedQnas;
  };

  const deleteQna = (index: number) => {
    const updatedQnas = qnas.filter((_, i) => i !== index);
    setQnas(updatedQnas);
    saveQnasToLocalStorage(updatedQnas);
  };

  const updateLastQnaAnswer = (loadingQnas: Qna[], newAnswer: string) => {
    loadingQnas[0] = { ...loadingQnas[0], answer: newAnswer };
    const updatedQnas = [...loadingQnas];
    setQnas(updatedQnas);
    saveQnasToLocalStorage(updatedQnas);
  };

  if (!story) return <div>Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div className={styles.container}>
        <LogoButton />
        <Nickname />
        <QuestionSection question={story.question} />
        <QuestionActionBar
          tabPressed={tabPressed}
          onQuestionCheck={() => setTabPressed(false)}
          onAnswerCheck={() => setTabPressed(true)}
          onHintClick={() => setHintModalIsOpen(true)}
          onGiveUpClick={() => setModalIsOpen(true)}
        />

        <HintModal
          id={story.id}
          isOpen={hintModalIsOpen}
          hint1={story.hint1}
          hint2={story.hint2}
          onRequestClose={() => setHintModalIsOpen(false)}
        />
        <GiveUpModal
          id={story.id}
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
        />

        <TextInput
          addQna={addQna}
          tabPressed={tabPressed}
          onQuestionCheck={() => setTabPressed(false)}
          onAnswerCheck={() => setTabPressed(true)}
          updateLastQnaAnswer={updateLastQnaAnswer}
          id={story.id}
          question={story.question}
          answer={story.answer}
          background={story.background}
        />

        {qnas.map((qna, index) => (
          <ProblemQA key={index} {...qna} deleteQna={() => deleteQna(index)} />
        ))}
        <SideButton />
        <FeedbackButton />
        <ButtonWithTip
          initialShowTip={showTipTwo}
          toggleTip={() => setShowTipTwo(!showTipTwo)}
        />
        <ScrollToTopButton />
        <Footer />
      </div>
    </motion.div>
  );
}
