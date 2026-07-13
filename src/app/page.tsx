"use client";

// ─────────────────────────────────────────────────────────────────────────────
// APP CONFIG — Edit this array to add / remove your own launchers.
// Each entry: { name, url, icon (Lucide component), color (neon glow hex) }
// ─────────────────────────────────────────────────────────────────────────────
import {
  Music2,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

interface AppNode {
  name: string;
  url: string;
  Icon: LucideIcon;
  color: string; // neon glow colour
}

const APPS: AppNode[] = [
  { name: "Unterholz",    url: "https://oryon.younan.de/unterholz",    Icon: Music2,        color: "#4ade80" },
  { name: "Hermes",    url: "https://oryon.younan.de/hermes",         Icon: MessageCircle, color: "#818cf8" },
];

// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import PixelGrid from "./components/PixelGrid";

// ─────────────────────────────────────────────────────────────────────────────
// Retro CRT scanlines overlay
// ─────────────────────────────────────────────────────────────────────────────
function ScanlineOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 2,
        background:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)",
        mixBlendMode: "multiply",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CRT vignette border
// ─────────────────────────────────────────────────────────────────────────────
function CRTVignette() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 3,
        background:
          "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Centerpiece — pixelated wordmark
// ─────────────────────────────────────────────────────────────────────────────
function PixelWordmark() {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ zIndex: 10 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      {/* Glow backdrop */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 350,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: 0,
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main card */}
      <motion.div
        className="relative flex flex-col items-center justify-center overflow-hidden select-none"
        style={{
          width: "min(460px, 90vw)",
          height: "min(240px, 32vw + 80px)",
          borderRadius: 0,
          background: "rgba(0, 0, 0, 0.65)",
          border: "2px solid rgba(255, 255, 255, 0.12)",
          boxShadow:
            "0 0 60px rgba(255,255,255,0.06), inset 0 0 80px rgba(0,0,0,0.5)",
          padding: "clamp(20px, 4vw, 40px) clamp(24px, 6vw, 56px)",
          imageRendering: "pixelated",
        }}
        animate={{ scale: [1, 1.008, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Top pixel border */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: 2,
            background:
              "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 80%, transparent 95%)",
          }}
        />

        {/* Bottom pixel border */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: 2,
            background:
              "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 80%, transparent 95%)",
          }}
        />

        {/* Wordmark */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        >
          {/* Blinking cursor accent */}
          <div className="flex items-center gap-3">
            <motion.span
              style={{
                width: 8,
                height: 8,
                background: "rgba(255,255,255,0.8)",
                display: "inline-block",
              }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span
              style={{
                fontFamily: "var(--font-geist-mono), 'Courier New', monospace",
                fontSize: "clamp(32px, 7vw, 48px)",
                fontWeight: 700,
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.95)",
                textShadow:
                  "0 0 20px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.15)",
                lineHeight: 1,
                imageRendering: "pixelated",
              }}
            >
              YOUNAN
            </span>
            <motion.span
              style={{
                width: 8,
                height: 8,
                background: "rgba(255,255,255,0.8)",
                display: "inline-block",
              }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            />
          </div>

          {/* Pixel divider */}
          <div
            style={{
              display: "flex",
              gap: 4,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                style={{
                  width: 4,
                  height: 2,
                  background: "rgba(255,255,255,0.4)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.03, duration: 0.3 }}
              />
            ))}
          </div>

          {/* Subtitle */}
          <motion.span
            style={{
              fontFamily: "var(--font-geist-mono), 'Courier New', monospace",
              fontSize: "clamp(9px, 1.3vw, 13px)",
              fontWeight: 400,
              letterSpacing: "0.6em",
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1,
            }}
            animate={{ opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            PORTAL
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App launcher tile — retro pixel style
// ─────────────────────────────────────────────────────────────────────────────
function AppTile({
  app,
  index,
}: {
  app: AppNode;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const { Icon, name, url, color } = app;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 + index * 0.15, duration: 0.6, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "16px 20px",
        background: hovered
          ? "rgba(255,255,255,0.08)"
          : "rgba(0, 0, 0, 0.55)",
        border: hovered
          ? `2px solid ${color}99`
          : "2px solid rgba(255,255,255,0.08)",
        boxShadow: hovered
          ? `0 0 30px ${color}33, inset 0 0 20px ${color}11`
          : "none",
        transition: "all 0.2s ease",
        cursor: "none",
        textDecoration: "none",
        minWidth: 90,
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Corner pixels */}
      {hovered && (
        <>
          <span style={{ position: "absolute", top: 3, left: 3, width: 4, height: 4, background: color, opacity: 0.7 }} />
          <span style={{ position: "absolute", top: 3, right: 3, width: 4, height: 4, background: color, opacity: 0.7 }} />
          <span style={{ position: "absolute", bottom: 3, left: 3, width: 4, height: 4, background: color, opacity: 0.7 }} />
          <span style={{ position: "absolute", bottom: 3, right: 3, width: 4, height: 4, background: color, opacity: 0.7 }} />
        </>
      )}

      <Icon
        size={22}
        style={{
          color: hovered ? color : "rgba(255,255,255,0.5)",
          filter: hovered ? `drop-shadow(0 0 10px ${color})` : "none",
          transition: "all 0.2s ease",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-geist-mono), 'Courier New', monospace",
          fontSize: 11,
          letterSpacing: "0.08em",
          color: hovered ? color : "rgba(255,255,255,0.4)",
          transition: "color 0.2s ease",
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}
      >
        {name}
      </span>
    </motion.a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom cursor — crosshair + trailing square ring
// ─────────────────────────────────────────────────────────────────────────────
function PixelCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
    };

    let ringX = 0, ringY = 0;
    let targetX = 0, targetY = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const moveRing = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    let rafId: number;
    const tick = () => {
      ringX = lerp(ringX, targetX, 0.12);
      ringY = lerp(ringY, targetY, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = ringX + "px";
        ringRef.current.style.top = ringY + "px";
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousemove", moveRing);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousemove", moveRing);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div id="cursor" ref={cursorRef} />
      <div id="cursor-ring" ref={ringRef} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated ASCII-art matrix rain (subtle)
// ─────────────────────────────────────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01アイウエオカキクケコ█▓▒░".split("");
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    // Initialize with random starting positions
    for (let i = 0; i < drops.length; i++) {
      drops[i] = Math.random() * -100;
    }

    const interval = setInterval(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Only render some columns for subtlety
        if (i % 4 !== 0) continue;

        const char = chars[Math.floor(Math.random() * chars.length)];
        const alpha = 0.03 + Math.random() * 0.04;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }
    }, 80);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, opacity: 0.5 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function StartDashboard() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Pixel cursor */}
      <PixelCursor />

      {/* Interactive pixel grid background */}
      <PixelGrid
        cellSize={16}
        brushRadius={2}
        gap={2}
        decayRate={0.022}
      />

      {/* Matrix rain (very subtle) */}
      <MatrixRain />

      {/* CRT scanline overlay */}
      <ScanlineOverlay />

      {/* CRT vignette */}
      <CRTVignette />

      {/* Centerpiece wordmark */}
      <PixelWordmark />

      {/* App launcher tiles — positioned below center */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 flex gap-4"
        style={{
          bottom: "clamp(80px, 15vh, 140px)",
          zIndex: 10,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        {APPS.map((app, i) => (
          <AppTile key={app.name} app={app} index={i} />
        ))}
      </motion.div>

      {/* Bottom status bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between"
        style={{
          background: "rgba(0, 0, 0, 0.85)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          zIndex: 20,
          padding: "8px clamp(16px, 4vw, 32px)",
        }}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
      >
        <span
          style={{
            fontFamily: "var(--font-geist-mono), 'Courier New', monospace",
            fontSize: "clamp(9px, 1.1vw, 11px)",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.12em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {">"} YOUNAN PORTAL · {APPS.length} NODES ACTIVE
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.span
            style={{
              width: 6,
              height: 6,
              background: "#4ade80",
              display: "inline-block",
            }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span
            style={{
              fontFamily: "var(--font-geist-mono), 'Courier New', monospace",
              fontSize: "clamp(9px, 1.1vw, 11px)",
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.12em",
              flexShrink: 0,
            }}
          >
            ONLINE
          </span>
        </div>
      </motion.div>
    </div>
  );
}
