// src/components/Timeline.jsx
import React, { useRef, useState, useEffect } from 'react'
import styles from './scss/Timeline.module.scss'

export default function Timeline({ items, onSelect }) {
  const anchorPct = 20
  const step      = 80 / (items.length - 1)

  const [offset, setOffset]       = useState(0)
  const [activeIndex, setActive]  = useState(0)
  const [targetIndex, setTarget]  = useState(0)
  const [colorIndex, setColor]    = useState(0)        // Punkt & Label, die gerade verblassen
  const [isAnimating, setAnimating]= useState(false)
  const [phase, setPhase]         = useState(0)
  const [isPointerDown, setDown]  = useState(false)

  const containerRef = useRef(null)
  const startX       = useRef(0)
  const rafId        = useRef(null)
  const lastTime     = useRef(0)

  // 1. Anfangs-Snap
  useEffect(() => {
    setOffset(anchorPct - 10)
    setActive(0)
    setColor(0)
    onSelect(0)
  }, [])

  // 2. Wellen-Loop nur bei Swipe/Snap
  useEffect(() => {
    if (isAnimating) {
      lastTime.current = performance.now()
      const loop = time => {
        const delta = time - lastTime.current
        lastTime.current = time
        setPhase(p => p + delta * 0.004)
        rafId.current = requestAnimationFrame(loop)
      }
      rafId.current = requestAnimationFrame(loop)
    } else {
      cancelAnimationFrame(rafId.current)
    }
    return () => cancelAnimationFrame(rafId.current)
  }, [isAnimating])

  // 3. Dynamische Bézier-CPs
  const cpA1   = { x: 200,  y: 120 + Math.sin(phase) * 15 }
  const cpA2   = { x: 300,  y:  30 + Math.cos(phase) * 20 }
  const cpA2_1 = { x: 800,  y: 150 - cpA2.y }
  const cpA2_2 = { x:1000,  y:  75 + Math.sin(phase + Math.PI/2) * 10 }
  const cpB1   = { x: 200,  y:  50 + Math.sin(phase + Math.PI) * 15 }
  const cpB2   = { x: 300,  y: 140 + Math.cos(phase + Math.PI) * 20 }
  const cpB2_1 = { x: 800,  y: 200 - cpB2.y }
  const cpB2_2 = { x:1000,  y: 100 + Math.cos(phase + Math.PI/2) * 10 }

  const pathA =
    `M0,75 C${cpA1.x},${cpA1.y} ${cpA2.x},${cpA2.y} 500,75 ` +
    `S${cpA2_1.x},${cpA2_1.y} ${cpA2_2.x},${cpA2_2.y}`
  const pathB =
    `M0,100 C${cpB1.x},${cpB1.y} ${cpB2.x},${cpB2.y} 500,100 ` +
    `S${cpB2_1.x},${cpB2_1.y} ${cpB2_2.x},${cpB2_2.y}`

  // Bézier-Evaluator
  const bezierY = (t, p0, p1, p2, p3) =>
    (1 - t) ** 3 * p0 +
    3 * (1 - t) ** 2 * t * p1 +
    3 * (1 - t) * t ** 2 * p2 +
    t ** 3 * p3

  // Y-Position auf Kurve
  const calcY = (leftPct, type) => {
    const t = leftPct / 100
    if (type === 'history') {
      return t <= 0.5
        ? bezierY(t * 2, 75, cpA1.y, cpA2.y, 75)
        : bezierY((t - 0.5) * 2, 75, cpA2_1.y, cpA2_2.y, 75)
    }
    return t <= 0.5
      ? bezierY(t * 2, 100, cpB1.y, cpB2.y, 100)
      : bezierY((t - 0.5) * 2, 100, cpB2_1.y, cpB2_2.y, 100)
  }

  // Ziel-Index per Klick/Swipe ermitteln
  const getNearestIndex = clientX => {
    const r = containerRef.current.getBoundingClientRect()
    const pctX = ((clientX - r.left) / r.width) * 100
    const dists = items.map((_, i) =>
      Math.abs((10 + i * step + offset) - pctX)
    )
    return dists.indexOf(Math.min(...dists))
  }

  // 4. Animation starten: colorIndex sofort, Snap starten
  const animateTo = idx => {
    if (idx === activeIndex) return
    setTarget(idx)
    setColor(idx)
    setAnimating(true)
    setOffset(anchorPct - (10 + idx * step))
    onSelect(idx)
  }

  const handleSwipeOrClick = (dx, clientX) => {
    const threshold = containerRef.current.clientWidth * 0.1
    if (Math.abs(dx) > threshold) {
      const dir  = dx < 0 ? 1 : -1
      const nxt  = Math.min(Math.max(activeIndex + dir, 0), items.length - 1)
      animateTo(nxt)
    } else {
      animateTo(getNearestIndex(clientX))
    }
  }

  const onPointerDown = e => {
    containerRef.current.setPointerCapture(e.pointerId)
    setDown(true)
    startX.current = e.clientX
  }
  const onPointerUp = e => {
    if (!isPointerDown) return
    const dx = e.clientX - startX.current
    handleSwipeOrClick(dx, e.clientX)
    setDown(false)
  }

  // 5. Sobald Snap-Transition (2s) aufhört: activeIndex = target & Wave-Loop enden
  const onTransEnd = e => {
    if (e.propertyName === 'transform') {
      setActive(targetIndex)
      setAnimating(false)
    }
  }

  const wrapperStyle = {
    transform: `translateX(${offset}%)`,
    transition: isAnimating ? 'transform 2s ease-in-out' : 'none'
  }

  return (
    <div
      ref={containerRef}
      className={styles.timeline}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <svg className={styles.timelineSvg} viewBox="0 0 1000 150" preserveAspectRatio="none">
        <g style={wrapperStyle} onTransitionEnd={onTransEnd}>
          <path className={styles.timelineCurve} d={pathA} />
          <path className={styles.timelineCurve} d={pathB} />
        </g>
      </svg>

      <div className={styles.pointsWrapper} style={wrapperStyle}>
        {items.map((item, idx) => {
          const leftPct = 10 + idx * step
          const y       = calcY(leftPct, item.type)
          const isColor = idx === colorIndex
          const isActive= idx === activeIndex
          const visX    = leftPct + offset
          const opacity = visX < -5 || visX > 105 ? 0 : 1

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left:    `${leftPct}%`,
                top:     0,
                opacity,
                transition: 'opacity 2s ease-in-out'
              }}
            >
              <div
                className={`
                  ${styles.timelinePoint}
                  ${isActive ? styles.active     : ''}
                  ${isColor  ? styles.fadePoint  : ''}
                `}
                style={{ top: `${y}px` }}
                role="button"
                tabIndex={0}
              />
              <div
                className={`
                  ${styles.timelineLabel}
                  ${isActive ? styles.active     : ''}
                  ${isColor  ? styles.fadeLabel  : ''}
                `}
                style={{ top: `${y + 10}px` }}
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
