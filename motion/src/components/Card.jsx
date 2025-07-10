import styles from "./Card.module.scss";
import { motion } from "motion/react";

export default function Card({ title, content, isActive, onClick, children, className }) {
  return (
    <motion.section
      className={`${styles.card} ${styles[className]}`}
      onClick={onClick}
      initial={false}
      animate={{ scale: isActive ? 1.02 : 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2 style={{ color: isActive ? "var(--accent)" : "var(--text-light)" }}>{title}</h2>
      {isActive && (
        <>
          <p>{content}</p>
          {children}
        </>
      )}
    </motion.section>
  );
}
