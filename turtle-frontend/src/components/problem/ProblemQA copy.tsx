import Typography from "@mui/material/Typography";
// import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import Loading from "./Loading";
import styles from '../../styles/problem/ProblemQA.module.scss'; 

// 이미지 import - Next.js에서 public 폴더 사용
import AiIcon from "../../../public/images/AiIcon.png";
import UserIcon from "../../../public/images/UserIcon.png";
import DetailOpenButton from "../../../public/images/DetailOpenButton.png";
import DetailCloseButton from "../../../public/images/DetailCloseButton.png";
import RerollButton from "../../../public/images/RerollButton.png";
import RecollQuestion from "../../../public/images/RecollQuestion.png";
import AiQuestionTag from "../../../public/images/AiQuestionTag.png";
import GreenGraph from "../../../public/images/GreenGraph.png";
import YellowGraph from "../../../public/images/YellowGraph.png";
import RedGraph from "../../../public/images/RedGraph.png";
import GreenMassege from "../../../public/images/GreenMassege.png"; // 추가
import YellowMassege from "../../../public/images/YellowMassege.png"; // 추가
import RedMassegeYou from "../../../public/images/RedMassegeYou.png"; // 추가
import RedMassegeWhat from "../../../public/images/RedMassegeWhat.png"; // 추가

interface QnAProps {
  question: string;
  answer: string;
  aiQuestion: string | JSX.Element;
  aiQuestionKr: string | JSX.Element;
  opened: boolean;
  index: number;
  answerSubmit: boolean;
  borderBottomStrength: string;
  updateQnas: (index: number) => void;
  problemCheck: string;
}

const ProblemQA: React.FC<QnAProps> = ({
  question,
  answer,
  aiQuestion,
  aiQuestionKr,
  opened,
  index,
  answerSubmit,
  borderBottomStrength,
  updateQnas,
  problemCheck,
}) => {
  // const router = useRouter();
  const [boxes, setBoxes] = useState(opened);
  const [rerollQuestion, setRerollQuestion] = useState(aiQuestion);
  const [rerollQuestionKr, setRerollQuestionKr] = useState(aiQuestionKr);
  const [rerolledAnswer, setRerolledAnswer] = useState(answer);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [isAnswerSubmit, setIsAnswerSubmit] = useState(answerSubmit);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [isProblemCheck, setIsProblemCheck] = useState(problemCheck);
  const [isHovered] = useState(false); // Hover 상태 관리

  useEffect(() => {
    setIsProblemCheck(problemCheck);
  }, [problemCheck]);

  useEffect(() => {
    setBoxes(opened);
  }, [opened]);

  useEffect(() => {
    setRerolledAnswer(answer);
  }, [answer]);

  useEffect(() => {
    setRerollQuestion(aiQuestion);
  }, [aiQuestion]);

  useEffect(() => {
    setRerollQuestionKr(aiQuestionKr);
  }, [aiQuestionKr]);

  useEffect(() => {
    setIsAnswerSubmit(answerSubmit);
  }, [answerSubmit]);

  const rerollResponse = async () => {
    setIsAiLoading(true);
    try {
      const response = await axios.post("/api/changeQuestion", { data: question });
      if (response.data) {
        const savedQnas = JSON.parse(localStorage.getItem("qnas") || "[]");
        savedQnas[index].aiQuestion = response.data.response;
        localStorage.setItem("qnas", JSON.stringify(savedQnas));
        setRerollQuestion(response.data.response);
        setRerollQuestionKr(response.data.response_kr);
      }
    } catch (error) {
      console.error("Error rerolling response: ", error);
    }
    setIsAiLoading(false);
  };

  const rerollQuestionFunction = async () => {
    setIsAnswerLoading(true);
    if (!isAnswerSubmit) {
      try {
        const response = await axios.post("/api/questionEn", { data: rerollQuestion });
        const savedQnas = JSON.parse(localStorage.getItem("qnas") || "[]");
        const responseString = JSON.stringify(response.data.response);

        if (responseString.includes("Yes")) {
          savedQnas[index].answer = "네.";
          setRerolledAnswer("네.");
        } else if (responseString.includes("No")) {
          savedQnas[index].answer = "아니오.";
          setRerolledAnswer("아니오.");
        } else if (responseString.includes("Probably not")) {
          savedQnas[index].answer = "아마 아닐 겁니다.";
          setRerolledAnswer("아마 아닐 겁니다.");
        } else if (responseString.includes("Probably")) {
          savedQnas[index].answer = "아마 맞을 겁니다.";
          setRerolledAnswer("아마 맞을 겁니다.");
        } else {
          savedQnas[index].answer = "중요하지 않은 정보입니다.";
          setRerolledAnswer("중요하지 않은 정보입니다.");
        }
        localStorage.setItem("qnas", JSON.stringify(savedQnas));
      } catch (error) {
        console.error("Error rerolling response: ", error);
      }
    } else {
      const savedQnas = JSON.parse(localStorage.getItem("qnas") || "[]");
      const anotherResponse = await axios.post("/api/submit", { data: rerollQuestion });

      if (anotherResponse.data.response.startsWith("네")) {
        const now = new Date();
        const currentDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        localStorage.setItem("endTime", now.toString());
        const lastCorrectDate = localStorage.getItem("lastCorrectDate");
        const lastGiveUpDate = localStorage.getItem("lastGiveUpDate");

        if (lastGiveUpDate !== currentDate && lastCorrectDate !== currentDate) {
          localStorage.setItem("lastCorrectDate", currentDate);
          const savedCorrectAnswers = Number(localStorage.getItem("correctAnswers") || 0);
          localStorage.setItem("correctAnswers", (savedCorrectAnswers + 1).toString());
        }

        // router.push("/explanation");
      } else {
        savedQnas[index].answer = "정답이 아닙니다.";
        localStorage.setItem("qnas", JSON.stringify(savedQnas));
      }
    }
    setIsAnswerLoading(false);
  };

  const handleDeleteClick = () => {
    updateQnas(index);
  };

  const handleMouseOver = () => setIsDeleteVisible(true);
  const handleMouseOut = () => setIsDeleteVisible(false);

  return (
    <div className={styles.container} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <div className={styles.box}>
        <Image src={UserIcon} alt="SeaTurtle" width={20} height={20} />
        <Typography>{question}</Typography>
        <Image
          src={boxes ? DetailCloseButton : DetailOpenButton}
          alt="Toggle Details"
          width={20}
          height={20}
          className={styles['toggle-button']}
          onClick={() => setBoxes(!boxes)}
        />
      </div>

      {boxes && (
        <div>
          <div className={styles['detail-box']}>
            <Image src={AiQuestionTag} alt="SeaTurtle" width={17} height={17} />
            {isAiLoading ? (
              <Loading />
            ) : (
              <Typography className={styles.typography}>{rerollQuestion}</Typography>
            )}
            <Image
              src={RerollButton}
              alt="Reroll"
              width={15}
              height={15}
              className={styles['reroll-button']}
              onClick={rerollResponse}
            />
            <Image
              src={RecollQuestion}
              alt="Reask"
              width={20}
              height={20}
              className={styles['reask-button']}
              onClick={rerollQuestionFunction}
            />
          </div>

          <div className={styles['detail-box']}>
            <Image src={AiQuestionTag} alt="SeaTurtle" width={17} height={17} />
            <Typography className={styles.typography}>{rerollQuestionKr}</Typography>
            <div>
              {isProblemCheck === 'noproblem' && (
                <Image src={GreenGraph} alt="GreenGraph" className={styles['graph-icon']} />
              )}
              {isProblemCheck === 'not' && (
                <Image src={YellowGraph} alt="YellowGraph" className={styles['graph-icon']} />
              )}
              {(isProblemCheck === 'you' || isProblemCheck === 'what') && (
                <Image src={RedGraph} alt="RedGraph" className={styles['graph-icon']} />
              )}
            </div>
          </div>

          <div className={styles['problem-check-icon']}>
            {isHovered && isProblemCheck === 'noproblem' && (
              <Image src={GreenMassege} alt="GreenMassege" width={300} height={150} />
            )}
            {isHovered && isProblemCheck === 'not' && (
              <Image src={YellowMassege} alt="YellowMassege" width={300} height={150} />
            )}
            {isHovered && isProblemCheck === 'you' && (
              <Image src={RedMassegeYou} alt="RedGraph" width={300} height={150} />
            )}
            {isHovered && isProblemCheck === 'what' && (
              <Image src={RedMassegeWhat} alt="RedGraph" width={300} height={150} />
            )}
          </div>
        </div>
      )}

      <div
        className={styles['detail-box']}
        style={{ borderBottom: `${borderBottomStrength} solid black` }}
      >
        <Image src={AiIcon} alt="AI" width={20} height={20} />
        <Typography>
          {isAnswerLoading ? <Loading /> : <Typography>{rerolledAnswer}</Typography>}
        </Typography>
      </div>

      <div className={styles['delete-button']}>
        <button
          className={isDeleteVisible ? 'visible' : 'hidden'}
          onClick={handleDeleteClick}
        >
          ㅡ
        </button>
      </div>
    </div>
  );
};

export default ProblemQA;
