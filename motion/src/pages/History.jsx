import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Timeline from "../components/Timeline";
import styles from "../components/scss/History.module.scss";

const timelineItems = [
  {
    year: "1972",
    title: "Gründung des Unternehmens in Neu-Ulm",
    text: `Die Wirtschaftskanzlei SGP Schneider Geiwitz wurde 1972 in Neu-Ulm gegründet 
    und bot von Beginn an Wirtschaftsprüfung, Steuer- und Rechtsberatung, Corporate Finance, 
    Nachlassverwaltung, Restrukturierung und Insolvenzverwaltung an.`,
    img: "/assets/historie-1972.png",
    //track: "A",
    type: "history",
  },
  {
    year: "1995",
    title: "Eintritt von Arndt Geiwitz",
    text: `Der Eintritt von Arndt Geiwitz prägte die zukünftige Ausrichtung und Reputation von SGP 
    maßgeblich. Seine Mandate wurden öffentlichkeitswirksam und hoben die Expertise der Kanzlei hervor.`,
    img: "/assets/historie-1995.png",
    //track: "B",
    type: "history",
  },
  {
    year: "2000",
    title: "Insolvenzverwaltung",
    text: `Ab 2000 erfolgte der Ausbau der Insolvenzverwaltung mit mehreren Großmandaten in der Region.`,
    img: "/assets/historie-2012.png",
    //track: "A",
    type: "case",
  },
  {
    year: "2024",
    title: "Der neue SGP Campus \n in Neu-Ulm",
    text: `2024 wurde der moderne SGP Campus eröffnet – ein Zent<rum für Beratung, Forschung und Lehre.`,
    img: "/assets/historie-2024.png",
    //track: "B",
    type: "history",
  },
  {
    year: "2025",
    title: " neue SGP Campus in Neu-Ulm",
    text: `2024 wurde der moderne SGP Campus eröffnet – ein Zentrum für Beratung, Forschung und Lehre.`,
    img: "/assets/historie-2024.png",
    //track: "A",
    type: "case",
  },
  {
    year: "2026",
    title: "Der  SGP Campus in Neu-Ulm",
    text: `2024 wurde der moderne SGP Campus eröffnet – ein Zentrum für Beratung, Forschung und Lehre.`,
    img: "/assets/historie-2024.png",
    //track: "B",
    type: "history",
  },
];

export default function History() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const wrapperRef = useRef(null);
  const startX = useRef(0);
  const dragging = useRef(false);

  useEffect(() => {
    setDragOffset(0);
  }, [activeIndex]);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  };
  const onTouchMove = (e) => {
    if (!dragging.current) return;
    setDragOffset(e.touches[0].clientX - startX.current);
  };
  const onTouchEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const width = wrapperRef.current.clientWidth;
    const threshold = width * 0.3;
    if (dragOffset < -threshold && activeIndex < timelineItems.length - 1) {
      setActiveIndex((i) => i + 1);
    } else if (dragOffset > threshold && activeIndex > 0) {
      setActiveIndex((i) => i - 1);
    } else {
      setDragOffset(0);
    }
  };

  return (
    <div className={styles.historyContainer}>
      {/* HEADER */}
      <div className={styles.historyHeader}></div>

      {/* PANELS */}
      <div
        className={styles.contentWrapper}
        ref={wrapperRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <motion.div
          className={styles.panels}
          animate={{
            x: `calc(-${activeIndex * 100}% + ${dragOffset}px)`,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {timelineItems.map((item, idx) => (
            <div className={styles.panel} key={idx}>
              <div className={styles.left}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={styles.year}
                >
                  {item.year}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className={styles.title}
                >
                  {item.title}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className={styles.text}
                >
                  {item.text}
                </motion.p>
              </div>
              <motion.div
                className={styles.right}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 80 }}
              >
                <img src={item.img} alt={item.title} />
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* TIMELINE */}
      <Timeline
        items={timelineItems}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        dragOffset={dragOffset / (wrapperRef.current?.clientWidth || 1)}
      />
    </div>
  );
}
