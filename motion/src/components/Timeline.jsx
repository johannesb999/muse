// src/components/Timeline.jsx
import React, { useRef, useState, useEffect } from 'react'
import styles from './scss/Timeline.module.scss'

export default function Timeline({ items, onSelect }) {
  const anchorPct = 20
  const step = 80 / (items.length - 1)
  const [offset, setOffset] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPointerDown, setIsPointerDown] = useState(false)
  const [dragging, setDragging] = useState(false)

  const containerRef = useRef(null)
  const startX = useRef(0)
  const startOffset = useRef(0)

  // Initial: Punkt 0 in den Anchor snappen
  useEffect(() => {
    const initialLeft = 10
    setOffset(anchorPct - initialLeft)
    setActiveIndex(0)
    onSelect(0)
  }, [])

  // Bézier‐Evaluator
  const bezierY = (t, p0, p1, p2, p3) =>
    (1 - t) ** 3 * p0 +
    3 * (1 - t) ** 2 * t * p1 +
    3 * (1 - t) * t ** 2 * p2 +
    t ** 3 * p3

  // Exakte Y‐Berechnung entlang der SVG‐Segmente
  const calcY = (leftPct, type) => {
    const t = leftPct / 100
    if (type === 'history') {
      if (t <= 0.5) {
        const u = t * 2
        return bezierY(u, 75, 120, 30, 75)
      } else {
        const u = (t - 0.5) * 2
        return bezierY(u, 75, 120, 120, 75)
      }
    } else {
      if (t <= 0.5) {
        const u = t * 2
        return bezierY(u, 100, 50, 140, 100)
      } else {
        const u = (t - 0.5) * 2
        return bezierY(u, 100, 60, 50, 100)
      }
    }
  }

  // Hilfs‐Funktion: aus clientX → nächster Index
  const getNearestIndexByClientX = clientX => {
    const rect = containerRef.current.getBoundingClientRect()
    const pctX = ((clientX - rect.left) / rect.width) * 100
    const dists = items.map((_, i) =>
      Math.abs((10 + i * step + offset) - pctX)
    )
    return dists.indexOf(Math.min(...dists))
  }

  // Klick‐Logik (Snap + Select)
  const handleClickAt = clientX => {
    const idx = getNearestIndexByClientX(clientX)
    const finalLeft = 10 + idx * step
    setOffset(anchorPct - finalLeft)
    setActiveIndex(idx)
    onSelect(idx)
  }

  // Pointer‐Down: Maustaste gedrückt
  const onPointerDown = e => {
    containerRef.current.setPointerCapture(e.pointerId)
    setIsPointerDown(true)
    setDragging(false)
    startX.current = e.clientX
    startOffset.current = offset
  }

  // Pointer‐Move: nur wenn Maustaste gedrückt
  const onPointerMove = e => {
    if (!isPointerDown) return
    const dx = ((e.clientX - startX.current) / containerRef.current.clientWidth) * 100
    if (!dragging && Math.abs(dx) > 0.5) {
      setDragging(true)
    }
    if (dragging) {
      const newOffset = startOffset.current + dx
      setOffset(newOffset)
      // aktives Item während Drag updaten
      const dists = items.map((_, i) =>
        Math.abs((10 + i * step) + newOffset - anchorPct)
      )
      const newActive = dists.indexOf(Math.min(...dists))
      if (newActive !== activeIndex) {
        setActiveIndex(newActive)
        onSelect(newActive)
      }
    }
  }

  // Pointer‐Up: Drag-End oder Klick
  const onPointerUp = e => {
    containerRef.current.releasePointerCapture(e.pointerId)
    if (dragging) {
      // Snap-Ende
      const dists = items.map((_, i) =>
        Math.abs((10 + i * step) + offset - anchorPct)
      )
      const newActive = dists.indexOf(Math.min(...dists))
      const finalLeft = 10 + newActive * step
      setOffset(anchorPct - finalLeft)
      setActiveIndex(newActive)
      onSelect(newActive)
    } else {
      // Klick
      handleClickAt(e.clientX)
    }
    setDragging(false)
    setIsPointerDown(false)
  }

  const wrapperStyle = {
    transform: `translateX(${offset}%)`,
    transition: dragging ? 'none' : 'transform 0.6s ease-in-out'
  }
  const pathA = 'M0,75 C200,120 300,30 500,75 S800,120 1000,75'
  const pathB = 'M0,100 C200,50 300,140 500,100 S800,50 1000,100'

  return (
    <div
      ref={containerRef}
      className={styles.timeline}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* SVG‐Kurven */}
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
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ')
                    handleClickAt(startX.current)
                }}
              />
              <div
                className={styles.timelineLabel}
                style={{ top: `${y + 15}px` }}
              >
                <span>{item.title}</span>
                <br />
                <small>{item.year}</small>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
