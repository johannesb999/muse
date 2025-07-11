import React, { useRef, useState, useEffect } from 'react'
import Timeline from '../components/Timeline'
import styles from '../components/scss/History.module.scss'

const timelineItems = [
  {
    year: '1972',
    title: 'Gründung des Unternehmens in Neu-Ulm',
    text: `Die Wirtschaftskanzlei SGP Schneider Geiwitz wurde 1972 in Neu-Ulm gegründet 
und bot von Beginn an Wirtschaftsprüfung, Steuer- und Rechtsberatung, 
Corporate Finance, Nachlassverwaltung, Restrukturierung und Insolvenzverwaltung an.`,
    img: '/assets/historie-1972.png',
  },
  {
    year: '1995',
    title: 'Arndt Geiwitz tritt bei',
    text: `1995 stieß Arndt Geiwitz zur Kanzlei hinzu und stärkte 
den Bereich Unternehmensberatung und Restrukturierung.`,
    img: '/assets/historie-1995.png',
  },
  {
    year: '2000',
    title: 'Insolvenzverwaltung',
    text: `Ab 2000 Ausbau der Insolvenzverwaltung mit mehreren 
großen Mandaten.`,
    img: '/assets/historie-2000.png',
  },
  {
    year: '2010',
    title: 'Corporate Finance',
    text: `2010 wurde der Bereich Corporate Finance weiter professionalisiert.`,
    img: '/assets/historie-2010.png',
  },
  {
    year: '2012',
    title: 'SCHLECKER & Galeria Karstadt Kaufhof',
    text: `2012 Begleitung der Großinsolvenzen von Schlecker 
und Galeria Karstadt Kaufhof.`,
    img: '/assets/historie-2012.png',
  },
]

export default function History() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const wrapperRef = useRef(null)
  const startX = useRef(0)
  const isDragging = useRef(false)

  useEffect(() => {
    setDragOffset(0)
  }, [activeIndex])

  const onTouchStart = e => {
    startX.current = e.touches[0].clientX
    isDragging.current = true
  }
  const onTouchMove = e => {
    if (!isDragging.current) return
    setDragOffset(e.touches[0].clientX - startX.current)
  }
  const onTouchEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    const width = wrapperRef.current.clientWidth
    const threshold = width * 0.3
    if (dragOffset < -threshold && activeIndex < timelineItems.length - 1) {
      setActiveIndex(activeIndex + 1)
    } else if (dragOffset > threshold && activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    } else {
      setDragOffset(0)
    }
  }

  return (
    <div className={styles.historyContainer}>
      {/* Header */}
      <div className={styles.historyHeader}>
        <div className={styles.menuBtn}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <div className={styles.menuLabel}>Menu</div>
      </div>

      {/* Panels */}
      <div
        className={styles.contentWrapper}
        ref={wrapperRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={styles.panels}
          style={{
            transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {timelineItems.map((item, idx) => (
            <div className={styles.panel} key={idx}>
              <div className={styles.left}>
                <div className={styles.year}>{item.year}</div>
                <div className={styles.title}>{item.title}</div>
                <div className={styles.text}>{item.text}</div>
              </div>
              <div className={styles.right}>
                <img src={item.img} alt={item.title} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <Timeline
        items={timelineItems}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        dragOffset={dragOffset / (wrapperRef.current?.clientWidth || 1)}
      />
    </div>
  )
}
