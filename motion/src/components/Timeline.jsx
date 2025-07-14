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
  const [phase, setPhase] = useState(0)

  const containerRef = useRef(null)
  const startX = useRef(0)
  const startOffset = useRef(0)
  const rafIdRef = useRef(null)
  const lastTimeRef = useRef(0)

  // 1) Initial Snap ins erste Item
  useEffect(() => {
    const initialLeft = 10
    setOffset(anchorPct - initialLeft)
    setActiveIndex(0)
    onSelect(0)
  }, [])

  // 2) Starte/Stoppe Wellen-Loop nur bei PointerDown
  useEffect(() => {
    if (isPointerDown) {
      lastTimeRef.current = performance.now()
      const loop = time => {
        const delta = time - lastTimeRef.current
        lastTimeRef.current = time
        setPhase(prev => prev + delta * 0.002) // Geschwindigkeit justierbar
        rafIdRef.current = requestAnimationFrame(loop)
      }
      rafIdRef.current = requestAnimationFrame(loop)
    } else {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [isPointerDown])

  // 3) Dynamische Control-Points je nach Phase
  const cpA1   = { x: 200, y: 120 + Math.sin(phase) * 15 }
  const cpA2   = { x: 300, y:  30 + Math.cos(phase) * 20 }
  const cpA2_1 = { x: 800, y: 150 - cpA2.y }
  const cpA2_2 = { x:1000, y:  75 + Math.sin(phase + Math.PI/2) * 10 }

  const cpB1   = { x: 200, y:  50 + Math.sin(phase + Math.PI) * 15 }
  const cpB2   = { x: 300, y: 140 + Math.cos(phase + Math.PI) * 20 }
  const cpB2_1 = { x: 800, y: 200 - cpB2.y }
  const cpB2_2 = { x:1000, y: 100 + Math.cos(phase + Math.PI/2) * 10 }

  // 4) Pfad-Strings mit dynamischen CPs
  const pathA = 
    `M0,75 C${cpA1.x},${cpA1.y} ${cpA2.x},${cpA2.y} 500,75 ` +
    `S${cpA2_1.x},${cpA2_1.y} ${cpA2_2.x},${cpA2_2.y}`

  const pathB = 
    `M0,100 C${cpB1.x},${cpB1.y} ${cpB2.x},${cpB2.y} 500,100 ` +
    `S${cpB2_1.x},${cpB2_1.y} ${cpB2_2.x},${cpB2_2.y}`

  // 5) Bézier-Evaluator für Y-Berechnung
  const bezierY = (t, p0, p1, p2, p3) =>
    (1 - t) ** 3 * p0 +
    3 * (1 - t) ** 2 * t * p1 +
    3 * (1 - t) * t ** 2 * p2 +
    t ** 3 * p3

  const calcY = (leftPct, type) => {
    const t = leftPct / 100
    if (type === 'history') {
      if (t <= 0.5) {
        const u = t * 2
        return bezierY(u, 75, cpA1.y, cpA2.y, 75)
      }
      const u = (t - 0.5) * 2
      return bezierY(u, 75, cpA2_1.y, cpA2_2.y, 75)
    } else {
      if (t <= 0.5) {
        const u = t * 2
        return bezierY(u, 100, cpB1.y, cpB2.y, 100)
      }
      const u = (t - 0.5) * 2
      return bezierY(u, 100, cpB2_1.y, cpB2_2.y, 100)
    }
  }

  // 6) Klick- und Drag-Utilities
  const getNearestIndexByClientX = clientX => {
    const rect = containerRef.current.getBoundingClientRect()
    const pctX = ((clientX - rect.left) / rect.width) * 100
    const dists = items.map((_, i) =>
      Math.abs((10 + i * step + offset) - pctX)
    )
    return dists.indexOf(Math.min(...dists))
  }

  const handleClickAt = clientX => {
    const idx = getNearestIndexByClientX(clientX)
    const finalLeft = 10 + idx * step
    setOffset(anchorPct - finalLeft)
    setActiveIndex(idx)
    onSelect(idx)
  }

  // 7) Pointer-Event-Handler
  const onPointerDown = e => {
    containerRef.current.setPointerCapture(e.pointerId)
    setIsPointerDown(true)
    setDragging(false)
    startX.current = e.clientX
    startOffset.current = offset
  }

  const onPointerMove = e => {
    if (!isPointerDown) return
    const dx = ((e.clientX - startX.current) / containerRef.current.clientWidth) * 100
    if (!dragging && Math.abs(dx) > 0.5) setDragging(true)
    if (dragging) {
      const newOffset = startOffset.current + dx
      setOffset(newOffset)
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

  const onPointerUp = e => {
    containerRef.current.releasePointerCapture(e.pointerId)
    if (dragging) {
      const dists = items.map((_, i) =>
        Math.abs((10 + i * step) + offset - anchorPct)
      )
      const newActive = dists.indexOf(Math.min(...dists))
      const finalLeft = 10 + newActive * step
      setOffset(anchorPct - finalLeft)
      setActiveIndex(newActive)
      onSelect(newActive)
    } else {
      handleClickAt(e.clientX)
    }
    setDragging(false)
    setIsPointerDown(false)
  }

  const wrapperStyle = {
    transform: `translateX(${offset}%)`,
    transition: dragging ? 'none' : 'transform 0.6s ease-in-out'
  }

  return (
    <div
      ref={containerRef}
      className={styles.timeline}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* SVG-Kurven */}
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
              style={{ position: 'absolute', left: `${leftPct}%`, top: 0, opacity }}
            >
              <div
                className={`${styles.timelinePoint} ${isActive ? styles.active : ''}`}
                style={{ top: `${y}px` }}
                role="button"
                tabIndex={0}
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
