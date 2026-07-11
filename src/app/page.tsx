"use client";

// ─────────────────────────────────────────────────────────────────────────────
// APP CONFIG — Edit this array to add / remove your own launchers.
// Each entry: { name, url, icon (Lucide component), color (neon glow hex) }
// ─────────────────────────────────────────────────────────────────────────────
import {
  Globe2,
  Code2,
  Music2,
  Film,
  MessageCircle,
  ShoppingBag,
  Mail,
  Globe,
  GitBranch,
  PenTool,
  LayoutDashboard,
  BookOpen,
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

// Seeded deterministic positions — kept away from edges so nodes don't clip on mobile
const NODE_POSITIONS: { x: string; y: string }[] = [
  { x: "14%",  y: "18%" },
  { x: "76%",  y: "14%" },
  { x: "10%",  y: "52%" },
  { x: "80%",  y: "46%" },
  { x: "22%",  y: "76%" },
  { x: "68%",  y: "78%" },
  { x: "44%",  y: "10%"  },
  { x: "46%",  y: "84%" },
  { x: "62%",  y: "24%" },
  { x: "30%",  y: "38%" },
  { x: "74%",  y: "62%" },
  { x: "20%",  y: "66%" },
];

// Per-node float configuration (deterministic)
const FLOAT_CONFIGS = [
  { dx: 14, dy: 10, dur: 5.2 },
  { dx: -10, dy: 14, dur: 6.1 },
  { dx: 12, dy: -12, dur: 4.8 },
  { dx: -14, dy: -8, dur: 5.9 },
  { dx: 8,  dy: 16, dur: 6.5 },
  { dx: -12, dy: 10, dur: 5.0 },
  { dx: 16, dy: -6, dur: 7.0 },
  { dx: -8, dy: -14, dur: 4.5 },
  { dx: 10, dy: 12, dur: 5.6 },
  { dx: -16, dy: 6, dur: 6.8 },
  { dx: 6,  dy: -16, dur: 5.3 },
  { dx: -10, dy: -10, dur: 6.2 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Animated mesh-gradient background
// ─────────────────────────────────────────────────────────────────────────────
function MeshBackground({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at ${30 + mouseX * 20}% ${20 + mouseY * 15}%,
            rgba(88, 28, 235, 0.35) 0%, transparent 60%),
          radial-gradient(ellipse 70% 55% at ${70 - mouseX * 18}% ${75 - mouseY * 12}%,
            rgba(16, 185, 129, 0.20) 0%, transparent 60%),
          radial-gradient(ellipse 90% 70% at ${50 + mouseX * 10}% ${50 + mouseY * 10}%,
            rgba(99, 102, 241, 0.15) 0%, transparent 65%),
          radial-gradient(ellipse 60% 50% at ${20 - mouseX * 8}% ${80 - mouseY * 8}%,
            rgba(236, 72, 153, 0.12) 0%, transparent 55%),
          #05060f
        `,
        transition: "background 0.12s ease-out",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Constellation lines drawn on a canvas
// ─────────────────────────────────────────────────────────────────────────────
function ConstellationLines({
  positions,
}: {
  positions: { x: number; y: number }[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || positions.length === 0) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines between nodes that are within ~380px of each other
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 380) {
          const opacity = (1 - dist / 380) * 0.18;
          ctx.beginPath();
          ctx.moveTo(positions[i].x, positions[i].y);
          ctx.lineTo(positions[j].x, positions[j].y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }, [positions]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Centerpiece orb
// ─────────────────────────────────────────────────────────────────────────────
function Orb({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const tx = (mouseX - 0.5) * -18;
  const ty = (mouseY - 0.5) * -18;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ zIndex: 10 }}
      animate={{ x: tx, y: ty }}
      transition={{ type: "spring", stiffness: 55, damping: 22 }}
    >
      {/* Ambient glow halo — same violet as node hover glows */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 560,
          height: 320,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: 72,
          background:
            "radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)",
          filter: "blur(32px)",
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main glass card — same language as AppNode */}
      {/* Entrance fade-in wrapper (one-shot, no repeat) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
      {/* Breathing scale wrapper (loops independently) */}
      <motion.div
        className="relative flex flex-col items-center justify-center overflow-hidden select-none"
        style={{
          width: "min(420px, 88vw)",
          height: "min(220px, 28vw + 80px)",
          borderRadius: "clamp(20px, 4vw, 36px)",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          border: "1px solid rgba(139,92,246,0.35)",
          boxShadow:
            "0 0 48px rgba(139,92,246,0.40), 0 0 120px rgba(139,92,246,0.14), inset 0 1px 0 rgba(255,255,255,0.10)",
          padding: "clamp(20px, 4vw, 40px) clamp(24px, 6vw, 56px)",
        }}
        animate={{ scale: [1, 1.018, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Subtle top-edge shimmer — mirrors the inset border nodes use */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent 10%, rgba(167,139,250,0.6) 50%, transparent 90%)",
          }}
        />

        {/* Wordmark stack */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: "easeOut" }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              fontSize: "clamp(28px, 6vw, 42px)",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.95)",
              textShadow:
                "0 0 24px rgba(167,139,250,0.7), 0 0 60px rgba(139,92,246,0.35)",
              lineHeight: 1,
            }}
          >
            YOUNAN
          </span>

          {/* Rule */}
          <div
            style={{
              width: "clamp(100px, 20vw, 160px)",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(139,92,246,0.7), transparent)",
            }}
          />

          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "clamp(9px, 1.2vw, 12px)",
              fontWeight: 400,
              letterSpacing: "0.55em",
              color: "rgba(167,139,250,0.65)",
              lineHeight: 1,
            }}
          >
            PORTAL
          </span>
        </motion.div>
      </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single App Launcher Node
// ─────────────────────────────────────────────────────────────────────────────
function AppNode({
  app,
  position,
  floatCfg,
  index,
  onMount,
}: {
  app: AppNode;
  position: { x: string; y: string };
  floatCfg: { dx: number; dy: number; dur: number };
  index: number;
  onMount: (index: number, x: number, y: number) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const { Icon, name, url, color } = app;

  // Report DOM position to parent for constellation lines
  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    onMount(index, rect.left + rect.width / 2, rect.top + rect.height / 2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      ref={nodeRef}
      className="absolute"
      style={{ left: position.x, top: position.y, zIndex: 5 }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={
        hovered
          ? { opacity: 1, scale: 1.1, x: 0, y: 0 }
          : {
              opacity: 1,
              scale: 1,
              x: [0, floatCfg.dx, -floatCfg.dx * 0.6, floatCfg.dx * 0.3, 0],
              y: [0, floatCfg.dy * 0.5, floatCfg.dy, floatCfg.dy * 0.3, 0],
            }
      }
      transition={
        hovered
          ? { type: "spring", stiffness: 400, damping: 25 }
          : {
              opacity: { duration: 0.6, delay: index * 0.08 },
              scale: { duration: 0.6, delay: index * 0.08 },
              x: {
                duration: floatCfg.dur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.35,
              },
              y: {
                duration: floatCfg.dur * 1.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.35 + 0.2,
              },
            }
      }
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        <motion.div
          className="group flex flex-col items-center gap-2 p-3 rounded-2xl select-none"
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          style={{
            cursor: "none",
            background: hovered
              ? `rgba(255,255,255,0.10)`
              : `rgba(255,255,255,0.04)`,
            backdropFilter: "blur(18px) saturate(200%)",
            WebkitBackdropFilter: "blur(18px) saturate(200%)",
            border: hovered
              ? `1px solid ${color}88`
              : "1px solid rgba(255,255,255,0.09)",
            boxShadow: hovered
              ? `0 0 22px ${color}55, 0 0 60px ${color}22, inset 0 0 20px ${color}11`
              : "0 4px 24px rgba(0,0,0,0.4)",
            transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s",
            width: "clamp(64px, 8vw, 88px)",
            minWidth: 64,
          }}
        >
          {/* Icon glow halo */}
          <div
            className="relative flex items-center justify-center rounded-xl"
            style={{
              width: "clamp(36px, 5vw, 48px)",
              height: "clamp(36px, 5vw, 48px)",
              background: hovered
                ? `radial-gradient(circle, ${color}33 0%, transparent 70%)`
                : "transparent",
              transition: "background 0.25s",
            }}
          >
            <Icon
              size={20}
              style={{
                color: hovered ? color : "rgba(255,255,255,0.7)",
                filter: hovered ? `drop-shadow(0 0 8px ${color})` : "none",
                transition: "color 0.25s, filter 0.25s",
              }}
            />
          </div>
          {/* Name label */}
          <span
            style={{
              fontSize: "clamp(9px, 1.1vw, 11px)",
              fontFamily: "var(--font-geist-mono), monospace",
              letterSpacing: "0.06em",
              color: hovered ? color : "rgba(255,255,255,0.55)",
              transition: "color 0.25s",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </span>
        </motion.div>
      </a>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom cursor
// ─────────────────────────────────────────────────────────────────────────────
function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top  = e.clientY + "px";
      }
    };

    // Ring follows with a small delay via CSS transition on transform
    let ringX = 0, ringY = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let targetX = 0, targetY = 0;

    const moveRing = (e: MouseEvent) => { targetX = e.clientX; targetY = e.clientY; };

    let rafId: number;
    const tick = () => {
      ringX = lerp(ringX, targetX, 0.12);
      ringY = lerp(ringY, targetY, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = ringX + "px";
        ringRef.current.style.top  = ringY + "px";
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
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function StartDashboard() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [nodePositions, setNodePositions] = useState<{ x: number; y: number }[]>([]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouse({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  }, []);

  const handleNodeMount = useCallback((index: number, x: number, y: number) => {
    setNodePositions((prev) => {
      const next = [...prev];
      next[index] = { x, y };
      return next;
    });
  }, []);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Custom cursor */}
      <CustomCursor />

      {/* Animated mesh background */}
      <MeshBackground mouseX={mouse.x} mouseY={mouse.y} />

      {/* Fine noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "160px 160px",
          zIndex: 1,
          opacity: 0.4,
        }}
      />

      {/* Constellation lines */}
      <ConstellationLines positions={nodePositions} />

      {/* App launchers */}
      {APPS.map((app, i) => (
        <AppNode
          key={app.name}
          app={app}
          position={NODE_POSITIONS[i % NODE_POSITIONS.length]}
          floatCfg={FLOAT_CONFIGS[i % FLOAT_CONFIGS.length]}
          index={i}
          onMount={handleNodeMount}
        />
      ))}

      {/* Centerpiece orb */}
      <Orb mouseX={mouse.x} mouseY={mouse.y} />

      {/* Bottom status bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-between"
        style={{
          background: "rgba(5,6,15,0.7)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          zIndex: 20,
          padding: "10px clamp(16px, 4vw, 32px)",
          gap: 8,
        }}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
      >
        <span
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "clamp(9px, 1.1vw, 11px)",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.1em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          YOUNAN PORTAL · {APPS.length} NODES ACTIVE
        </span>
        <span
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "clamp(9px, 1.1vw, 11px)",
            color: "rgba(139,92,246,0.5)",
            letterSpacing: "0.1em",
            flexShrink: 0,
          }}
        >
          ◉ ONLINE
        </span>
      </motion.div>
    </div>
  );
}
