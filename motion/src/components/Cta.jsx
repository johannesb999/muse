import { motion } from "motion/react";
import styles from "./scss/Card.module.scss";

export default function Cta({ children, ...props }) {
  return (
    <motion.a
      href="#"
      className={styles.cta}
      style={{ color: "var(--accent)" }}
      initial={{ opacity: 0, y: 0, scale: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.a>
  );
}
