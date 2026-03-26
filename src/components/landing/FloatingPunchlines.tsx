"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── All the punchy lines ─── */
const ALL_LINES = [
    "While you sleep, your dream job gets applied to. 😴",
    "Stop applying. Start getting interviews. 🎯",
    "Your job search, on autopilot. 🚀",
    "From 'No Replies' → 'Interview Scheduled' 📅",
    "Apply to 1000 jobs without lifting a finger. ✋",
    "One click. Infinite opportunities. 💎",
    "No more 'Easy Apply' burnout. 🔥",
    "You focus on skills. We handle the grind. 💪",
    "Let AI do the boring part. You win the offers. 🏆",
    "The AI co-pilot for your career. 🤖",
    "Automate the hustle. Accelerate your career. ⚡",
    "The future of job hunting is autonomous. 🌐",
    "No more 3AM job application marathons. 🌙",
    "Apply everywhere. Miss nothing. 🎯",
    "Be first. Be seen. Be hired. ✨",
    "Every minute you wait, someone else applies. ⏰",
    "Jobs applied. Interviews unlocked. 🔓",
    "More applications. More interviews. More offers. 📈",
    "Let AI open every door. 🚪",
    "Not a bot. An intelligent job agent. 🧠",
    "AI that thinks before it applies. 💡",
    "Quality applications. Not spam. ✅",
    "Your parents see the offer letter. Not the struggle. ❤️",
    "We apply everywhere, so you don't miss your one big break. 🌟",
    "Your agent applied at 3:05 AM. Be first in line. 🕐",
    "Stop babysitting a Chrome extension. 🛑",
    "Focus on the handshake, not the upload button. 🤝",
    "Turn your rejection folder into an interview calendar. 📆",
    "For $0.99/day, let an elite agent hunt your dream job. 💰",
    "Your career is worth more than a cup of coffee. ☕",
];

/* ─── Bubble type ─── */
interface Bubble {
    id: number;
    text: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;       // font size multiplier
    opacity: number;
    rotation: number;
    rotVel: number;
    tiltX: number;
    tiltY: number;
    wobbleOffset: number;
    wobbleSpeed: number;
}

/* ─── Physics constants ─── */
const BUBBLE_COUNT = 18;
const RISE_SPEED_MIN = 0.15;
const RISE_SPEED_MAX = 0.4;
const DRIFT_RANGE = 0.3;
const REPULSION_RADIUS = 180;
const REPULSION_FORCE = 3;

function createBubble(id: number, canvasW: number, canvasH: number, startFromBottom = false): Bubble {
    const text = ALL_LINES[Math.floor(Math.random() * ALL_LINES.length)];
    return {
        id,
        text,
        x: Math.random() * canvasW,
        y: startFromBottom ? canvasH + 60 + Math.random() * 200 : Math.random() * canvasH,
        vx: (Math.random() - 0.5) * DRIFT_RANGE,
        vy: -(RISE_SPEED_MIN + Math.random() * (RISE_SPEED_MAX - RISE_SPEED_MIN)),
        size: 0.85 + Math.random() * 0.5,
        opacity: 0.35 + Math.random() * 0.2,
        rotation: Math.random() * 10 - 5,
        rotVel: (Math.random() - 0.5) * 0.15,
        tiltX: Math.random() * 8 - 4,
        tiltY: Math.random() * 8 - 4,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.005 + Math.random() * 0.01,
    };
}

export default function FloatingPunchlines() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const bubblesRef = useRef<Bubble[]>([]);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const rafRef = useRef<number>(0);
    const frameRef = useRef(0);
    const [bubbleStates, setBubbleStates] = useState<Bubble[]>([]);

    /* ─── Init bubbles ─── */
    const initBubbles = useCallback(() => {
        const w = window.innerWidth;
        const h = document.documentElement.scrollHeight;
        const bubbles: Bubble[] = [];
        for (let i = 0; i < BUBBLE_COUNT; i++) {
            bubbles.push(createBubble(i, w, h, false));
        }
        bubblesRef.current = bubbles;
        setBubbleStates([...bubbles]);
    }, []);

    useEffect(() => {
        initBubbles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ─── Mouse tracking (page-relative) ─── */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            mouseRef.current = { x: e.pageX, y: e.pageY };
        };
        window.addEventListener("mousemove", handler, { passive: true });
        return () => window.removeEventListener("mousemove", handler);
    }, []);

    /* ─── Animation loop ─── */
    useEffect(() => {
        const loop = () => {
            frameRef.current++;
            const bubbles = bubblesRef.current;
            const mouse = mouseRef.current;
            const pageH = document.documentElement.scrollHeight;
            const pageW = window.innerWidth;

            for (let i = 0; i < bubbles.length; i++) {
                const b = bubbles[i];

                // Wobble (sinusoidal horizontal drift)
                const wobble = Math.sin(frameRef.current * b.wobbleSpeed + b.wobbleOffset) * 0.3;

                // Apply velocity
                b.x += b.vx + wobble;
                b.y += b.vy;
                b.rotation += b.rotVel;

                // Mouse repulsion
                const dx = b.x - mouse.x;
                const dy = b.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < REPULSION_RADIUS && dist > 0) {
                    const force = (1 - dist / REPULSION_RADIUS) * REPULSION_FORCE;
                    b.x += (dx / dist) * force;
                    b.y += (dy / dist) * force;
                    // Slight spin on repulsion
                    b.rotation += force * 0.5;
                    // Temporarily increase opacity when interacted with
                    b.opacity = Math.min(b.opacity + 0.04, 0.85);
                } else {
                    // Fade back to base opacity
                    b.opacity = Math.max(b.opacity - 0.004, 0.30 + (b.id % 5) * 0.04);
                }

                // Wrap horizontally
                if (b.x < -300) b.x = pageW + 200;
                if (b.x > pageW + 300) b.x = -200;

                // Recycle when off-screen top
                if (b.y < -100) {
                    const newBubble = createBubble(b.id, pageW, pageH, true);
                    newBubble.id = b.id;
                    bubbles[i] = newBubble;
                }
            }

            // Only update React state every 2 frames for performance
            if (frameRef.current % 2 === 0) {
                setBubbleStates(bubbles.map((b) => ({ ...b })));
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    /* ─── Resize handler ─── */
    useEffect(() => {
        const handleResize = () => {
            initBubbles();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [initBubbles]);

    return (
        <div
            ref={canvasRef}
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ zIndex: 1 }}
            aria-hidden="true"
        >
            {bubbleStates.map((bubble) => (
                <div
                    key={bubble.id}
                    className="absolute whitespace-nowrap select-none"
                    style={{
                        left: `${bubble.x}px`,
                        top: `${bubble.y}px`,
                        opacity: bubble.opacity,
                        fontSize: `${bubble.size * 15}px`,
                        transform: `
              rotate(${bubble.rotation}deg)
              perspective(600px)
              rotateX(${bubble.tiltX}deg)
              rotateY(${bubble.tiltY}deg)
              translateZ(0)
            `,
                        willChange: "transform, opacity, left, top",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        letterSpacing: "0.01em",
                        background: "linear-gradient(135deg, rgba(66,133,244,0.08), rgba(52,168,83,0.06), rgba(251,188,5,0.05))",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(66,133,244,0.15)",
                        borderRadius: "999px",
                        padding: "10px 22px",
                        color: "rgba(60,64,67,0.7)",
                        textShadow: "none",
                        boxShadow: "0 2px 12px rgba(66,133,244,0.06), 0 4px 24px rgba(52,168,83,0.04)",
                        transition: "opacity 0.3s ease",
                    }}
                >
                    {bubble.text}
                </div>
            ))}
        </div>
    );
}
