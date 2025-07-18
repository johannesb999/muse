import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Cards from "./components/Cards";
import cards from "./data/cards";
import Expertise from "./pages/Expertise";
import Campus from "./pages/Campus";
import History from "./pages/History";
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
        {/* <img src="/assets/sgpLogo.png" alt="SGP Schneider Geiwitz Logo" className="logo" /> */}
      </header>
      <Routes>
        <Route
          path="/"
          element={
            <Cards
              cards={cards}
              order={order}
              active={active}
              setActive={setActive}
            />
          }
        />
        <Route path="/expertise" element={<Expertise />} />
        <Route path="/campus" element={<Campus />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </div>
  );
}
