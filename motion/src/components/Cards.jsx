import styles from "./scss/Cards.module.scss";
import Card from "./Card";
import Cta from "./Cta";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Cards({ cards, order, active, setActive }) {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const handleCardClick = (idx) => {
    setActive(idx);
    setLeaving(true);
    setTimeout(() => {
      navigate(`/${order[idx]}`);
    }, 1200); // Dauer der Animation
  };

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.main
          className={styles.grid}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card
            title={cards[order[0]].title}
            content={cards[order[0]].content}
            isActive={active === 0}
            onClick={() => handleCardClick(0)}
            modifier={"expertise"}
            active={active === 0}
          >
            {active === 0 && (
              <Cta>
                Mehr erfahren <span aria-hidden="true">→</span>
              </Cta>
            )}
          </Card>
          <div className={styles["column-right"]}>
            <Card
              title={cards[order[1]].title}
              content={cards[order[1]].content}
              isActive={active === 1}
              onClick={() => handleCardClick(1)}
              modifier={"campus"}
              active={active === 1}
            >
              {active === 1 && (
                <Cta>
                  Mehr erfahren <span aria-hidden="true">→</span>
                </Cta>
              )}
            </Card>
            <Card
              title={cards[order[2]].title}
              content={cards[order[2]].content}
              isActive={active === 2}
              onClick={() => handleCardClick(2)}
              modifier={"history"}
              active={active === 2}
            >
              {active === 2 && (
                <Cta>
                  Mehr erfahren <span aria-hidden="true">→</span>
                </Cta>
              )}
            </Card>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
