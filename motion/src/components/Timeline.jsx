import React, { useMemo } from 'react';
import styles from './scss/Timeline.module.scss';

export default function Timeline({ items, activeIndex, onSelect, dragOffset = 0 }) {
  const anchorPercent = 20;
  const step = 80 / (items.length - 1);

  // 1) Wie weit die Punkte verschieben (in %)
  const wrapperOffset = useMemo(() => {
    const target = 10 + activeIndex * step;
    return anchorPercent - target + dragOffset * 100;
  }, [activeIndex, dragOffset, step]);

  // 2) Wellen-Effekt: Amp und Frequenz justieren
  const waveAmp = 20;      // maximale Auslenkung in px
  const waveFreq = 0.05;   // je größer, desto häufigere Wellen
  const wave = Math.sin(wrapperOffset * waveFreq * Math.PI) * waveAmp;

  // 3) Dynamische Pfad-Berechnung
  const getCurveA = () => {
    // Basis-Y-Punkte für Kurve A
    const y0 = 75;
    const y1 = 120 + wave;
    const y2 = 30 - wave;
    // S-Segment nutzt hier dieselben Ys
    return `M0,${y0}
            C200,${y1} 300,${y2} 500,${y0}
            S800,${y1} 1000,${y0}`;
  };

  const getCurveB = () => {
    const y0 = 100;
    const y1 = 50 - wave * 0.5;
    const y2 = 140 + wave * 0.5;
    return `M0,${y0}
            C200,${y1} 300,${y2} 500,${y0}
            S800,${y1} 1000,${y0}`;
  };

  return (
    <div className={styles.timeline}>
      <svg
        className={styles.timelineSvg}
        viewBox="0 0 1000 150"
        preserveAspectRatio="none"
      >
        {/* beide dynamically erzeugten Pfade */}
        <path
          className={styles.timelineCurve}
          d={getCurveA()}
          transform={`translate(${wrapperOffset}%, 0)`}
        />
        <path
          className={styles.timelineCurve}
          d={getCurveB()}
          transform={`translate(${wrapperOffset}%, 0)`}
        />
      </svg>

      {/* Punkte und Labels mitscrollen */}
      <div
        className={styles.pointsWrapper}
        style={{ transform: `translateX(${wrapperOffset}%)` }}
      >
        {items.map((item, idx) => {
          const left = 10 + idx * step;
          // t‐Param nur zur vertikalen Berechnung der Punkte
          // wir basieren uns direkt auf denselben Wellen-Funktionen:
          const y =
            item.type === 'history'
              ? 75 + Math.sin(left * waveFreq * Math.PI) * waveAmp
              : 100 + Math.sin(left * waveFreq * Math.PI + Math.PI) * waveAmp * 0.5;

          const isActive = idx === activeIndex;
          const visX = left + wrapperOffset;
          const opacity = visX < -5 || visX > 105 ? 0 : 1;

          return (
            <React.Fragment key={idx}>
              <div
                className={`${styles.timelinePoint} ${
                  isActive ? styles.active : ''
                }`}
                style={{
                  left: `${left}%`,
                  top: `${y}px`,
                  opacity
                }}
                onClick={() => onSelect(idx)}
              />
              <div
                className={styles.timelineLabel}
                style={{
                  left: `${left}%`,
                  top: `${y + 15}px`,
                  opacity
                }}
                dangerouslySetInnerHTML={{ __html: `${item.title}<br/>${item.year}` }}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
