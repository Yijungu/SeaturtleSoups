"use client"; 

import { useState, useEffect } from "react";
import styles from "../../styles/ThanksPage.module.scss";
import Footer from "../..//components/common/Footer";
import RatingWindow from "../../components/thanks/RatingWindow";
import UserAnswer from "../../components/thanks/UserAnswer";
import AIAnswer from "../../components/thanks/AIAnswer";
import PlaySummary from "../../components/thanks/PlaySummary";
import LogoButton from "../../components/common/LogoButton";
import Nickname from "../../components/common/Nickname";
import CenteredModal from "../../components/thanks/CenteredModal";
import StatusModal from "../../components/thanks/StatusModal";

export default function Thanks() {
  const [rating, setRating] = useState<number | null>(null);
  const [status, setStatus] = useState<"correct" | "giveup">("correct");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [id, setId] = useState<string | null>(null); // New state for ID

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const statusFromQuery = query.get("status") as "correct" | "giveup" | null;
    const idFromQuery = query.get("id"); // Extract ID from query
    if (statusFromQuery) {
      setIsStatusModalOpen(true);
      setStatus(statusFromQuery);
    }
    if (idFromQuery) {
      setId(idFromQuery); // Set ID state
    }
  }, []);

  useEffect(() => {
    setRating(Number(localStorage.getItem("rating")) || null);
  }, []);

  return (
    <div className={styles.container}>
      <LogoButton />
      <Nickname />
      <CenteredModal isOpen={status ? false : true} />
      <StatusModal
        isOpen={isStatusModalOpen}
        status={status}
        onClose={() => setIsStatusModalOpen(false)}
      />
      <UserAnswer id={id}/>
      <AIAnswer id={id}/>
      <PlaySummary id={Number(id)} />
      <RatingWindow
        id={Number(id)}
        isOpen={rating === -1 ? true : false}
        closeRating={(rate: number) => setRating(rate)}
      />
      <Footer />
    </div>
  );
}
