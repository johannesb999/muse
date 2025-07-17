import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import styles from "./scss/Timeline.module.scss";

export default function Timeline({
  items,
  activeIndex,
  onSelect,
  dragOffset = 0,
  height = 0,
  curveColors = {
    A: "#303233",
    B: "#484B4D",
  },
}) {
  // Robustness: Validate items
  const validItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const itemCount = validItems.length;
  // If no valid items, render fallback
  if (itemCount === 0) {
    return (
      <div className={styles.timeline} style={{ height }}>
        <div className={styles.timelineFallback}>
          Keine Timeline-Daten verfügbar.
        </div>
      </div>
    );
  }

  /* ───────────────────────── Geometrische Ableitungen ────────────────── */
  const AMP = height * 0.17; // ≈ 26 % der Gesamt‑Höhe
  const TRACK_GAP = height * 0.04; // vertikaler Abstand der beiden Gleise
  const baseY_A = height / 2 - TRACK_GAP;
  const baseY_B = height / 2 + TRACK_GAP;

  const SPACING_PX = 390; // Abstand Punkt ↔ Punkt
  const CURVE_TILT = 0.7; // Kurve kippt 20 % der Punktbewegung mit
  const SWAY_MAX = 5; // maximale Sway‑Amplitude (px)
  const FADE_START = 300; // 40 px vor VP‑Rand beginnt Fade‑Out
  const FADE_END = -60; // 60 px ausserhalb ist 0 Opacity

  /* ───────────────────────── Viewport‑Breite ermitteln ────────────────── */
  const vpRef = useRef(null);
  const [vpW, setVpW] = useState(window.innerWidth);
  useEffect(() => {
    const update = () =>
      setVpW(vpRef.current?.clientWidth || window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Clamp totalW to at least 1
  const LEFT_MARGIN = vpW * 0.25;
  const RIGHT_MARGIN = vpW * 0.25;
  const rawTotalW = LEFT_MARGIN + RIGHT_MARGIN + (itemCount - 1) * 300;
  const totalW = Math.max(1, rawTotalW);

  const { pathA, pathB, lookupA, lookupB } = useMemo(() => {
    const k = (4.5 * Math.PI) / totalW;
    const build = (baseY, phase = 0) => {
      let d = "";
      const lu = new Array(Math.max(1, totalW + 1));
      for (let x = 0; x <= totalW; x++) {
        const y = baseY + AMP * Math.sin(k * x + phase);
        lu[x] = y;
        d += x ? ` L${x},${y}` : `M${x},${y}`;
      }
      return { d, lu };
    };
    const a = build(baseY_A, 0);
    const b = build(baseY_B, Math.PI);
    return { pathA: a.d, pathB: b.d, lookupA: a.lu, lookupB: b.lu };
  }, [totalW, AMP, baseY_A, baseY_B]);

  /* ───────────────────────── X‑Grundkoordinaten aller Punkte ─────────── */
  const baseX = useMemo(
    () => validItems.map((_, i) => LEFT_MARGIN + i * 300),
    [itemCount, LEFT_MARGIN]
  );

  /* ───────────────────────── Animations‑State ─────────────────────────── */
  const [offsetX, setOffsetX] = useState(totalW); // Intro: ganz rechts
  const [isSnapping, setIsSnapping] = useState(true);
  const [swayPhase, setSwayPhase] = useState(0);
  const [snapProg, setSnapProg] = useState(0); // 0 … 1
  const rafSnap = useRef(null);
  const rafSway = useRef(null);
  const easeOut = (t) => 1 - (1 - t) ** 3;

  /* Snap‑/Intro‑Animation */
  useEffect(() => {
    const start = performance.now();
    const from = offsetX;
    const targetX = LEFT_MARGIN - baseX[activeIndex]; // Punkt zur Anker‑Mitte

    setIsSnapping(true);

    const step = (now) => {
      const p = Math.min((now - start) / 2000, 1);
      setSnapProg(p);
      setOffsetX(from + (targetX - from) * easeOut(p));
      if (p < 1) {
        rafSnap.current = requestAnimationFrame(step);
      } else {
        setIsSnapping(false);
        setSwayPhase(0);
        setSnapProg(0);
      }
    };
    cancelAnimationFrame(rafSnap.current);
    rafSnap.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafSnap.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, baseX, LEFT_MARGIN]);

  /* Sway (nur während Snap) */
  useEffect(() => {
    if (!isSnapping) return;
    const loop = () => {
      setSwayPhase((p) => p + 0.018); // ~1,75 s pro Sinus
      rafSway.current = requestAnimationFrame(loop);
    };
    rafSway.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafSway.current);
  }, [isSnapping]);

  const swayX = isSnapping
    ? Math.sin(swayPhase) * SWAY_MAX * (1 - snapProg)
    : 0;

  /* Y‑Lookup */
  const getY = useCallback(
    (x, track) => {
      const relX = x + offsetX * (1 - CURVE_TILT);
      const idx = Math.max(0, Math.min(totalW, Math.round(relX)));
      return track === "A" ? lookupA[idx] : lookupB[idx];
    },
    [offsetX, lookupA, lookupB, totalW]
  );

  /* Anchor‑Bereich (Pixel) */
  const ANCHOR_START = vpW * 0.2;
  const ANCHOR_END = vpW * 0.3;
  const ANCHOR_MID = vpW * 0.25;
  const MID_TOL = 2;

  /* Wrapper‑Transforms */
  const dragPx = dragOffset * vpW;
  const pointsT = `translateX(${offsetX + dragPx + swayX}px)`;
  const curveT = `translateX(${offsetX * CURVE_TILT + dragPx + swayX}px)`;

  /* ───────────────────────── JSX‑Render ──────────────────────────────── */
  return (
    <div className={styles.timeline} ref={vpRef} style={{ height }}>
      {/* SVG‑Kurven */}
      <svg
        className={styles.timelineSvg}
        style={{ width: totalW }}
        viewBox={`0 0 ${totalW} ${height}`}
        preserveAspectRatio="none"
      >
        <g style={{ transform: curveT }}>
          <path
            d={pathA}
            stroke={curveColors.A}
            className={styles.timelineCurve}
          />
          <path
            d={pathB}
            stroke={curveColors.B}
            className={styles.timelineCurve}
          />
        </g>
      </svg>

      {/* Punkte + Labels */}
      <div
        className={styles.pointsWrapper}
        style={{ width: totalW, transform: pointsT }}
      >
        {validItems.map((it, i) => {
          /* Track‑Wahl: item.track explizit > typbasiertes Fallback */
          const track = it.track ?? (it.type === "history" ? "A" : "B");

          const x = baseX[i];
          const y = getY(x, track);

          const screenX = x + offsetX + dragPx + swayX;
          const inAnchor = screenX >= ANCHOR_START && screenX <= ANCHOR_END;
          const atMid = Math.abs(screenX - ANCHOR_MID) <= MID_TOL;
          const active = i === activeIndex && atMid;

          /* Fade‑Out links */
          let opacity = 1;
          if (screenX < FADE_START) {
            opacity =
              screenX <= FADE_END
                ? 0
                : (screenX - FADE_END) / (FADE_START - FADE_END);
          }

          /* Klassen zusammensetzen */
          const pCls = [
            styles.timelinePoint,
            track === "A" ? styles.trackHistory : styles.trackCase,
            inAnchor && styles.inAnchor,
            active && styles.active,
          ]
            .filter(Boolean)
            .join(" ");

          const lblCls = [
            styles.timelineLabel,
            inAnchor && styles.inAnchor,
            active && styles.active,
          ]
            .filter(Boolean)
            .join(" ");

          /* Gemeinsamer Click‑Handler für Punkt + Label */
          const handleClick = () => {
            if (i !== activeIndex) onSelect(i);
          };

          return (
            <div
              key={i}
              style={{ position: "absolute", left: `${x}px`, top: 0, opacity }}
            >
              {/* Punkt */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`Meilenstein ${it.year}`}
                onClick={handleClick}
                className={pCls}
                style={{ top: `${y}px` }}
              />
              {/* Label – jetzt ebenfalls interaktiv */}
              <div
                role="button"
                tabIndex={0}
                onClick={handleClick}
                className={lblCls}
                style={{
                  top: `${y}px`,
                  left: "16px",
                  transform: "translateY(-50%)",
                  whiteSpace: "pre-line", // \n im Title zulassen
                  cursor: "pointer",
                }}
              >
                <span className={styles.labelTitle}>{it.title}</span>
                <br />
                <small className={styles.labelYear}>{it.year}</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
