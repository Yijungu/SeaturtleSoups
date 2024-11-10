import Image from "next/image";
import CopyButtonImg from "../../../public/images/CopyButton.png";
import styles from "../../styles/thanks/CopyButton.module.scss";
interface CopyButtonProps {
  handleCopy: () => void;
}

export default function CopyButton({ handleCopy }: CopyButtonProps) {
  return (
    <Image
      className={styles.copy_button}
      src={CopyButtonImg}
      alt="CopyButton"
      width={20}
      height={23}
      onClick={handleCopy}
    />
  );
}
