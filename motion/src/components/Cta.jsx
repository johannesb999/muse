import { motion } from "motion/react";
import styles from "./Card.module.scss";

export default function Cta({ children, ...props }) {
  return (
    <motion.a
      href="#"
      className={styles.cta}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.a>
  );
}
