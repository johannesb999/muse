import React, { useRef, useEffect } from "react";

// Diese Sub-Komponente bleibt unverändert. Sie zeichnet eine einzelne Welle.
const Wave = ({
  width,
  height,
  baseY,
  amplitude,
  frequency,
  phase,
  color,
  numParticles = 1500,
  particleSpeed = 0.5,
  noiseAmount = 3,
}) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    particles.current = [];
    for (let i = 0; i < numParticles; i++) {
      particles.current.push({
        x: Math.random() * width,
        speed: particleSpeed + (Math.random() - 0.5) * 0.2,
      });
    }
  }, [width, numParticles, particleSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const render = (time) => {
      const timeFactor = time * 0.0003;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      for (const particle of particles.current) {
        particle.x += particle.speed;
        if (particle.x > width) {
          particle.x = 0;
        }
        const waveY =
          baseY +
          amplitude * Math.sin(frequency * particle.x + phase + timeFactor);
        const noiseY = (Math.random() - 0.5) * noiseAmount;
        const finalY = waveY + noiseY;
        ctx.fillRect(particle.x, finalY, 1, 1);
      }
      animationFrameId = window.requestAnimationFrame(render);
    };

    render(0);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    width,
    height,
    baseY,
    amplitude,
    frequency,
    phase,
    color,
    particleSpeed,
    noiseAmount,
  ]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

// Hauptkomponente, die jetzt vier Wellen mit unterschiedlichen Eigenschaften rendert.
export default function AnimatedWaves({
  width,
  height,
  baseY_A,
  baseY_B,
  amplitude,
  frequency,
  colors,
}) {
  // Stellt sicher, dass die Komponente nicht mit ungültigen Dimensionen rendert
  if (width <= 1 || height <= 0) {
    return null;
  }

  // Parameter für die zusätzlichen, versetzten Wellen
  const verticalOffset = 8; // Vertikaler Abstand in Pixeln
  const secondaryAmplitude = amplitude * 0.7; // Geringere Amplitude für einen subtileren Effekt
  const secondaryColorA = "#404243"; // Etwas helleres Grau für die zweite A-Welle
  const secondaryColorB = "#55585a"; // Etwas helleres Grau für die zweite B-Welle

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width, height }}>
      {/* --- Wellen für Track A --- */}
      <Wave
        width={width}
        height={height}
        baseY={baseY_A}
        amplitude={amplitude}
        frequency={frequency}
        phase={0}
        color={colors.A}
        numParticles={800} // Hauptwelle
      />
      <Wave
        width={width}
        height={height}
        baseY={baseY_A + verticalOffset} // Leicht nach unten versetzt
        amplitude={secondaryAmplitude}
        frequency={frequency}
        phase={0.5} // Leichter Phasenversatz für mehr Variation
        color={secondaryColorA}
        numParticles={500} // Weniger Partikel für die Nebenwelle
        particleSpeed={0.4}
      />

      {/* --- Wellen für Track B --- */}
      <Wave
        width={width}
        height={height}
        baseY={baseY_B}
        amplitude={amplitude}
        frequency={frequency}
        phase={Math.PI}
        color={colors.B}
        numParticles={800} // Hauptwelle
      />
      <Wave
        width={width}
        height={height}
        baseY={baseY_B - verticalOffset} // Leicht nach oben versetzt
        amplitude={secondaryAmplitude}
        frequency={frequency}
        phase={Math.PI + 0.5} // Leichter Phasenversatz für mehr Variation
        color={secondaryColorB}
        numParticles={500} // Weniger Partikel für die Nebenwelle
        particleSpeed={0.4}
      />
    </div>
  );
}
