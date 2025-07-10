// src/App.jsx
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import "./App.css";

const cards = {
  expertise: {
    title: "Expertise",
    content:
      "SGP Schneider Geiwitz unterstützt seit mehr als 40 Jahren Unternehmen mit einem ganzheitlichen Ansatz. Maßgeschneiderte Lösungen durch Interdisziplinarität sind unsere Stärke.",
  },
  campus: {
    title: "Campus",
    content:
      "Entdecke unseren Campus: moderne Räume, Netzwerkevents und Austausch auf höchstem Niveau.",
  },
  history: {
    title: "Unternehmensgeschichte",
    content:
      "Von den Anfängen bis heute – erfahre mehr über die Meilensteine unserer 40-jährigen Firmengeschichte.",
  },
};

export default function App() {
  const order = ["expertise", "campus", "history"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % order.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const renderCard = (key, idx) => {
    const isActive = idx === active;
    return (
      <motion.section
        key={key}
        className={`card card--${key}`}
        onClick={() => setActive(idx)}
        initial={false}
        animate={{ scale: isActive ? 1.02 : 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 style={{ color: isActive ? "var(--accent)" : "var(--text-light)" }}>
          {cards[key].title}
        </h2>

        {/* Inhalt Aktive Karte */}
        {isActive && (
          <>
            <p>{cards[key].content}</p>
            <motion.a
              href="#"
              className="cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Mehr erfahren <span aria-hidden="true">→</span>
            </motion.a>
          </>
        )}
      </motion.section>
    );
  };

  return (
    <div className="page">
      <header className="header">
        <div className="logo">
          SGP <span className="logo-sub">Schneider Geiwitz</span>
        </div>
      </header>

      <main className="grid">
        {renderCard("expertise", 0)}

        <div className="column-right">
          {renderCard("campus", 1)}
          {renderCard("history", 2)}
        </div>
      </main>
    </div>
  );
}
