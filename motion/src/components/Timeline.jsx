// src/components/Timeline.jsx
import React, { useRef, useState, useEffect } from 'react'
import styles from './scss/Timeline.module.scss'

export default function Timeline({
  items,
  activeIndex,
  onSelect,
  dragOffset = 0  // in [-1,1] von History.jsx hereingereicht
}) {
  const viewW     = 1000
  const baseY1    = 75
  const baseY2    = 100
  const anchorPct = 20
  const step      = 80 / (items.length - 1)
  const k         = ((items.length - 1) * Math.PI) / viewW
  const amp       = 40

  // State für Snap-Offset & Freeze
  const [baseOffset,  setBaseOffset]  = useState(anchorPct - 10)
  const [isFrozen,    setIsFrozen]    = useState(true)
  const [fadeInIdx,   setFadeInIdx]   = useState(null)
  const [fadeOutIdx,  setFadeOutIdx]  = useState(null)

  // Phase steuert Kurven *und* Punkt-Drift
  const [phase, setPhase] = useState(Math.PI/2)
  const raf = useRef(null)
  const last = useRef(0)

  // 1) Loop, solange nicht gefroren
  useEffect(() => {
    const loop = now => {
      const delta = now - last.current
      if (!isFrozen) {
        setPhase(p => p + delta * 0.0005) // sehr langsam
      }
      last.current = now
      raf.current = requestAnimationFrame(loop)
    }
    last.current = performance.now()
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [isFrozen])

  // 2) Snap auf activeIndex: Basis-Verschiebung + kurz auftauen
  useEffect(() => {
    const newOff = anchorPct - (10 + activeIndex * step)
    setBaseOffset(newOff)
    setFadeOutIdx(activeIndex)
    setFadeInIdx(null)
    setIsFrozen(false)
    const t = setTimeout(() => setIsFrozen(true), 2000)
    return () => clearTimeout(t)
  }, [activeIndex])

  // 3) Pfade animieren nur via phase (sinusförmig „atmen“)
  const buildPath = (baseY, phaseShift = 0) => {
    const segs = 200, pts = []
    for (let i = 0; i <= segs; i++) {
      const x = (viewW / segs) * i
      const y = baseY + amp * Math.sin(k * x + phase + phaseShift)
      pts.push([x, y])
    }
    return pts.reduce((d,[x,y],i) =>
      i===0 ? `M${x},${y}` : `${d} L${x},${y}`
    , '')
  }
  const pathA = buildPath(baseY1, 0)
  const pathB = buildPath(baseY2, Math.PI)

  // 4) Punkte wandern entlang der Kurve: leftPct + drift, y über dieselbe Formel
  const speed = 0.02 // Drift pro Phase-Einheit in Prozent
  const calcDynamicPct = (basePct) => basePct + (phase * speed * 100)
  const calcY = (xPct, type) => {
    const x = (viewW * (xPct/100))
    const baseY = type==='history' ? baseY1 : baseY2
    const shift = type==='history' ? 0 : Math.PI
    return baseY + amp * Math.sin(k * x + phase + shift)
  }

  // 5) Klick auf Punkt → Fade + onSelect
  const animateTo = idx => {
    if (idx===activeIndex) return
    setFadeOutIdx(activeIndex)
    setFadeInIdx(idx)
    onSelect(idx)
  }

  // 6) Gesamtoffset = Snap + Drag in %
  const totalOffset = baseOffset + dragOffset * 100
  const wrapperStyle = {
    transform: `translateX(${totalOffset}%)`,
    transition: isFrozen ? 'none' : 'transform 2s ease-in-out'
  }

  return (
    <div className={styles.timeline}>
      <svg className={styles.timelineSvg} viewBox="0 0 1000 150" preserveAspectRatio="none">
        <g style={wrapperStyle}>
          <path className={styles.timelineCurve} d={pathA} />
          <path className={styles.timelineCurve} d={pathB} />
        </g>
      </svg>
      <div className={styles.pointsWrapper} style={wrapperStyle}>
        {items.map((item, idx) => {
          const basePct = 10 + idx*step
          const xPct    = calcDynamicPct(basePct)
          const y       = calcY(xPct, item.type)
          const isA     = idx===activeIndex
          const isI     = idx===fadeInIdx
          const isO     = idx===fadeOutIdx
          const vis     = xPct + totalOffset
          const op      = vis < -5 || vis > 105 ? 0 : 1

          return (
            <div key={idx} style={{
              position:'absolute',
              left:    `${xPct}%`,
              top:     0,
              opacity: op,
              transition: 'opacity 2s ease-in-out'
            }}>
              <div
                onClick={()=>animateTo(idx)}
                role="button" tabIndex={0}
                className={`
                  ${styles.timelinePoint}
                  ${isA?styles.active:''}
                  ${isI?styles.fadePoint:''}
                  ${isO?styles.fadeOutPoint:''}
                `}
                style={{ top:`${y}px` }}
              />
              <div
                className={`
                  ${styles.timelineLabel}
                  ${isA?styles.active:''}
                  ${isI?styles.fadeLabel:''}
                  ${isO?styles.fadeOutLabel:''}
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
