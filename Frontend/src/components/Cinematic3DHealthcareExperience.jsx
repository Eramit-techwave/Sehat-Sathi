/**
 * Cinematic3DHealthcareExperience.jsx — Apple/Google-grade 5-Scene 3D Storytelling Hero
 * Sehat-Sathi Healthcare Ecosystem
 *
 * Cinematic 5-Scene Story Sequence (1-2 Minute Auto/Manual Flow):
 * Scene 1 – The Real Problem: Overcrowded Indian hospital, OPD queues, senior citizens, "Doctor kab milenge?"
 * Scene 2 – Hidden Problem: Nearby doctor sitting idle, empty OPD slots hidden from patients
 * Scene 3 – Sehat-Sathi Appears: Logo transition, location/fee/specialty filters, instant booking & receipt
 * Scene 4 – Complete Journey: Zero-wait reception, doctor consultation, e-prescription, AI report explanation
 * Scene 5 – Final Vision: Simplified healthcare, happy patient, doctor & hospital, "Sehat-Sathi: One Platform. Complete Healthcare."
 */
import { useState, useEffect, useRef } from "react";
import {
  Users, Clock, AlertTriangle, Search, CheckCircle2, Video,
  FileText, ShieldCheck, Heart, Play, Pause, RotateCcw,
  ChevronRight, ChevronLeft, Sparkles, Building2, Stethoscope, Bot, IndianRupee
} from "lucide-react";

const SCENES = [
  {
    id: 1,
    title: "Scene 1: The Real Problem",
    subtitle: "Overcrowded Hospitals & Endless OPD Queues",
    badge: "Healthcare Crisis in India",
    color: "#EF4444",
    bgGradient: "linear-gradient(135deg, #1E1B1B 0%, #3B1616 100%)",
    icon: <Users size={24} />,
    dialogue: "“Doctor kab milenge? Waiting for 4 hours in queue...”",
    narrative: "Crowded Indian hospital OPDs. Senior citizens standing for hours, crying children, pregnant women waiting for tokens. Reception overloaded, slow manual registers, and constant confusion.",
    stats: [
      { label: "AVG OPD WAIT TIME", value: "3.5 Hours" },
      { label: "QUEUE FRUSTRATION", value: "89% Patients" },
      { label: "MANUAL TOKENS", value: "Paper Records" }
    ],
    visualElements: [
      "🏛️ Overcrowded City Hospital",
      "👴 Senior Citizens Waiting",
      "📋 Paper Tokens & Lost Receipts",
      "🚨 Reception System Overloaded"
    ]
  },
  {
    id: 2,
    title: "Scene 2: The Hidden Problem",
    subtitle: "Idle Nearby Doctors & Empty OPD Slots",
    badge: "Information Asymmetry",
    color: "#F59E0B",
    bgGradient: "linear-gradient(135deg, #1F1B12 0%, #3D2D10 100%)",
    icon: <Clock size={24} />,
    dialogue: "“Available slots exist just 1 km away, but patients don't know.”",
    narrative: "Nearby doctors sitting in empty clinics. OPD beds and appointment slots remain completely unused because patients lack real-time availability discovery.",
    stats: [
      { label: "UNUSED DOCTOR SLOTS", value: "45% Daily" },
      { label: "LOCAL DISCOVERY", value: "0% Transparency" },
      { label: "IDLE OPD CAPACITY", value: "High Demand, Low Visibility" }
    ],
    visualElements: [
      "👨‍⚕️ Idle Doctor in Nearby Clinic",
      "🏥 Empty Consultation Chairs",
      "❓ Patients Unaware of Availability",
      "📉 Unbalanced Healthcare Access"
    ]
  },
  {
    id: 3,
    title: "Scene 3: Sehat-Sathi Appears",
    subtitle: "Instant Doctor Search, Online Payment & Booking",
    badge: "The Sehat-Sathi Revolution",
    color: "#2563EB",
    bgGradient: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
    icon: <Sparkles size={24} />,
    dialogue: "“Search nearby doctors by specialty, fee, ratings & book in seconds.”",
    narrative: "Patient opens Sehat-Sathi. Filters by Location, Specialization, Fee, Ratings, and Language. Confirms appointment instantly with secure online payment & digital invoice.",
    stats: [
      { label: "SEARCH TO BOOK", value: "< 15 Seconds" },
      { label: "DISCOVERY FILTERS", value: "Fee, Ratings, Distance" },
      { label: "ONLINE PAYMENT", value: "Instant UPI & GST Receipt" }
    ],
    visualElements: [
      "📱 Sehat-Sathi App Launch",
      "🔍 Real-Time Location Search",
      "💳 Amazon-Grade Checkout",
      "🧾 Dynamic Payment Invoice"
    ]
  },
  {
    id: 4,
    title: "Scene 4: Complete Healthcare Journey",
    subtitle: "Zero Waiting, AI Reports & Connected Records",
    badge: "Seamless Ecosystem",
    color: "#8B5CF6",
    bgGradient: "linear-gradient(135deg, #181024 0%, #3B1D6E 100%)",
    icon: <Bot size={24} />,
    dialogue: "“Reception has appointment pre-synced. AI parses lab reports.”",
    narrative: "Patient arrives at clinic — reception already has details. Doctor reviews history, conducts consultation, issues digital prescription. AI analyzes lab test reports instantly.",
    stats: [
      { label: "RECEPTION WAIT TIME", value: "0 Minutes" },
      { label: "AI REPORT ANALYSIS", value: "< 3 Seconds" },
      { label: "DIGITAL RX", value: "100% Cloud Encrypted" }
    ],
    visualElements: [
      "🏥 Pre-Verified Reception Check-in",
      "📹 HD Telehealth & Consultation",
      "💊 Signed E-Prescription Issued",
      "🤖 Multimodal AI Report Parsing"
    ]
  },
  {
    id: 5,
    title: "Scene 5: Final Vision",
    subtitle: "Sehat-Sathi — One Platform. Complete Healthcare.",
    badge: "Empowering Millions",
    color: "#10B981",
    bgGradient: "linear-gradient(135deg, #062419 0%, #064E3B 100%)",
    icon: <ShieldCheck size={24} />,
    dialogue: "“Doctors happy. Patients satisfied. Hospitals organized.”",
    narrative: "A simplified healthcare ecosystem. Patients get care without queues, doctors optimize schedules, hospitals track revenue, and admins monitor platform health in real-time.",
    stats: [
      { label: "PATIENT SATISFACTION", value: "99.4%" },
      { label: "ECOSYSTEM INTEGRATION", value: "Patients + Doctors + Labs + Admin" },
      { label: "PLATFORM TAGLINE", value: "One Platform. Complete Healthcare." }
    ],
    visualElements: [
      "😊 Happy Patient & Family",
      "👨‍⚕️ Satisfied & Active Doctor",
      "📊 Admin Enterprise Control Center",
      "✨ Sehat-Sathi Brand Logo Seal"
    ]
  }
];

export default function Cinematic3DHealthcareExperience() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);

  const scene = SCENES[currentSceneIndex];

  // Auto-play timer effect (advances scene every 12 seconds with continuous progress bar)
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 100;
    const totalStepMs = 12000;
    const increment = (intervalMs / totalStepMs) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentSceneIndex(idx => (idx + 1) % SCENES.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentSceneIndex]);

  // Handle manual scene changes
  const goToScene = (index) => {
    setCurrentSceneIndex(index);
    setProgress(0);
  };

  // 3D Canvas Animated Stage (Particle Mesh & Dynamic Ambient Lighting)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    let width = (canvas.width = canvas.offsetWidth || 600);
    let height = (canvas.height = canvas.offsetHeight || 420);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2.5 + 1
    }));

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick += 0.015;

      // Draw particle connections (Healthcare Neural Grid)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `${scene.color}${Math.floor((1 - dist / 110) * 40).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const pulse = Math.sin(tick + i) * 1.2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.radius + pulse), 0, Math.PI * 2);
        ctx.fillStyle = scene.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 600;
      height = canvas.height = canvas.offsetHeight || 420;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [scene.color]);

  return (
    <div style={{
      position: "relative", width: "100%", borderRadius: 28,
      overflow: "hidden", background: scene.bgGradient,
      border: `1px solid ${scene.color}44`,
      boxShadow: `0 30px 90px rgba(0,0,0,0.5), 0 0 0 1px ${scene.color}22`,
      minHeight: 480, display: "flex", flexDirection: "column", justifyContent: "space-between",
      color: "#FFFFFF", fontFamily: "'Inter', sans-serif",
      transition: "background 0.8s ease, border-color 0.8s ease"
    }}>
      {/* 3D Dynamic Particle Stage Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          pointerEvents: "none", zIndex: 0
        }}
      />

      {/* Top Header & Director Controls Bar */}
      <div style={{
        position: "relative", zIndex: 2, padding: "16px 24px",
        background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: scene.color, boxShadow: `0 0 12px ${scene.color}`
          }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: "rgba(255,255,255,0.9)", textTransform: "uppercase" }}>
            CINEMATIC 3D HEALTHCARE STORY
          </span>
          <span style={{
            background: `${scene.color}22`, border: `1px solid ${scene.color}55`,
            color: scene.color, fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 100
          }}>
            {scene.badge}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: isPlaying ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.12)",
              border: `1px solid ${isPlaying ? "#2563EB" : "rgba(255,255,255,0.2)"}`,
              color: "#FFF", padding: "5px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
            }}
          >
            {isPlaying ? <><Pause size={12} /> Pause Director</> : <><Play size={12} /> Auto Play Story</>}
          </button>
          <button
            onClick={() => { goToScene(0); setIsPlaying(true); }}
            style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#94A3B8", padding: "5px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 4
            }}
          >
            <RotateCcw size={12} /> Restart
          </button>
        </div>
      </div>

      {/* Progress Bar (Shows active scene timing) */}
      <div style={{ position: "relative", zIndex: 3, height: 3, background: "rgba(255,255,255,0.1)" }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: scene.color, transition: "width 0.1s linear",
          boxShadow: `0 0 8px ${scene.color}`
        }} />
      </div>

      {/* Main Cinematic Scene Display */}
      <div style={{
        position: "relative", zIndex: 2, padding: "32px 28px", flex: 1,
        display: "flex", flexDirection: "column", justifyContent: "center"
      }}>

        <div style={{
          background: "rgba(15, 23, 42, 0.70)",
          backdropFilter: "blur(16px)",
          border: `1px solid ${scene.color}44`,
          borderRadius: 24, padding: "28px 32px",
          boxShadow: `0 25px 60px ${scene.color}22`,
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {/* Scene Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: scene.color, color: "#FFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 10px 24px ${scene.color}66`, flexShrink: 0
            }}>
              {scene.icon}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: scene.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {scene.title}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "2px 0 0", color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                {scene.subtitle}
              </h2>
            </div>
          </div>

          {/* Dialogue Banner */}
          <div style={{
            background: "rgba(255,255,255,0.06)", borderLeft: `4px solid ${scene.color}`,
            borderRadius: "0 12px 12px 0", padding: "10px 16px", margin: "14px 0 16px",
            fontSize: 13, fontWeight: 600, fontStyle: "italic", color: "#F1F5F9"
          }}>
            {scene.dialogue}
          </div>

          {/* Narrative Text */}
          <p style={{ fontSize: 13.5, color: "#CBD5E1", lineHeight: 1.7, margin: "0 0 20px" }}>
            {scene.narrative}
          </p>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
            {scene.stats.map((st, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "10px 12px"
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: scene.color, letterSpacing: "0.06em" }}>{st.label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>{st.value}</div>
              </div>
            ))}
          </div>

          {/* Visual Highlight Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {scene.visualElements.map((elem, i) => (
              <span key={i} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#E2E8F0", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8
              }}>
                {elem}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Scene Selector Tabs */}
      <div style={{
        position: "relative", zIndex: 2, padding: "16px 24px",
        background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12
      }}>
        {/* Navigation Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => { goToScene((currentSceneIndex - 1 + SCENES.length) % SCENES.length); setIsPlaying(false); }}
            style={{
              background: "rgba(255,255,255,0.1)", border: "none", color: "#FFF",
              padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4
            }}
          >
            <ChevronLeft size={14} /> Prev Scene
          </button>
          <button
            onClick={() => { goToScene((currentSceneIndex + 1) % SCENES.length); setIsPlaying(false); }}
            style={{
              background: "linear-gradient(135deg, #2563EB, #1D4ED8)", border: "none", color: "#FFF",
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4
            }}
          >
            Next Scene <ChevronRight size={14} />
          </button>
        </div>

        {/* Scene Indicator Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SCENES.map((sc, i) => (
            <button
              key={sc.id}
              onClick={() => { goToScene(i); setIsPlaying(false); }}
              style={{
                padding: "4px 10px", borderRadius: 100, fontSize: 10, fontWeight: 700,
                border: i === currentSceneIndex ? `1px solid ${sc.color}` : "1px solid rgba(255,255,255,0.12)",
                background: i === currentSceneIndex ? `${sc.color}33` : "rgba(255,255,255,0.04)",
                color: i === currentSceneIndex ? "#FFFFFF" : "#94A3B8",
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              S{sc.id}: {sc.title.replace("Scene ", "")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
