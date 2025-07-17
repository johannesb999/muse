import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Timeline from "../components/Timeline";
import styles from "../components/scss/History.module.scss";

// use \n to break line
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
    x: "0%",
    scale: 1.15,
    opacity: 1,
    zIndex: 4,
    filter: "blur(0px) brightness(1)",
  },
  leftEdge: {
    x: "-130%",
    scale: 0.5,
    opacity: 1,
    zIndex: 3,
    filter: "blur(0px) brightness(0.5)",
  },
  rightEdge: {
    x: "80%",
    scale: 0.5,
    opacity: 1,
    zIndex: 3,
    filter: "blur(0px) brightness(0.5)",
  },
  exitLeft: {
    x: "-200%",
    scale: 0.5,
    opacity: 0,
    zIndex: 1,
  },
  hiddenRight: {
    x: "200%",
    opacity: 0,
    scale: 0.4,
    zIndex: 1,
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
        <div className={styles.textContainer}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
            >
              <motion.div
                className={styles.year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.7 }}
              >
                {activeItem.year}
              </motion.div>
              <motion.div
                className={styles.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7, duration: 0.7 }}
              >
                {activeItem.title}
              </motion.div>
              <motion.p
                className={styles.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.3, duration: 0.7 }}
              >
                {activeItem.text}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

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

            return (
              <motion.div
                key={idx}
                className={styles.imageContainer}
                variants={imageVariants}
                initial="hiddenRight"
                animate={variant}
                transition={{
                  scale: {
                    type: "spring",
                    stiffness: 60,
                    damping: 20,
                    duration: 0.4,
                    delay: 0.3,
                  },
                  x: {
                    type: "spring",
                    stiffness: 40,
                    damping: 15,
                    duration: 0.5,
                    delay: 0.7,
                  },
                  opacity: {
                    duration: 0.3,
                    delay: 0.3,
                  },
                  filter: {
                    duration: 0.3,
                    delay: 0.7,
                  },
                }}
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
