import React from 'react';
import styles from '../../styles/home/QnA.module.scss';

export default function QnA() {
  return (
    <div className={styles.detail}>
      <div className={styles.QnA_start}>질문과 답변</div>

      {/* 첫 번째 질문 */}
      <div className={styles.QnA_box}>
        <span className={styles.QnA_question}>Q. 마이수프레시피란 무엇인가요?</span>
        <p className={styles.A_dot}> A.</p>
        <span className={styles.QnA_answer}>
          마이수프레시피는 매일 한 개의 바다거북수프 문제를 선정하여 출제하는 곳입니다. 
          바다거북수프 문제란 보통 기묘한 내용을 바탕으로 만들어지는 추리게임입니다. 
          어떠한 상황을 제시하면 왜 그런 상황이 발생했는지 추리해서 정답을 맞히면 됩니다. 
          상상력을 총동원해서 오늘의 정답을 맞혀보세요!
        </span>
      </div>

      {/* 두 번째 질문 */}
      <div className={styles.QnA_box}>
        <span className={styles.QnA_question}>Q. 게임 방법은 무엇인가요?</span>
        <p className={styles.A_dot}> A.</p>
        <span className={styles.QnA_answer}>
          바다거북수프 문제가 출제되면, 유저들은 AI에게 예, 아니오로 대답할 수 있는 질문을 단계에 따라 입력합니다. 
          질문을 할 때는 문장의 끝에 <span className={styles.boldWord}>‘?’</span> 를 붙여주세요.
          질문에 대한 답을 듣게 되면, 이를 바탕으로 이야기의 전말을 추리합니다. 
          이렇게 반복하여 문답을 진행한 뒤, 정답을 맞히고 싶다면 <span className={styles.boldWord}>‘Tab 키’</span>를 눌러 정답을 작성하면 됩니다.
        </span>
      </div>

      {/* 세 번째 질문 */}
      <div className={styles.QnA_box}>
        <span className={styles.QnA_question}>Q. 하루에 한 번 이상 플레이할 수 없나요?</span>
        <p className={styles.A_dot}> A.</p>
        <span className={styles.QnA_answer}>
          마이수프레시피는 하루에 한 문제만 출제됩니다. 마이수프레시피는{' '}
          <a
            href="https://semantle-ko.newsjel.ly/"
            target="_blank"
            rel="noopener noreferrer"
          >
            &apos;꼬맨틀&apos;
          </a>
          을 바탕으로 만들게 되었습니다. 우리의 목적은 꼬맨틀처럼 &quot;하루 한 번, 여러분의 일일퀘스트&quot;가 되는 것입니다.
        </span>
      </div>

      {/* 네 번째 질문 */}
      <div className={styles.QnA_box}>
        <span className={styles.QnA_question}>Q. 나만의 문제를 출제하는 방법은 무엇인가요?</span>
        <p className={styles.A_dot}> A.</p>
        <span className={styles.QnA_answer}>
          나만의 문제는 ‘오늘의 문제’에 대한 해설 페이지 하단에서 출제할 수 있습니다. 해설 페이지는 오늘의 문제를 맞히거나 포기할 시 확인 가능합니다.
        </span>
      </div>

      {/* 다섯 번째 질문 */}
      <div className={styles.QnA_box}>
        <span className={styles.QnA_question}>Q. 다른 질문이나 피드백은 어떻게 보내나요?</span>
        <p className={styles.A_dot}> A.</p>
        <span className={styles.QnA_answer}>
          질문이나 피드백은 F2__2F@naver.com로 문의해주세요!
        </span>
      </div>
    </div>
  );
}
