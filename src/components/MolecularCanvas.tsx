import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const TEAL = '0, 212, 170';
const NODE_RADIUS = 3.5;
const NODE_SPACING = 24;        // vertical px between helix nodes
const CROSS_BOND_INTERVAL = 3;  // draw a rung every N nodes
const DRIFT_SPEED = 0.4;        // px per frame upward
const BASE_AMPLITUDE = 28;      // base sine amplitude in px
const BREATHE_AMPLITUDE = 5;    // ±px oscillation
const BREATHE_PERIOD = 7000;    // ms for one full breathe cycle
const FREQUENCY = 0.05;         // sine frequency (rad/px structural unit)

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

    const drawHelix = (
      centerX: number,
      amp: number,
      nodeCount: number,
      wrappedOffset: number,
    ) => {
      const strand1: { x: number; y: number }[] = [];
      const strand2: { x: number; y: number }[] = [];

      for (let i = 0; i < nodeCount; i++) {
        const y = canvas.height + NODE_SPACING - wrappedOffset - i * NODE_SPACING;
        // Phase driven by total accumulated offset → helix scrolls upward seamlessly
        const phase = (totalOffsetRef.current + i * NODE_SPACING) * FREQUENCY;

        strand1.push({ x: centerX + amp * Math.sin(phase), y });
        strand2.push({ x: centerX + amp * Math.sin(phase + Math.PI), y });
      }

      ctx.lineWidth = 1;

      // Strand 1 curve
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${TEAL}, 0.22)`;
      strand1.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();

      // Strand 2 curve
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${TEAL}, 0.22)`;
      strand2.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();

      // Cross-bonds (ladder rungs) at 9% opacity
      ctx.strokeStyle = `rgba(${TEAL}, 0.09)`;
      for (let i = 0; i < nodeCount; i += CROSS_BOND_INTERVAL) {
        ctx.beginPath();
        ctx.moveTo(strand1[i].x, strand1[i].y);
        ctx.lineTo(strand2[i].x, strand2[i].y);
        ctx.stroke();
      }

      // Nodes on both strands
      ctx.fillStyle = `rgba(${TEAL}, 0.22)`;
      for (const p of [...strand1, ...strand2]) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw = (timestamp: number) => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      totalOffsetRef.current += DRIFT_SPEED;

      const elapsed = timestamp - startTimeRef.current;
      const breathe = BREATHE_AMPLITUDE * Math.sin((elapsed / BREATHE_PERIOD) * Math.PI * 2);
      const amp = BASE_AMPLITUDE + breathe;

      const wrappedOffset = totalOffsetRef.current % NODE_SPACING;
      const nodeCount = Math.ceil(canvas.height / NODE_SPACING) + 3;

      if (isMobile) {
        // Single subtle column on far right, away from content
        drawHelix(canvas.width * 0.88, amp * 0.7, nodeCount, wrappedOffset);
      } else {
        // Left third and right third — centre stays clear for headline + product
        drawHelix(canvas.width * 0.15, amp, nodeCount, wrappedOffset);
        drawHelix(canvas.width * 0.85, amp, nodeCount, wrappedOffset);
      }

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
