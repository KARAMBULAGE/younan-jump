"use client";

import { useEffect, useRef, useCallback } from "react";

interface PixelGridProps {
  /** Size of each pixel cell in px */
  cellSize?: number;
  /** Radius (in cells) around cursor that gets heated */
  brushRadius?: number;
  /** Gap between cells in px */
  gap?: number;
  /** How fast cells cool down (0-1 per frame, lower = longer trail) */
  decayRate?: number;
}

export default function PixelGrid({
  cellSize = 16,
  brushRadius = 2,
  gap = 2,
  decayRate = 0.025,
}: PixelGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const prevMouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const dprRef = useRef(1);
  const heatMapRef = useRef<Float32Array | null>(null);
  const gridInfoRef = useRef({ cols: 0, rows: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const dpr = dprRef.current;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const step = cellSize + gap;
    const cols = Math.ceil(w / step) + 1;
    const rows = Math.ceil(h / step) + 1;

    // Reallocate heat map if grid size changed
    if (cols !== gridInfoRef.current.cols || rows !== gridInfoRef.current.rows) {
      heatMapRef.current = new Float32Array(cols * rows);
      gridInfoRef.current = { cols, rows };
    }

    const heat = heatMapRef.current!;

    // --- Heat cells along mouse path ---
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const pmx = prevMouseRef.current.x;
    const pmy = prevMouseRef.current.y;

    if (mx > -9000) {
      // Interpolate between previous and current mouse position
      const dx = mx - pmx;
      const dy = my - pmy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.ceil(dist / (step * 0.5)));

      for (let s = 0; s <= steps; s++) {
        const t = steps === 0 ? 1 : s / steps;
        const px = pmx + dx * t;
        const py = pmy + dy * t;

        // Which cell is the cursor over?
        const centerCol = Math.floor(px / step);
        const centerRow = Math.floor(py / step);

        // Heat cells in a brush area
        for (let dr = -brushRadius; dr <= brushRadius; dr++) {
          for (let dc = -brushRadius; dc <= brushRadius; dc++) {
            const c = centerCol + dc;
            const r = centerRow + dr;
            if (c < 0 || c >= cols || r < 0 || r >= rows) continue;

            const distFromCenter = Math.sqrt(dc * dc + dr * dr);
            if (distFromCenter > brushRadius) continue;

            // Intensity falls off from center
            const intensity = 1 - distFromCenter / (brushRadius + 0.5);
            const idx = r * cols + c;
            // Set to max of current heat and new heat (don't reduce)
            heat[idx] = Math.min(1, Math.max(heat[idx], intensity * intensity));
          }
        }
      }
    }

    prevMouseRef.current = { x: mx, y: my };

    // --- Draw ---
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(dpr, dpr);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const h = heat[idx];

        const x = col * step;
        const y = row * step;

        if (h < 0.005) {
          // Fully cooled — very dark pixel
          ctx.fillStyle = "rgb(10, 10, 14)";
          ctx.fillRect(x, y, cellSize, cellSize);
        } else {
          // Lit pixel — white to violet gradient based on heat
          if (h > 0.6) {
            // Hot: white
            const brightness = Math.round(180 + 75 * h);
            ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
          } else if (h > 0.25) {
            // Warm: cool white / light violet
            const r = Math.round(139 + (255 - 139) * h);
            const g = Math.round(92 + (255 - 92) * h);
            const b = Math.round(200 + (255 - 200) * h);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(h * 1.2).toFixed(3)})`;
          } else {
            // Cooling: deep violet
            const alpha = h * 2.5;
            ctx.fillStyle = `rgba(100, 60, 180, ${alpha.toFixed(3)})`;
          }

          ctx.fillRect(x, y, cellSize, cellSize);

          // Scanline on bright pixels
          if (h > 0.4) {
            ctx.fillStyle = `rgba(0, 0, 0, ${(0.15 * h).toFixed(3)})`;
            ctx.fillRect(x, y + cellSize * 0.48, cellSize, 1);
          }
        }

        // Decay heat
        heat[idx] = Math.max(0, h - decayRate * (0.5 + h * 0.5));
      }
    }

    ctx.restore();

    rafRef.current = requestAnimationFrame(draw);
  }, [cellSize, gap, brushRadius, decayRate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      // Force heat map reallocation on next frame
      gridInfoRef.current = { cols: 0, rows: 0 };
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        display: "block",
        imageRendering: "pixelated",
      }}
    />
  );
}
