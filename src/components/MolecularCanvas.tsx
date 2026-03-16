import { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const CONNECTION_DISTANCE = 140;
const NODE_RADIUS = 4;
const SPEED = 0.35;

export const MolecularCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const initNodes = () => {
      const count = isMobile ? 28 : 58;
      nodesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED * 2,
        vy: (Math.random() - 0.5) * SPEED * 2,
        r: NODE_RADIUS + Math.random() * 2,
      }));
    };

    resize();
    initNodes();

    const handleResize = () => {
      resize();
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;

      // Update positions
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Soft bounce off edges
        if (node.x < -20) node.x = canvas.width + 20;
        if (node.x > canvas.width + 20) node.x = -20;
        if (node.y < -20) node.y = canvas.height + 20;
        if (node.y > canvas.height + 20) node.y = -20;
      }

      // Draw bonds
      ctx.strokeStyle = 'rgba(0, 212, 170, 0.10)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.12;
            ctx.strokeStyle = `rgba(0, 212, 170, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 170, 0.18)';
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
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
