// src/components/Timeline.jsx
import React, { useRef, useState, useEffect } from 'react'
import styles from './scss/Timeline.module.scss'

export default function Timeline({ items, onSelect }) {
  const anchorPct = 20                      // Anker bei 20 %
  const step = 80 / (items.length - 1)      // Prozentabstand zwischen Punkten
  const [offset, setOffset] = useState(0)   // globaler Offset in %
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)
  const startX = useRef(0)
  const startOffset = useRef(0)
  const [dragging, setDragging] = useState(false)

  // Zentriert Punkt 0 initial im Anker
  useEffect(() => {
    setOffset(anchorPct - (10 + 0 * step))
    setActiveIndex(0)
  }, [])

  // Pointer-Events fürs Draggen
  const onPointerDown = e => {
    containerRef.current.setPointerCapture(e.pointerId)
    startX.current = e.clientX
    startOffset.current = offset
    setDragging(true)
  }
  const onPointerMove = e => {
    if (!dragging) return
    const deltaX = e.clientX - startX.current
    const w = containerRef.current.clientWidth
    const newOffset = startOffset.current + (deltaX / w) * 100
    setOffset(newOffset)
    // während Drag: aktiviere den Punkt, der in den Anker wandert
    const distances = items.map((_, i) =>
      Math.abs((10 + i * step) + newOffset - anchorPct)
    )
    const newActive = distances.indexOf(Math.min(...distances))
    setActiveIndex(newActive)
  }
  const onPointerUp = e => {
    containerRef.current.releasePointerCapture(e.pointerId)
    setDragging(false)
    // snappe auf den aktiven Index
    const snapOffset = anchorPct - (10 + activeIndex * step)
    setOffset(snapOffset)
    onSelect(activeIndex)
  }

  // Bezier‐Approximation für Y-Werte
  const bezierY = (t, p0, p1, p2, p3) =>
    (1 - t) ** 3 * p0 +
    3 * (1 - t) ** 2 * t * p1 +
    3 * (1 - t) * t ** 2 * p2 +
    t ** 3 * p3

  const calcY = (pct, type) => {
    const t = pct / 100
    return type === 'history'
      ? bezierY(t, 75, 120, 30, 75)
      : bezierY(t, 100, 50, 140, 100)
  }

  // Statische Kurven
  const pathA = 'M0,75 C200,120 300,30 500,75 S800,120 1000,75'
  const pathB = 'M0,100 C200,50 300,140 500,100 S800,50 1000,100'

  const wrapperStyle = {
    transform: `translateX(${offset}%)`,
    transition: dragging ? 'none' : 'transform 0.6s ease-in-out'
  }

  return (
    <div
      className={styles.timeline}
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Kurven */}
      <svg
        className={styles.timelineSvg}
        viewBox="0 0 1000 150"
        preserveAspectRatio="none"
      >
        <g style={wrapperStyle}>
          <path className={styles.timelineCurve} d={pathA} />
          <path className={styles.timelineCurve} d={pathB} />
        </g>
      </svg>

      {/* Punkte & Labels */}
      <div className={styles.pointsWrapper} style={wrapperStyle}>
        {items.map((item, idx) => {
          const leftPct = 10 + idx * step
          const y = calcY(leftPct, item.type)
          const isActive = idx === activeIndex
          // optional: fade außerhalb
          const visX = leftPct + offset
          const opacity = visX < -5 || visX > 105 ? 0 : 1

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: 0,
                opacity
              }}
            >
              <div
                className={`${styles.timelinePoint} ${
                  isActive ? styles.active : ''
                }`}
                style={{ top: `${y}px` }}
                onClick={() => {
                  setActiveIndex(idx)
                  // snap direkt
                  setOffset(anchorPct - leftPct)
                  onSelect(idx)
                }}
              />
              <div
                className={styles.timelineLabel}
                style={{ top: `${y + 15}px` }}
              >
                <span>{item.title}</span><br/>
                <small>{item.year}</small>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
