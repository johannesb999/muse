// src/components/Timeline.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from 'react';
import styles from './scss/Timeline.module.scss';

export default function Timeline({
  items,
  activeIndex,
  onSelect,
  dragOffset = 0          // normalisiert (‑1 … 1) aus History.jsx
}) {
  /* --------------------------------------------------------------------- *
   *   Grundparameter                                                      *
   * --------------------------------------------------------------------- */
  const viewW   = 1000;
  const viewH   = 150;
  const baseY_A = 75;         // oberes Gleis (type === 'history')
  const baseY_B = 100;        // unteres Gleis (alle anderen Typen)
  const ampl    = 50;
  const k       = (2.5 * Math.PI) / viewW;          // volle Welle auf 1000 px
  const curveTilt = 0.4;                          // Kurven kippen 20 % mit

  /* --------------------------------------------------------------------- *
   *   feste Kurven + Lookup‑Tabellen                                      *
   * --------------------------------------------------------------------- */
  const { pathA, pathB, lookupA, lookupB } = useMemo(() => {
    const build = (baseY, phaseShift = 0) => {
      let d = '';
      const lu = new Array(viewW + 1);
      for (let x = 0; x <= viewW; x++) {
        const y = baseY + ampl * Math.sin(k * x + phaseShift);
        lu[x] = y;
        d += x === 0 ? `M${x},${y}` : ` L${x},${y}`;
      }
      return { d, lu };
    };
    const a = build(baseY_A, 0);
    const b = build(baseY_B, Math.PI);
    return { pathA: a.d, pathB: b.d, lookupA: a.lu, lookupB: b.lu };
  }, [viewW, baseY_A, baseY_B, ampl, k]);

  /* --------------------------------------------------------------------- *
   *   Punkt‑Grundverteilung (10 %–90 %)                                   *
   * --------------------------------------------------------------------- */
  const stepPct = items.length > 1 ? 80 / (items.length - 1) : 0;

  /* --------------------------------------------------------------------- *
   *   States für Snap‑ und Sway‑Animation                                 *
   * --------------------------------------------------------------------- */
  const [offsetPct,  setOffsetPct ] = useState(0);   // horizontale Verschiebung
  const [isSnapping, setIsSnapping] = useState(false);
  const [swayPhase,  setSwayPhase ] = useState(0);   // 0 … 2π
  const rafSnap = useRef(null);
  const rafSway = useRef(null);

  /* ---------- EaseInOutQuad -------------------------------------------- */
  const ease = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

  /* --------------------------------------------------------------------- *
   *   Snap‑Animation                                                      *
   * --------------------------------------------------------------------- */
  useEffect(() => {
    const start   = performance.now();
    const fromOff = offsetPct;
    const target  = 25 - (10 + activeIndex * stepPct); // 25 % == Anchor‑Mitte

    setIsSnapping(true);           // Sway darf laufen

    const step = now => {
      const p = Math.min((now - start) / 2000, 1);        // 2 s
      setOffsetPct(fromOff + (target - fromOff) * ease(p));

      if (p < 1) {
        rafSnap.current = requestAnimationFrame(step);
      } else {
        setIsSnapping(false);      // Snap fertig → Sway stoppen
        setSwayPhase(0);           // Phase zurücksetzen für nächste Animation
      }
    };

    cancelAnimationFrame(rafSnap.current);
    rafSnap.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafSnap.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, stepPct]);      // NICHT offsetPct hier eintragen!

  /* --------------------------------------------------------------------- *
   *   Sway‑Loop (läuft nur während Snap)                                  *
   * --------------------------------------------------------------------- */
  useEffect(() => {
    if (!isSnapping) return;       // nichts zu tun, wenn statisch

    const loop = () => {
      setSwayPhase(p => p + 0.015);                   // ~2 s für volle Sinus‑Periode
      rafSway.current = requestAnimationFrame(loop);
    };
    rafSway.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafSway.current);
  }, [isSnapping]);

  /* --------------------------------------------------------------------- *
   *   Hilfs‑Funktion: exakter Y‑Wert eines Punkts                         *
   * --------------------------------------------------------------------- */
  const getY = useCallback(
    (basePct, type) => {
      const relPct = basePct + offsetPct * (1 - curveTilt); // reale X‑Position
      const clampedPct = Math.max(0, Math.min(100, relPct));
      const x = Math.round((clampedPct / 100) * viewW);
      return type === 'history' ? lookupA[x] : lookupB[x];
    },
    [offsetPct, lookupA, lookupB, curveTilt, viewW]
  );

  /* --------------------------------------------------------------------- *
   *   Anchor‑Definition                                                   *
   * --------------------------------------------------------------------- */
  const ANCHOR_START = 20;
  const ANCHOR_END   = 30;
  const ANCHOR_MID   = 25;
  const MID_TOL      = 0.1;      // ±0.1 % exakt genug

  /* --------------------------------------------------------------------- *
   *   Versatz für Kurven & Punkte                                         *
   * --------------------------------------------------------------------- */
  const dragPct = dragOffset * 100;                   // ‑1 … 1 → ‑100 … 100
  const swayPct = isSnapping ? Math.sin(swayPhase) * 1 : 0; // ±1 % nur während Snap

  const pointsX = offsetPct + dragPct + swayPct;                  // Punkte 100 %
  const curveX  = offsetPct * curveTilt + dragPct + swayPct;      // Kurven 20 %

  const pointsStyle = { transform: `translateX(${pointsX}%)` };
  const curveStyle  = { transform: `translateX(${curveX}%)`   };

  /* --------------------------------------------------------------------- *
   *   Render                                                              *
   * --------------------------------------------------------------------- */
  return (
    <div className={styles.timeline}>
      {/* ------------------------ Kurven ------------------------------- */}
      <svg
        className={styles.timelineSvg}
        viewBox={`0 0 ${viewW} ${viewH}`}
        preserveAspectRatio="none"
      >
        <g style={curveStyle}>
          <path d={pathA} className={styles.timelineCurve} />
          <path d={pathB} className={styles.timelineCurve} />
        </g>
      </svg>

      {/* ------------------------ Punkte ------------------------------- */}
      <div className={styles.pointsWrapper} style={pointsStyle}>
        {items.map((it, i) => {
          const basePct = 10 + i * stepPct;
          const y       = getY(basePct, it.type);

          /* Anchor‑Status berechnen */
          const relX     = basePct + offsetPct;
          const inAnchor = relX >= ANCHOR_START && relX <= ANCHOR_END;
          const atMid    = Math.abs(relX - ANCHOR_MID) <= MID_TOL;
          const active   = i === activeIndex && atMid;

          /* Klassen zusammensetzen */
          const pointCls = [
            styles.timelinePoint,
            it.type === 'history' ? styles.trackHistory : styles.trackCase,
            inAnchor && styles.inAnchor,
            active   && styles.active
          ].filter(Boolean).join(' ');

          const labelCls = [
            styles.timelineLabel,
            inAnchor && styles.inAnchor,
            active   && styles.active
          ].filter(Boolean).join(' ');

          return (
            <div key={i} style={{ position: 'absolute', left: `${basePct}%`, top: 0 }}>
              {/* --- Punkt ------------------------------------------------- */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => i !== activeIndex && onSelect(i)}
                className={pointCls}
                style={{ top: `${y}px` }}
              />
              {/* --- Label ------------------------------------------------ */}
              <div className={labelCls} style={{ top: `${y + 15}px` }}>
                <span>{it.title}</span><br />
                <small>{it.year}</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
