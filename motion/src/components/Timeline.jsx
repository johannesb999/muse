import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import styles from "./scss/Timeline.module.scss";
import AnimatedWaves from "./AnimatedWaves"; // bleibt importiert

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
  // validate items before any hooks
  const validItems = useMemo(
    () => (Array.isArray(items) ? items.filter(Boolean) : []),
    [items]
  );
  const itemCount = validItems.length;

  /* Geometric calculations */
  const AMP = height * 0.17;
  const TRACK_GAP = height * 0.04;
  const baseY_A = height / 2 - TRACK_GAP;
  const baseY_B = height / 2 + TRACK_GAP;

  const truncateTitle = useCallback((title) => {
    if (!title) return "";
    if (title.length <= 30) return title;
    const words = title.split(" ");
    const lines = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= 30) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word.length <= 30 ? word : word.substring(0, 30);
        } else {
          lines.push(word.substring(0, 30));
        }
        if (lines.length >= 2) break;
      }
    }
    if (currentLine && lines.length < 2) lines.push(currentLine);
    return lines.length > 1 ? lines.join("\n") : lines[0] || "";
  }, []);

  const calculateLabelWidth = useCallback(
    (title, year) => {
      if (!title || !year) return 200;
      const truncatedTitle = truncateTitle(title);
      const lines = truncatedTitle.split("\n");
      const estimateLineWidth = (line) => {
        let width = 0;
        for (const char of line) {
          if (char === " ") width += 5;
          else if (char >= "A" && char <= "Z") width += 14;
          else if (char >= "a" && char <= "z") width += 10;
          else width += 12;
        }
        return width;
      };
      const maxLineWidth = Math.max(...lines.map(estimateLineWidth));
      const yearWidth = year.toString().length * 14;
      const estimatedWidth = Math.max(maxLineWidth, yearWidth) + 40;
      return Math.max(150, Math.min(estimatedWidth, 450));
    },
    [truncateTitle]
  );

  const MIN_SPACING_PX = 150;
  const CURVE_TILT = 0.7;
  const SWAY_MAX = 5;
  const FADE_START = 300;
  const FADE_END = -60;

  const vpRef = useRef(null);
  const [vpW, setVpW] = useState(window.innerWidth);
  useEffect(() => {
    const update = () =>
      setVpW(vpRef.current?.clientWidth || window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const LEFT_MARGIN = vpW * 0.25;
  const RIGHT_MARGIN = vpW * 0.25;

  const { baseX, totalW } = useMemo(() => {
    if (itemCount === 0) return { baseX: [], totalW: 1 };
    const positions = [LEFT_MARGIN];
    for (let i = 1; i < itemCount; i++) {
      const prevItem = validItems[i - 1];
      const prevLabelWidth = calculateLabelWidth(prevItem.title, prevItem.year);
      const prevX = positions[i - 1];
      const nextX = prevX + prevLabelWidth + MIN_SPACING_PX;
      positions.push(nextX);
    }
    const totalWidth = Math.max(
      1,
      positions[positions.length - 1] + RIGHT_MARGIN
    );
    const maxTotalWidth = 50000;
    const safeTotalWidth = Math.min(totalWidth, maxTotalWidth);
    return { baseX: positions, totalW: safeTotalWidth };
  }, [
    validItems,
    LEFT_MARGIN,
    RIGHT_MARGIN,
    calculateLabelWidth,
    MIN_SPACING_PX,
    itemCount,
  ]);

  // Berechnet Frequenz, SVG-Pfade und Lookup-Tabellen
  const { pathA, pathB, k, lookupA, lookupB } = useMemo(() => {
    let validTotalW = Math.max(1, totalW || 1);
    if (!Number.isFinite(validTotalW) || validTotalW < 0) {
      validTotalW = 1000;
    }
    const freq = (4.5 * Math.PI) / validTotalW;
    const build = (baseY, phase = 0) => {
      let d = "";
      let arraySize = Math.max(1, Math.floor(validTotalW) + 1);
      if (arraySize > 100000) arraySize = 10000;
      const lu = new Array(arraySize);
      for (let x = 0; x <= Math.min(validTotalW, arraySize - 1); x++) {
        const y = baseY + AMP * Math.sin(freq * x + phase);
        lu[x] = y;
        d += x ? ` L${x},${y}` : `M${x},${y}`;
      }
      return { d, lu };
    };
    const a = build(baseY_A, 0);
    const b = build(baseY_B, Math.PI);
    return {
      pathA: a.d,
      pathB: b.d,
      k: freq,
      lookupA: a.lu,
      lookupB: b.lu,
    };
  }, [totalW, AMP, baseY_A, baseY_B]);

  const [offsetX, setOffsetX] = useState(totalW);
  const [isSnapping, setIsSnapping] = useState(true);
  const [swayPhase, setSwayPhase] = useState(0);
  const [snapProg, setSnapProg] = useState(0);
  const rafSnap = useRef(null);
  const rafSway = useRef(null);
  const easeOut = (t) => 1 - (1 - t) ** 3;

  useEffect(() => {
    const start = performance.now();
    const from = offsetX;
    const targetX = LEFT_MARGIN - baseX[activeIndex];
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
  }, [activeIndex, baseX, LEFT_MARGIN]);

  useEffect(() => {
    if (!isSnapping) return;
    const loop = () => {
      setSwayPhase((p) => p + 0.018);
      rafSway.current = requestAnimationFrame(loop);
    };
    rafSway.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafSway.current);
  }, [isSnapping]);

  const swayX = isSnapping
    ? Math.sin(swayPhase) * SWAY_MAX * (1 - snapProg)
    : 0;

  const getY = useCallback(
    (x, track) => {
      const relX = x + offsetX * (1 - CURVE_TILT);
      const idx = Math.max(0, Math.min(totalW, Math.round(relX)));
      return track === "A" ? lookupA[idx] : lookupB[idx];
    },
    [offsetX, lookupA, lookupB, totalW]
  );

  if (itemCount === 0) {
    return (
      <div className={styles.timeline} style={{ height }}>
        <div className={styles.timelineFallback}>
          No timeline data available.
        </div>
      </div>
    );
  }

  const ANCHOR_START = vpW * 0.2;
  const ANCHOR_END = vpW * 0.3;
  const ANCHOR_MID = vpW * 0.25;
  const MID_TOL = 2;

  const dragPx = dragOffset * vpW;
  const pointsT = `translateX(${offsetX + dragPx + swayX}px)`;
  const curveT = `translateX(${offsetX * CURVE_TILT + dragPx + swayX}px)`;

  const lastPointX = validItems.length > 0 ? baseX[validItems.length - 1] : 0;
  const fadeStartX = lastPointX + 100;

  return (
    <div className={styles.timeline} ref={vpRef} style={{ height }}>
      {/* Container für die animierten Wellen (im Hintergrund) */}
      <div className={styles.wavesContainer} style={{ transform: curveT }}>
        <AnimatedWaves
          width={totalW}
          height={height}
          baseY_A={baseY_A}
          baseY_B={baseY_B}
          amplitude={AMP}
          frequency={k}
          colors={curveColors}
        />
      </div>

      {/* SVG Container für die statischen Linien und den Gradienten */}
      <svg
        className={styles.timelineSvg}
        style={{ width: totalW, pointerEvents: "none" }}
        viewBox={`0 0 ${totalW} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="fadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--bg)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--bg)" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Die ursprünglichen SVG-Pfade werden hier wieder gerendert */}
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

        {fadeStartX < totalW && (
          <rect
            x={fadeStartX}
            y="0"
            width={totalW - fadeStartX}
            height={height}
            fill="url(#fadeGradient)"
            style={{ transform: curveT }}
          />
        )}
      </svg>

      {/* Points + Labels (im Vordergrund) */}
      <div
        className={styles.pointsWrapper}
        style={{ width: totalW, transform: pointsT }}
      >
        {validItems.map((it, i) => {
          const track = it.track ?? (it.type === "history" ? "A" : "B");
          const x = baseX[i];
          const y = getY(x, track);
          const screenX = x + offsetX + dragPx + swayX;
          const inAnchor = screenX >= ANCHOR_START && screenX <= ANCHOR_END;
          const atMid = Math.abs(screenX - ANCHOR_MID) <= MID_TOL;
          const active = i === activeIndex && atMid;
          let opacity = 1;
          if (screenX < FADE_START) {
            opacity =
              screenX <= FADE_END
                ? 0
                : (screenX - FADE_END) / (FADE_START - FADE_END);
          }
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
          const handleClick = () => {
            if (i !== activeIndex) onSelect(i);
          };
          const truncatedTitle = truncateTitle(it.title);
          const labelWidth = calculateLabelWidth(it.title, it.year);
          return (
            <div
              key={i}
              style={{ position: "absolute", left: `${x}px`, top: 0, opacity }}
            >
              <div
                role="button"
                tabIndex={0}
                aria-label={`Milestone ${it.year}`}
                onClick={handleClick}
                className={pCls}
                style={{ top: `${y}px` }}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={handleClick}
                className={lblCls}
                style={{
                  top: `${y}px`,
                  left: "16px",
                  transform: "translateY(-50%)",
                  whiteSpace: "pre-line",
                  cursor: "pointer",
                  width: `${labelWidth}px`,
                }}
              >
                <div className={styles.labelTitle}>{truncatedTitle}</div>
                <div className={styles.labelYear}>{it.year}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset Button */}
      {(() => {
        const lastIndex = validItems.length - 1;
        if (lastIndex < 0) return null;
        const lastX = baseX[lastIndex];
        const lastScreenX = lastX + offsetX + dragPx + swayX;
        const lastPointInAnchor =
          lastScreenX >= ANCHOR_START && lastScreenX <= ANCHOR_END;
        if (!lastPointInAnchor) return null;
        return (
          <div
            className={styles.resetButtonContainer}
            style={{
              position: "absolute",
              right: "70px",
              top: `${height / 2}px`,
              transform: "translateY(-50%)",
              opacity: 1,
              zIndex: 1001,
            }}
          >
            <div className={styles.resetLabel} onClick={() => onSelect(0)}>
              Zurück zum Anfang
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-label="Zurück zum Anfang"
              onClick={() => onSelect(0)}
              className={styles.resetButton}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className={styles.resetIcon}
              >
                <path
                  d="M16 12L8 7v10l8-5z"
                  fill="currentColor"
                  transform="rotate(180 12 12)"
                />
              </svg>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
