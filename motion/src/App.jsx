// src/App.jsx
import { useState, useEffect } from "react";
import Cards from "./components/Cards";
import cards from "./data/cards";
import "./global.scss";

export default function App() {
  const order = ["expertise", "campus", "history"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % order.length);
    }, 5000);
    return () => clearInterval(id);
  }, [order.length]);

  return (
    <div className="page">
      <header className="header">
        <div className="logo">
          SGP <span className="logo-sub">Schneider Geiwitz</span>
        </div>
      </header>
      <Cards cards={cards} order={order} active={active} setActive={setActive} />
    </div>
  );
}
