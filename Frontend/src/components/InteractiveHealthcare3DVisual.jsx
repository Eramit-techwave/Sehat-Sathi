/**
 * InteractiveHealthcare3DVisual.jsx — Animated Interactive Healthcare Experience
 * Sehat-Sathi Healthcare Ecosystem
 *
 * Implements a lightweight, 60fps HTML5 Canvas 3D particle stage combined with
 * an animated 7-step healthcare flow:
 * Patient Search → Booking → Doctor Acceptance → Video Consultation → Prescription → Payment → Confirmation
 */
import { useState, useEffect, useRef } from "react";
import { Search, Calendar, CheckCircle2, Video, FileText, CreditCard, ShieldCheck, Play, Pause, ChevronRight } from "lucide-react";

const STEPS = [
  {
    id: "search",
    icon: <Search size={22} />,
    title: "Patient Searches Doctor",
    desc: "Search MCI-verified cardiologists, pediatricians, & general physicians near you.",
    badge: "Step 1 of 7 · Real-time Directory",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.08)",
    highlight: "Found 24 Specialist Doctors near New Delhi"
  },
  {
    id: "book",
    icon: <Calendar size={22} />,
    title: "Books Appointment",
    desc: "Selects preferred date, slot, and consultation mode (Online/Clinic).",
    badge: "Step 2 of 7 · Slot Selection",
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.08)",
    highlight: "Slot Selected: Today at 2:30 PM (Fee: ₹500)"
  },
  {
    id: "accept",
    icon: <CheckCircle2 size={22} />,
    title: "Doctor Accepts Booking",
    desc: "Doctor receives instant notification and approves patient consultation.",
    badge: "Step 3 of 7 · Instant Sync",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    highlight: "Dr. Anjali Sharma accepted appointment request"
  },
  {
    id: "video",
    icon: <Video size={22} />,
    title: "Video Consultation",
    desc: "HD WebRTC video stream for symptom review & remote diagnosis.",
    badge: "Step 4 of 7 · Telehealth HD",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    highlight: "Live Encrypted Video Consultation Active"
  },
  {
    id: "rx",
    icon: <FileText size={22} />,
    title: "Digital Prescription Generated",
    desc: "AI & Doctor issue signed prescription with dosage & lab test orders.",
    badge: "Step 5 of 7 · E-Prescription",
    color: "#EC4899",
    bg: "rgba(236,72,153,0.08)",
    highlight: "Rx Issued: Paracetamol 500mg, Amoxicillin"
  },
  {
    id: "pay",
    icon: <CreditCard size={22} />,
    title: "Payment Completed",
    desc: "Instant UPI/Card/Cash payment with 256-bit SSL encryption.",
    badge: "Step 6 of 7 · Instant Checkout",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    highlight: "Payment Confirmed via Razorpay UPI (₹500.00)"
  },
  {
    id: "done",
    icon: <ShieldCheck size={22} />,
    title: "Patient Receives Confirmation",
    desc: "Official payment receipt, invoice PDF & SMS confirmation delivered.",
    badge: "Step 7 of 7 · Complete Journey",
    color: "#059669",
    bg: "rgba(5,150,105,0.08)",
    highlight: "Official Receipt #INV-2026-8924 Generated ✅"
  }
];

export default function InteractiveHealthcare3DVisual() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const canvasRef = useRef(null);

  // Auto step cycle timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % STEPS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 3D Canvas Particle Stage Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth || 500);
    let height = (canvas.height = canvas.offsetHeight || 380);

    const particles = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 + 0.5,
      radius: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.8,
      dy: (Math.random() - 0.5) * 0.8,
    }));

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.01;

      // Draw connecting mesh lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw 3D Orbiting nodes
      particles.forEach((p, idx) => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;

        const pulse = Math.sin(angle + idx) * 1.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.radius + pulse), 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? "rgba(37, 99, 235, 0.4)" : "rgba(16, 185, 129, 0.4)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 500;
      height = canvas.height = canvas.offsetHeight || 380;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const current = STEPS[activeStep];

  return (
    <div
      style={{
        position: "relative", width: "100%", borderRadius: 28,
        overflow: "hidden", background: "linear-gradient(145deg, #0F172A 0%, #1E293B 100%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        minHeight: 420, display: "flex", flexDirection: "column", justifyContent: "space-between",
        color: "#FFFFFF", fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* 3D Background Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 0
        }}
      />

      {/* Top Header Controls Bar */}
      <div style={{
        position: "relative", zIndex: 2, padding: "16px 20px",
        background: "rgba(15, 23, 42, 0.60)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: current.color, boxShadow: `0 0 10px ${current.color}` }} />
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.05em", color: "rgba(255,255,255,0.9)", textTransform: "uppercase" }}>
            Interactive Healthcare Workflow 3D
          </span>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
            color: "#FFF", padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6
          }}
        >
          {isPlaying ? <><Pause size={12} /> Auto-Play On</> : <><Play size={12} /> Play Flow</>}
        </button>
      </div>

      {/* Stage Active Card Showcase */}
      <div style={{ position: "relative", zIndex: 2, padding: "28px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${current.color}44`,
          borderRadius: 20, padding: "24px",
          boxShadow: `0 20px 50px ${current.color}22`,
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {/* Step Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: `${current.color}22`, border: `1px solid ${current.color}55`,
            color: current.color, fontSize: 11, fontWeight: 800,
            padding: "4px 12px", borderRadius: 100, marginBottom: 14
          }}>
            {current.badge}
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: current.color, color: "#FFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 8px 20px ${current.color}55`, flexShrink: 0
            }}>
              {current.icon}
            </div>

            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px", color: "#FFFFFF", letterSpacing: "-0.01em" }}>
                {current.title}
              </h3>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.6 }}>
                {current.desc}
              </p>
            </div>
          </div>

          {/* Highlight Notification Toast */}
          <div style={{
            marginTop: 18, background: "rgba(15,23,42,0.75)",
            border: `1px solid ${current.color}44`, borderRadius: 12,
            padding: "10px 14px", fontSize: 12, fontWeight: 700,
            color: "#E2E8F0", display: "flex", alignItems: "center", gap: 8
          }}>
            <span style={{ color: current.color }}>⚡ Active State:</span>
            <span>{current.highlight}</span>
          </div>
        </div>

      </div>

      {/* Step Navigation Dots Bar */}
      <div style={{
        position: "relative", zIndex: 2, padding: "14px 20px",
        background: "rgba(15, 23, 42, 0.80)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setActiveStep(i); setIsPlaying(false); }}
              style={{
                width: i === activeStep ? 24 : 8, height: 8, borderRadius: 4,
                background: i === activeStep ? current.color : "rgba(255,255,255,0.2)",
                border: "none", cursor: "pointer", transition: "all 0.3s ease"
              }}
              title={s.title}
            />
          ))}
        </div>

        <button
          onClick={() => { setActiveStep((activeStep + 1) % STEPS.length); setIsPlaying(false); }}
          style={{
            background: "transparent", border: "none", color: "#60A5FA",
            fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4
          }}
        >
          Next Step <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
