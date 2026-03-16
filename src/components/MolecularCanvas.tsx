import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const TEAL = '0, 212, 170';
const NODE_RADIUS = 5;
const N_NODES = 80;             // fixed node count, evenly distributed along path
const N_CYCLES = 5;             // complete sine-wave cycles across the full helix length
const DRIFT_PX_PER_MS = 0.024; // ≈ 0.4 px @ 60 fps
const BREATHE_AMPLITUDE = 5;   // ±px oscillation
const BREATHE_PERIOD = 7000;   // ms full breathe cycle
const BASE_AMPLITUDE = 78;     // sine amplitude (px)

const NODE_OPACITY   = 0.132;
const STRAND_OPACITY = 0.086;
const RUNG_OPACITY   = 0.058;
const CROSS_BOND_EVERY = 3;    // draw a rung every N nodes

export const MolecularCanvas = () => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const isMobile     = useIsMobile();
  const animRef      = useRef<number>(0);
  const accOffset    = useRef<number>(0);   // accumulated path offset (px)
  const lastTs       = useRef<number | null>(null);
  const startTs      = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Resync on tab-focus to prevent jump catch-up
    const onVisibility = () => {
      if (document.visibilityState === 'visible') lastTs.current = null;
    };
    document.addEventListener('visibilitychange', onVisibility);

    startTs.current = performance.now();

    const tick = (ts: number) => {
      // First tick after (re)focus: skip delta to avoid jump
      if (lastTs.current === null) {
        lastTs.current = ts;
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = ts - lastTs.current;
      lastTs.current = ts;

      const speed = isMobile ? DRIFT_PX_PER_MS * 0.7 : DRIFT_PX_PER_MS;

      // Geometry — recalculated each frame so resize is always respected
      const diag = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
      const helixLen = diag * 1.25;              // total path length (with off-screen buffer)
      const spacing  = helixLen / N_NODES;       // even gap between nodes
      // FREQUENCY chosen so exactly N_CYCLES full sine cycles fit in helixLen
      // → sine value at pathPos=0 equals sine value at pathPos=helixLen (seamless wrap)
      const freq = (N_CYCLES * 2 * Math.PI) / helixLen;

      // Advance offset; wrap within helixLen for modulo continuity
      accOffset.current = (accOffset.current + speed * delta) % helixLen;

      // Breathing amplitude
      const elapsed = ts - startTs.current;
      const amp = (isMobile ? BASE_AMPLITUDE * 0.6 : BASE_AMPLITUDE)
                  + BREATHE_AMPLITUDE * Math.sin((elapsed / BREATHE_PERIOD) * Math.PI * 2);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pivotX = canvas.width  * (isMobile ? 0.55 : 0.43);
      const pivotY = canvas.height * 0.55;

      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(-Math.PI / 4);

      const nodeCount = isMobile ? Math.floor(N_NODES * 0.5) : N_NODES;

      // Build node arrays — each node's pathPos is offset by i * spacing
      // so nodes are always evenly distributed regardless of accOffset
      type Pt = { x: number; y: number };
      const s1: Pt[] = [];
      const s2: Pt[] = [];

      for (let i = 0; i < nodeCount; i++) {
        const pathPos = (accOffset.current + i * spacing) % helixLen;
        const localY  = pathPos - helixLen / 2;   // centre the helix on the pivot
        const phase   = pathPos * freq;

        s1.push({ x:  amp * Math.sin(phase),           y: localY });
        s2.push({ x:  amp * Math.sin(phase + Math.PI), y: localY });
      }

      // Helper: draw a strand as a polyline, lifting the pen at the one
      // wrap point (where localY jumps by ~helixLen) so no diagonal flash occurs
      const drawStrand = (pts: Pt[]) => {
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          const isWrap = i > 0 && Math.abs(pts[i].y - pts[i - 1].y) > helixLen * 0.4;
          if (i === 0 || isWrap) ctx.moveTo(pts[i].x, pts[i].y);
          else ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
      };

      ctx.lineWidth = 1;

      ctx.strokeStyle = `rgba(${TEAL}, ${STRAND_OPACITY})`;
      drawStrand(s1);
      drawStrand(s2);

      // Cross-bond rungs — skip the wrap node to avoid a diagonal flash
      ctx.strokeStyle = `rgba(${TEAL}, ${RUNG_OPACITY})`;
      for (let i = 0; i < nodeCount; i += CROSS_BOND_EVERY) {
        const isWrap = i > 0 && Math.abs(s1[i].y - s1[i - 1].y) > helixLen * 0.4;
        if (isWrap) continue;
        ctx.beginPath();
        ctx.moveTo(s1[i].x, s1[i].y);
        ctx.lineTo(s2[i].x, s2[i].y);
        ctx.stroke();
      }

      // Nodes
      ctx.fillStyle = `rgba(${TEAL}, ${NODE_OPACITY})`;
      for (const p of [...s1, ...s2]) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
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
