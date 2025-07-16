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
  },
  {
    year: "1995",
    title: "Eintritt von Arndt Geiwitz",
    text: `Der Eintritt von Arndt Geiwitz prägte die zukünftige Ausrichtung und Reputation von SGP maßgeblich. Seine Mandate wurden öffentlichkeitswirksam und hoben die Expertise der Kanzlei hervor.`,
    img: "/assets/historie-1995.png",
  },
    {
    year: "1995",
    title: "Öffentlichkeitswirksame Mandate",
    text: `Durch die Übernahme von prominenten Mandaten wuchs die Bekanntheit der Kanzlei stetig und etablierte SGP als führende Adresse für komplexe wirtschaftliche Herausforderungen.`,
    img: "historie-1995.png",
  },
  {
    year: "2000",
    title: "Insolvenzverwaltung",
    text: `Ab 2000 erfolgte der Ausbau der Insolvenzverwaltung mit mehreren Großmandaten in der Region.`,
    img: "/assets/historie-2012.png",
  },
  {
    year: "2024",
    title: "Der neue SGP Campus",
    text: `2024 wurde der moderne SGP Campus eröffnet – ein Zentrum für Beratung, Forschung und Lehre.`,
    img: "/assets/historie-2012.png",
  },
];

// Korrigierte Varianten mit viewport-responsive Positionierung
const imageVariants = {
  center: { 
    x: "0%", 
    scale: 1, 
    opacity: 1, 
    zIndex: 4, 
    filter: "blur(0px) brightness(1)" 
  },
  leftEdge: { 
    x: "-120%", 
    scale: 0.5, 
    opacity: 1, 
    zIndex: 3, 
    filter: "blur(0px) brightness(0.5)" 
  },
  rightEdge: { 
    x: "80%", 
    scale: 0.5, 
    opacity: 1, 
    zIndex: 3, 
    filter: "blur(0px) brightness(0.5)" 
  },
  farRight: { 
    x: "200%", 
    scale: 0.4, 
    opacity: 0, 
    zIndex: 1, 
    filter: "blur(0px) brightness(0.35)" 
  },
  exitLeft: { 
    x: "-200%", 
    scale: 0.4, 
    opacity: 0, 
    zIndex: 1 
  },
  hiddenFarRight: { 
    x: "200%", 
    opacity: 0, 
    scale: 0.4, 
    zIndex: 1 
  },
};

const imageTransition = {
  type: "spring",
  stiffness: 40,
  damping: 15,
  duration: 0.6,
  delay: 0.2,
};

const TIMELINE_HEIGHT = 220;

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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.8 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <div className={styles.year}>{activeItem.year}</div>
              <div className={styles.title}>{activeItem.title}</div>
              <p className={styles.text}>{activeItem.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className={styles.imageStage}>
          {timelineItems.map((item, idx) => {
            let variant;
            const diff = idx - activeIndex;

            switch (diff) {
                case 0: variant = "center"; break;
                case -1: variant = "leftEdge"; break;
                case 1: variant = "rightEdge"; break;
                case 2: variant = "farRight"; break;
                default:
                    if (diff < -1) {
                        variant = "exitLeft";
                    } else {
                        variant = "hiddenFarRight";
                    }
                    break;
            }

            return (
              <motion.div
                key={idx}
                className={styles.imageContainer}
                variants={imageVariants}
                initial="hiddenFarRight"
                animate={variant}
                transition={imageTransition}
                onClick={() => {
                  if (variant === "leftEdge" || variant === "rightEdge" || variant === "farRight") {
                    navigateTo(idx);
                  }
                }}
              >
                <img src={item.img} alt={item.title} className={styles.panelImg} />
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