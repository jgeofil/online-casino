import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
  color: string;
}

const CHARS = ['$', '€', '¥', '₿', '?', '!', '☆', '★', '💰', '🎰'];
const COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#00ff00', '#ff0000'];

export const CursorTrail: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };

      setParticles((prev) => [...prev.slice(-20), newParticle]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timeout = setInterval(() => {
      setParticles((prev) => prev.filter((p) => Date.now() - p.id < 600));
    }, 100);
    return () => clearInterval(timeout);
  }, []);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="cursor-particle"
          style={{
            left: p.x,
            top: p.y,
            color: p.color,
          }}
        >
          {p.char}
        </div>
      ))}
    </>
  );
};
