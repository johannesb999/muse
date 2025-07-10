import styles from "./Cards.module.scss";
import Card from "./Card";
import Cta from "./Cta";
import { motion } from "motion/react";

export default function Cards({ cards, order, active, setActive }) {
  return (
    <main className={styles.grid}>
      <Card
        title={cards[order[0]].title}
        content={cards[order[0]].content}
        isActive={active === 0}
        onClick={() => setActive(0)}
        className={`card--${order[0]}`}
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
          onClick={() => setActive(1)}
          className={`card--${order[1]}`}
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
          onClick={() => setActive(2)}
          className={`card--${order[2]}`}
        >
          {active === 2 && (
            <Cta>
              Mehr erfahren <span aria-hidden="true">→</span>
            </Cta>
          )}
        </Card>
      </div>
    </main>
  );
}
