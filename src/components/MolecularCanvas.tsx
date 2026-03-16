import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const TEAL = '0, 212, 170';
const NODE_RADIUS = 5;
const NODE_SPACING = 28;
const CROSS_BOND_INTERVAL = 3;
const DRIFT_SPEED = 0.4;
const BASE_AMPLITUDE = 56;       // 2× previous scale
const BREATHE_AMPLITUDE = 5;     // ±5px oscillation
const BREATHE_PERIOD = 7000;     // ms full cycle
const FREQUENCY = 0.04;          // rad per structural unit

// Halved opacities
const NODE_OPACITY = 0.09;
const STRAND_OPACITY = 0.06;
const RUNG_OPACITY = 0.04;

export const MolecularCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const animRef = useRef<number>(0);
  const totalOffsetRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    startTimeRef.current = performance.now();

    const draw = (timestamp: number) => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      totalOffsetRef.current += isMobile ? DRIFT_SPEED * 0.7 : DRIFT_SPEED;

      const elapsed = timestamp - startTimeRef.current;
      const breathe = BREATHE_AMPLITUDE * Math.sin((elapsed / BREATHE_PERIOD) * Math.PI * 2);
      const amp = (isMobile ? BASE_AMPLITUDE * 0.6 : BASE_AMPLITUDE) + breathe;

      const wrappedOffset = totalOffsetRef.current % NODE_SPACING;
      const diagonalLength = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
      const totalHelixLength = diagonalLength + 6 * NODE_SPACING;
      const nodeCount = Math.ceil(totalHelixLength / NODE_SPACING) + 2;

      // Pivot: slightly left of centre so helix doesn't obscure right-side product vials
      const pivotX = canvas.width * (isMobile ? 0.5 : 0.38);
      const pivotY = canvas.height * 0.55;

      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(-Math.PI / 4); // 45° → bottom-left to top-right drift

      const strand1: { x: number; y: number }[] = [];
      const strand2: { x: number; y: number }[] = [];

      for (let i = 0; i < nodeCount; i++) {
        // localY descends from +half (bottom-left) toward -half (top-right) as offset grows
        const localY = totalHelixLength / 2 - wrappedOffset - i * NODE_SPACING;
        const phase = (totalOffsetRef.current + i * NODE_SPACING) * FREQUENCY;

        strand1.push({ x: amp * Math.sin(phase),           y: localY });
        strand2.push({ x: amp * Math.sin(phase + Math.PI), y: localY });
      }

      ctx.lineWidth = 1;

      // Strand 1 curve
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${TEAL}, ${STRAND_OPACITY})`;
      strand1.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();

      // Strand 2 curve
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${TEAL}, ${STRAND_OPACITY})`;
      strand2.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();

      // Cross-bonds (ladder rungs) at 4% opacity
      ctx.strokeStyle = `rgba(${TEAL}, ${RUNG_OPACITY})`;
      for (let i = 0; i < nodeCount; i += CROSS_BOND_INTERVAL) {
        ctx.beginPath();
        ctx.moveTo(strand1[i].x, strand1[i].y);
        ctx.lineTo(strand2[i].x, strand2[i].y);
        ctx.stroke();
      }

      // Nodes
      ctx.fillStyle = `rgba(${TEAL}, ${NODE_OPACITY})`;
      for (const p of [...strand1, ...strand2]) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};
