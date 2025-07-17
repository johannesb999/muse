import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Timeline from "../components/Timeline";
import { timelineItems } from "../data/timelineItems";
import styles from "./scss/History.module.scss";

const imageVariants = {
  center: {
    left: "30%", // Bild A zentriert, Text wird rechts davon positioniert
    x: "-45%",
    scale: 1, // Startet klein
    opacity: 1,
    zIndex: 4,
    filter: "blur(0px) brightness(1)",
    transition: {
      scale: { duration: 0.6, delay: 1.3 }, // Vergrößern nach Verschieben
      left: { duration: 0.5, delay: 0.8 }, // Verschieben nach Pause
      x: { duration: 0.5, delay: 0.8 },
      opacity: { duration: 0.3 },
      filter: { duration: 0.3 },
    },
  },
  leftEdge: {
    left: "0%",
    x: "-55%", // Teilweise abgeschnitten
    scale: 0.5,
    opacity: 1,
    zIndex: 3,
    filter: "blur(0px) brightness(0.5)",
    transition: {
      scale: { duration: 0.6 }, // Verkleinern zuerst
      left: { duration: 0.5, delay: 0.8 }, // Verschieben nach Pause
      x: { duration: 0.5, delay: 0.8 },
      opacity: { duration: 0.3 },
      filter: { duration: 0.3 },
    },
  },
  rightEdge: {
    left: "100%",
    x: "-45%", // Teilweise abgeschnitten
    scale: 0.5,
    opacity: 1,
    zIndex: 3,
    filter: "blur(0px) brightness(0.5)",
    transition: {
      scale: { duration: 0.6 }, // Verkleinern zuerst
      left: { duration: 0.5, delay: 0.8 }, // Verschieben nach Pause
      x: { duration: 0.5, delay: 0.8 },
      opacity: { duration: 0.3 },
      filter: { duration: 0.3 },
    },
  },
  exitLeft: {
    left: "-50%",
    x: "-50%",
    scale: 0.5,
    opacity: 0,
    zIndex: 1,
    transition: {
      scale: { duration: 0.3 }, // Verkleinern zuerst
      left: { duration: 0.5, delay: 0.8 }, // Verschieben nach Pause
      x: { duration: 0.5, delay: 0.8 },
      opacity: { duration: 0.3 },
      filter: { duration: 0.3 },
    },
  },
  hiddenRight: {
    left: "150%",
    x: "-50%",
    opacity: 0,
    scale: 0.5,
    zIndex: 1,
    transition: {
      scale: { duration: 0.3 }, // Verkleinern zuerst
      left: { duration: 0.5, delay: 0.8 }, // Verschieben nach Pause
      x: { duration: 0.5, delay: 0.8 },
      opacity: { duration: 0.3 },
      filter: { duration: 0.3 },
    },
  },
  // Zustand für Verkleinerung vor Verschieben
  shrink: {
    scale: 0.5,
    transition: { duration: 0.3 },
  },
};

const TIMELINE_HEIGHT = 320;

export default function History() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = timelineItems[activeIndex];

  const navigateTo = (index) => {
    if (index >= 0 && index < timelineItems.length) {
      setActiveIndex(index);
    }
  };

  return (
    <div className={styles.historyContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.imageStage}>
          {timelineItems.map((item, idx) => {
            let variant;
            const diff = idx - activeIndex;

            if (diff === 0) {
              variant = "center";
            } else if (diff === -1) {
              variant = "leftEdge";
            } else if (diff === 1) {
              variant = "rightEdge";
            } else if (diff < -1) {
              variant = "exitLeft";
            } else {
              variant = "hiddenRight";
            }

            // Verkleinerung vor Verschieben nur für das aktuelle zentrale Bild
            const initialVariant = diff === 0 ? "shrink" : "hiddenRight";

            const imgClass =
              variant === "center"
                ? styles.centerImg
                : variant === "leftEdge"
                ? styles.leftImg
                : variant === "rightEdge"
                ? styles.rightImg
                : "";

            return (
              <motion.div
                key={idx}
                className={`${styles.imageContainer} ${imgClass}`}
                variants={imageVariants}
                initial={initialVariant}
                animate={variant}
                onClick={() => {
                  if (variant === "leftEdge" || variant === "rightEdge") {
                    navigateTo(idx);
                  }
                }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className={styles.panelImg}
                />
              </motion.div>
            );
          })}
        </div>

        <div className={styles.textContainer}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                className={styles.year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48, delay: 1.7 }}
              >
                {activeItem.year}
              </motion.div>
              <motion.div
                className={styles.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48, delay: 2.18 }}
              >
                {activeItem.title}
              </motion.div>
              <motion.p
                className={styles.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 2.5 }}
              >
                {activeItem.text}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Timeline
        items={timelineItems}
        activeIndex={activeIndex}
        onSelect={navigateTo}
        height={TIMELINE_HEIGHT}
      />
    </div>
  );
}
