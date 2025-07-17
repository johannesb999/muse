import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Timeline from "../components/Timeline";
import styles from "../components/scss/History.module.scss";

const timelineItems = [
  {
    year: "1972",
    title: "Gründung des Unternehmens in Neu-Ulm",
    text: `Die Wirtschaftskanzlei SGP Schneider Geiwitz wurde 1972 in Neu-Ulm gegründet und bot von Beginn an Wirtschaftsprüfung, Steuer- und Rechtsberatung, Corporate Finance, Nachlassverwaltung, Restrukturierung und Insolvenzverwaltung an.`,
    img: "/assets/historie-1972.png",
    type: "history",
    track: "B",
  },
  {
    year: "1995",
    title: "Eintritt von Arndt Geiwitz",
    text: `Der Eintritt von Arndt Geiwitz prägte die zukünftige Ausrichtung und Reputation von SGP maßgeblich. Seine Mandate wurden öffentlichkeitswirksam und hoben die Expertise der Kanzlei hervor.`,
    img: "/assets/historie-1995.png",
    type: "case",
    track: "A",
  },
  {
    year: "1995",
    title: "Öffentlichkeitswirksame Mandate",
    text: `Durch die Übernahme von prominenten Mandaten wuchs die Bekanntheit der Kanzlei stetig und etablierte SGP als führende Adresse für komplexe wirtschaftliche Herausforderungen.`,
    img: "/assets/historie-1995.png",
    type: "case",
    track: "A",
  },
  {
    year: "2000",
    title: "Insolvenzverwaltung",
    text: `Ab 2000 erfolgte der Ausbau der Insolvenzverwaltung mit mehreren Großmandaten in der Region.`,
    img: "/assets/historie-2012.png",
    type: "case",
    track: "A",
  },
  {
    year: "2024",
    title: "Der neue SGP Campus",
    text: `2024 wurde der moderne SGP Campus eröffnet – ein Zentrum für Beratung, Forschung und Lehre.`,
    img: "/assets/historie-2012.png",
    type: "history",
    track: "B",
  },
];

const imageVariants = {
  center: {
    left: "30%", // Bild A zentriert, Text wird rechts davon positioniert
    x: "-50%",
    scale: 1, // Startet klein
    opacity: 1,
    zIndex: 4,
    filter: "blur(0px) brightness(1)",
    transition: {
      scale: { duration: 0.3, delay: 1.3 }, // Vergrößern nach Verschieben
      left: { duration: 0.5, delay: 0.8 }, // Verschieben nach Pause
      x: { duration: 0.5, delay: 0.8 },
      opacity: { duration: 0.3 },
      filter: { duration: 0.3 },
    },
  },
  leftEdge: {
    left: "0%",
    x: "-50%", // Teilweise abgeschnitten
    scale: 0.5,
    opacity: 1,
    zIndex: 3,
    filter: "blur(0px) brightness(0.5)",
    transition: {
      scale: { duration: 0.3 }, // Verkleinern zuerst
      left: { duration: 0.5, delay: 0.8 }, // Verschieben nach Pause
      x: { duration: 0.5, delay: 0.8 },
      opacity: { duration: 0.3 },
      filter: { duration: 0.3 },
    },
  },
  rightEdge: {
    left: "100%",
    x: "-50%", // Teilweise abgeschnitten
    scale: 0.5,
    opacity: 1,
    zIndex: 3,
    filter: "blur(0px) brightness(0.5)",
    transition: {
      scale: { duration: 0.3 }, // Verkleinern zuerst
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
      scale: { duration: 0.3 },
      left: { duration: 0.5, delay: 0.8 },
      x: { duration: 0.5, delay: 0.8 },
      opacity: { duration: 0.3 },
    },
  },
  hiddenRight: {
    left: "150%",
    x: "-50%",
    opacity: 0,
    scale: 0.5,
    zIndex: 1,
    transition: {
      scale: { duration: 0.3 },
      left: { duration: 0.5, delay: 0.8 },
      x: { duration: 0.5, delay: 0.8 },
      opacity: { duration: 0.3 },
    },
  },
  // Zustand für Verkleinerung vor Verschieben
  shrink: {
    scale: 0.5,
    transition: { duration: 0.3 },
  },
};

const textVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 1.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
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
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div className={styles.year}>{activeItem.year}</motion.div>
              <motion.div className={styles.title}>
                {activeItem.title}
              </motion.div>
              <motion.p className={styles.text}>{activeItem.text}</motion.p>
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
