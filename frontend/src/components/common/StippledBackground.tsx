import React, { useEffect, useRef } from 'react';

interface Particle {
  baseRadius: number;
  angle: number;
  length: number;
  width: number;
  color: string;
  speed: number;
  pulsePhase: number;
  radialJitter: number;
  angleJitter: number;
  tangentOffset: number;
}

// Refined palette inspired by the reference radial stippled matrix
const PALETTE = [
  // Warm sunset / amber / gold (top & top-right)
  '#f59e0b',
  '#fbbf24',
  '#f97316',
  '#fb923c',
  '#ea580c',
  // Rose / Coral / Magenta (center & right)
  '#f43f5e',
  '#fb7185',
  '#ec4899',
  '#e11d48',
  '#db2777',
  // Purple / Violet / Orchid (transitions)
  '#a855f7',
  '#c084fc',
  '#9333ea',
  '#8b5cf6',
  // Indigo / Periwinkle / Sky Blue (left & bottom-left)
  '#6366f1',
  '#818cf8',
  '#4f46e5',
  '#3b82f6',
  '#0ea5e9',
];

export const StippledBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = true;
    let prefersReducedMotion = false;

    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = motionQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !prefersReducedMotion) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Color distribution based on polar angle to reproduce the reference spectrum
    const getColorForAngle = (angle: number): string => {
      // Normalize angle to [0, 2PI)
      let normalized = (angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

      // Distribute warm ambers/reds in top/right quadrant, purples in mid, blues/indigos in bottom/left
      if (normalized < Math.PI * 0.35) {
        // Top right: amber, gold, orange
        const warm = ['#f59e0b', '#fbbf24', '#f97316', '#ea580c', '#fb923c'];
        return warm[Math.floor(Math.random() * warm.length)];
      } else if (normalized < Math.PI * 0.75) {
        // Bottom right: coral, pink, magenta
        const mid = ['#f43f5e', '#ec4899', '#db2777', '#f43f5e', '#fb7185'];
        return mid[Math.floor(Math.random() * mid.length)];
      } else if (normalized < Math.PI * 1.35) {
        // Bottom / bottom left: violet, purple, indigo
        const cool = ['#9333ea', '#a855f7', '#8b5cf6', '#6366f1', '#818cf8'];
        return cool[Math.floor(Math.random() * cool.length)];
      } else {
        // Upper left / top: indigo, periwinkle, sky blue transitioning back to warm
        const transition = ['#4f46e5', '#3b82f6', '#0ea5e9', '#6366f1', '#fbbf24'];
        return transition[Math.floor(Math.random() * transition.length)];
      }
    };

    let particles: Particle[] = [];

    const initParticles = () => {
      const isMobile = width < 768;
      const count = isMobile ? 180 : 320;
      const maxRadius = Math.hypot(width, height) * 0.75;
      const minRadius = Math.min(width, height) * 0.08;

      particles = [];

      // Concentric rings with density scaling
      const rings = isMobile ? 18 : 28;
      for (let r = 0; r < rings; r++) {
        const ringT = (r + 1) / rings;
        // Exponential distribution for higher density near focal core, spreading outward
        const ringRadius = minRadius + Math.pow(ringT, 1.3) * (maxRadius - minRadius);
        // More particles in outer rings
        const particlesInRing = Math.floor(6 + ringT * (count / (rings * 0.5)));

        for (let i = 0; i < particlesInRing; i++) {
          const baseAngle = (i / particlesInRing) * Math.PI * 2 + (r % 2 ? 0.1 : 0);
          const angleJitter = (Math.random() - 0.5) * 0.18;
          const finalAngle = baseAngle + angleJitter;

          const radialJitter = (Math.random() - 0.5) * (maxRadius / rings) * 0.7;

          // Dash size varies: smaller near center, slightly longer outward like the reference
          const length = 3.5 + Math.random() * 4.5 + ringT * 3;
          const particleWidth = 1.6 + Math.random() * 0.8;

          particles.push({
            baseRadius: ringRadius,
            angle: finalAngle,
            length,
            width: particleWidth,
            color: getColorForAngle(finalAngle),
            speed: 0.00015 + Math.random() * 0.00025,
            pulsePhase: Math.random() * Math.PI * 2,
            radialJitter,
            angleJitter,
            tangentOffset: (Math.random() - 0.5) * 0.25,
          });
        }
      }
    };

    const handleResize = () => {
      const parent = canvas.parentElement || document.body;
      const rect = parent.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = Math.max(rect.height || window.innerHeight, window.innerHeight);

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticles();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();
    let globalAngle = 0;

    const render = (currentTime: number) => {
      if (!isVisible) return;

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!prefersReducedMotion) {
        globalAngle += delta * 0.04;
      }

      ctx.clearRect(0, 0, width, height);

      // Focal origin placed at right-of-center (similar to the reference visual layout)
      const isMobile = width < 768;
      const originX = isMobile ? width * 0.65 : width * 0.72;
      const originY = isMobile ? height * 0.28 : height * 0.32;

      ctx.save();

      // Batch rendering by color for optimal performance
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Soft ambient orbital drift & breathing wave
        const currentAngle = p.angle + (prefersReducedMotion ? 0 : globalAngle * (p.speed * 8));
        const breathing = prefersReducedMotion
          ? 0
          : Math.sin(currentTime * 0.0012 + p.pulsePhase) * 4.5;

        const currentRadius = p.baseRadius + p.radialJitter + breathing;

        const x = originX + Math.cos(currentAngle) * currentRadius;
        const y = originY + Math.sin(currentAngle) * currentRadius;

        // Skip if far outside viewport bounds
        if (x < -40 || x > width + 40 || y < -40 || y > height + 40) {
          continue;
        }

        // Tangent orientation with subtle radial inclination
        const dashAngle = currentAngle + Math.PI / 2 + p.tangentOffset;
        const halfLen = (p.length + Math.sin(currentTime * 0.0015 + p.pulsePhase) * 1.2) / 2;

        const x1 = x - Math.cos(dashAngle) * halfLen;
        const y1 = y - Math.sin(dashAngle) * halfLen;
        const x2 = x + Math.cos(dashAngle) * halfLen;
        const y2 = y + Math.sin(dashAngle) * halfLen;

        // Soft opacity based on distance from core and screen edges
        const distFromCenter = Math.hypot(x - originX, y - originY);
        const maxDist = Math.hypot(width, height) * 0.8;
        const edgeFactor = Math.max(0.2, 1 - distFromCenter / maxDist);
        const alpha = Math.min(0.85, Math.max(0.25, edgeFactor * 0.85));

        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = p.width;
        ctx.lineCap = 'round';
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.restore();

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-opacity duration-1000 opacity-60 dark:opacity-35"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* Soft radial vignette overlay to blend seamlessly into background */}
      <div className="absolute inset-0 bg-radial-[at_70%_30%] from-transparent via-white/20 to-white/90 dark:via-black/20 dark:to-black/90 pointer-events-none" />
    </div>
  );
};
