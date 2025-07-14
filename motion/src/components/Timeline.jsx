// src/components/Timeline.jsx
import React, { useRef, useState, useEffect } from 'react'
import styles from './scss/Timeline.module.scss'

export default function Timeline({ items, onSelect }) {
  const anchorPct = 20
  const step = 80 / (items.length - 1)

  const [offset, setOffset]               = useState(0)
  const [activeIndex, setActiveIndex]    = useState(0)
  const [targetIndex, setTargetIndex]    = useState(0)
  const [fadeInIndex, setFadeInIndex]    = useState(null)
  const [fadeOutIndex, setFadeOutIndex]  = useState(null)
  const [isAnimating, setIsAnimating]    = useState(false)
  const [phase, setPhase]                = useState(0)
  const [isPointerDown, setIsPointerDown]= useState(false)

  const containerRef = useRef(null)
  const startX       = useRef(0)
  const rafRef       = useRef(null)
  const lastTimeRef  = useRef(0)

  // 1) Initial Snap
  useEffect(() => {
    setOffset(anchorPct - 10)
    setActiveIndex(0)
    onSelect(0)
  }, [])

  // 2) Animations-Loop nur während Swipe/Snap
  useEffect(() => {
    if (isAnimating) {
      lastTimeRef.current = performance.now()
      const loop = now => {
        const delta = now - lastTimeRef.current
        lastTimeRef.current = now
        setPhase(p => p + delta * 0.003)  // langsamer für elegantere Helix
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)
    } else {
      cancelAnimationFrame(rafRef.current)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [isAnimating])

  // 3) Gemeinsame Helix-Parameter
  const helixParams = useRef({
    ampX: 60,   // horizontale Auslenkung
    ampY: 20,   // vertikale Auslenkung
    phaseOffset: Math.random() * Math.PI * 2 // random Startphase
  }).current

  // 4) Helix-Funktion: X=cos, Y=sin → echte Kreis-/Spiralen-Bewegung
  const helix = (baseX, baseY, invert=false) => {
    const { ampX, ampY, phaseOffset } = helixParams
    const ph = phase + phaseOffset + (invert ? Math.PI : 0)
    return {
      x: baseX + Math.cos(ph) * ampX,
      y: baseY + Math.sin(ph) * ampY
    }
  }

  // Control-Points der beiden Kurven (starten kreuzend)
  const cpA1 = helix(200, 75,  false)
  const cpA2 = helix(300, 75,  false)
  const cpA3 = helix(700, 75,  false)
  const cpA4 = helix(900, 75,  false)

  const cpB1 = helix(200, 75,  true)
  const cpB2 = helix(300, 75,  true)
  const cpB3 = helix(700, 75,  true)
  const cpB4 = helix(900, 75,  true)

  const pathA =
    `M0,75 C${cpA1.x},${cpA1.y} ${cpA2.x},${cpA2.y} 500,75 ` +
    `S${cpA3.x},${cpA3.y} ${cpA4.x},${cpA4.y}`

  const pathB =
    `M0,100 C${cpB1.x},${cpB1.y} ${cpB2.x},${cpB2.y} 500,100 ` +
    `S${cpB3.x},${cpB3.y} ${cpB4.x},${cpB4.y}`

  // Bézier-Interpolator für Punkt-Y
  const bezierY = (t,p0,p1,p2,p3) =>
    (1-t)**3*p0 + 3*(1-t)**2*t*p1 + 3*(1-t)*t**2*p2 + t**3*p3

  const calcY = (leftPct, type) => {
    const t = leftPct / 100
    if (type==='history') {
      return t<=0.5
        ? bezierY(t*2, 75, cpA1.y, cpA2.y, 75)
        : bezierY((t-0.5)*2, 75, cpA3.y, cpA4.y, 75)
    }
    return t<=0.5
      ? bezierY(t*2,100,cpB1.y,cpB2.y,100)
      : bezierY((t-0.5)*2,100,cpB3.y,cpB4.y,100)
  }

  // 5) Klick/Swipe → Fade-Out alten, Fade-In neuen Punkt
  const getNearest = x => {
    const r = containerRef.current.getBoundingClientRect()
    const pct = ((x-r.left)/r.width)*100
    const dists = items.map((_,i)=>Math.abs((10+i*step+offset)-pct))
    return dists.indexOf(Math.min(...dists))
  }
  const animateTo = idx => {
    if (idx===activeIndex) return
    setFadeOutIndex(activeIndex)
    setFadeInIndex(idx)
    setTargetIndex(idx)
    setIsAnimating(true)
    setOffset(anchorPct - (10 + idx*step))
    onSelect(idx)
  }
  const handleSwipeOrClick = (dx,x) => {
    const thr = containerRef.current.clientWidth * 0.1
    if (Math.abs(dx)>thr) {
      const dir = dx<0?1:-1
      const nxt = Math.min(Math.max(activeIndex+dir,0),items.length-1)
      animateTo(nxt)
    } else {
      animateTo(getNearest(x))
    }
  }
  const onPointerDown = e => {
    containerRef.current.setPointerCapture(e.pointerId)
    setIsPointerDown(true)
    startX.current = e.clientX
  }
  const onPointerUp = e => {
    if (!isPointerDown) return
    handleSwipeOrClick(e.clientX - startX.current, e.clientX)
    setIsPointerDown(false)
  }

  // 6) Nach 2s-Transition Ende: finalisieren & aufräumen
  const onTransEnd = e => {
    if (e.propertyName==='transform') {
      setActiveIndex(targetIndex)
      setIsAnimating(false)
      setFadeInIndex(null)
      setFadeOutIndex(null)
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
      <svg
        className={styles.timelineSvg}
        viewBox="0 0 1000 150"
        preserveAspectRatio="none"
      >
        <g style={wrapperStyle} onTransitionEnd={onTransEnd}>
          <path className={styles.timelineCurve} d={pathA} />
          <path className={styles.timelineCurve} d={pathB} />
        </g>
      </svg>

      <div className={styles.pointsWrapper} style={wrapperStyle}>
        {items.map((item, idx) => {
          const leftPct = 10 + idx*step
          const y = calcY(leftPct, item.type)
          const isActive = idx===activeIndex
          const isIn    = idx===fadeInIndex
          const isOut   = idx===fadeOutIndex
          const visX    = leftPct + offset
          const opacity = visX< -5 || visX>105 ? 0 : 1

          return (
            <div
              key={idx}
              style={{
                position:'absolute',
                left:`${leftPct}%`,
                top:0,
                opacity,
                transition:'opacity 2s ease-in-out'
              }}
            >
              <div
                className={`
                  ${styles.timelinePoint}
                  ${isActive?styles.active:''}
                  ${isIn?styles.fadePoint:''}
                  ${isOut?styles.fadeOutPoint:''}
                `}
                style={{ top:`${y}px` }}
                role="button"
                tabIndex={0}
              />
              <div
                className={`
                  ${styles.timelineLabel}
                  ${isActive?styles.active:''}
                  ${isIn?styles.fadeLabel:''}
                  ${isOut?styles.fadeOutLabel:''}
                `}
                style={{ top:`${y+15}px` }}
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
