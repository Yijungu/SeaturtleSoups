import styles from '../../styles/home/ConversationImage.module.scss';
import Image from 'next/image';
import conversationImage from '../../../public/images/HomeConversationPC.png';

export default function ConversationImage() {
  return (
    <div className={styles.conversationBox}>
      <Image
        src={conversationImage}
        alt="HomeConversation"
        width={650}
        height={520}
      />
    </div>
  );
}
