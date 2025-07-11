import styles from "./scss/Card.module.scss";
import { motion } from "motion/react";

export default function Card({
  title,
  content,
  isActive,
  onClick,
  children,
  modifier,
  active,
}) {
  return (
    <motion.section
      className={[
        styles.card,
        modifier ? styles[`card--${modifier}`] : "",
        active ? styles["card--active"] : "",
      ].join(" ")}
      onClick={onClick}
      initial={false}
      animate={{ scale: isActive ? 1.02 : 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2 className={active ? styles.titleActive : undefined}>{title}</h2>
      {isActive && (
        <>
          <p>{content}</p>
        </>
      )}
      {children}
    </motion.section>
  );
}
