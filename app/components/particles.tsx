"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
};

type ParticlesProps = {
  particleColors?: string[];
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleBaseSize?: number;
  moveParticlesOnHover?: boolean;
  alphaParticles?: boolean;
  disableRotation?: boolean;
  className?: string;
};

export function Particles({
  particleColors = ["#ffffff", "#5cf6ff", "#d8ff8f"],
  particleCount = 180,
  particleSpread = 20,
  speed = 0.1,
  particleBaseSize = 1.2,
  moveParticlesOnHover = false,
  alphaParticles = true,
  disableRotation = false,
  className = "",
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let animationFrame = 0;
    const particles: Particle[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const getCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      return {
        width: rect.width || window.innerWidth,
        height: rect.height || window.innerHeight,
      };
    };

    const resize = () => {
      const { width, height } = getCanvasSize();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles.length = 0;

      for (let i = 0; i < particleCount; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const drift = (0.2 + Math.random() * 0.8) * speed;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * drift,
          vy: Math.sin(angle) * drift,
          size: particleBaseSize * (0.45 + Math.random() * 1.45),
          color: particleColors[i % particleColors.length],
          alpha: alphaParticles ? 0.25 + Math.random() * 0.75 : 1,
        });
      }
    };

    const draw = () => {
      const { width, height } = getCanvasSize();
      context.clearRect(0, 0, width, height);
      frame += 0.002;

      for (const particle of particles) {
        if (!disableRotation) {
          particle.vx += Math.sin(frame + particle.y * 0.003) * 0.0015;
          particle.vy += Math.cos(frame + particle.x * 0.003) * 0.0015;
        }

        if (moveParticlesOnHover && pointerRef.current.active) {
          const dx = particle.x - pointerRef.current.x;
          const dy = particle.y - pointerRef.current.y;
          const distance = Math.max(Math.hypot(dx, dy), 1);
          const force = Math.max(0, 1 - distance / (particleSpread * 42));
          particle.vx += (dx / distance) * force * 0.018;
          particle.vy += (dy / distance) * force * 0.018;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.992;
        particle.vy *= 0.992;

        if (particle.x < -12) particle.x = width + 12;
        if (particle.x > width + 12) particle.x = -12;
        if (particle.y < -12) particle.y = height + 12;
        if (particle.y > height + 12) particle.y = -12;

        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;
        context.shadowColor = particle.color;
        context.shadowBlur = particle.size * 8;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
      context.shadowBlur = 0;
      animationFrame = requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [
    alphaParticles,
    disableRotation,
    moveParticlesOnHover,
    particleBaseSize,
    particleColors,
    particleCount,
    particleSpread,
    speed,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`particles-canvas ${className}`}
      aria-hidden="true"
    />
  );
}
