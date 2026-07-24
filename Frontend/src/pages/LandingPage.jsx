/**
 * LandingPage — Premium healthcare landing page
 *
 * Visual layer rebuilt with Framer Motion:
 *  - Sticky card-stack "How It Works" (Apple-style scroll)
 *  - Hero parallax + 2-column layout with animated demo window
 *  - Staggered feature grid with gradient icon cards
 *  - AnimatePresence health-condition tab transitions
 *  - Left/right slide-in doctor section
 *  - All section headings use useInView for scroll reveals
 *  - AnimatePresence auth modals with smooth enter/exit
 *
 * Logic layer (data, auth, Firebase) is 100% identical to original.
 */
import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  Activity, FileText, Sparkles, Key, Heart, CheckCircle2,
  Eye, EyeOff, Stethoscope, Clock, Droplet, Users,
  MapPin, Calendar, MessageSquare, Video, Headphones, Shield,
  TrendingUp, AlertCircle as AlertIcon, ArrowRight, Star, Bot,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA  (identical to original — do not modify)
// ─────────────────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Patients Served",  value: "12,000+", icon: "👥",  color: "var(--primary)" },
  { label: "Doctors Verified", value: "450+",    icon: "👨‍⚕️", color: "var(--green)"   },
  { label: "Reports Analyzed", value: "35,000+", icon: "📊",  color: "#0EA5E9"        },
  { label: "Hospitals Listed", value: "120+",    icon: "🏥",  color: "var(--amber)"   },
];

const FEATURES = [
  {
    icon: <Bot size={24} />,
    title: "AI Report Analysis",
    desc: "Upload any lab report and get a plain-language breakdown of every parameter—instantly.",
    color: "var(--primary)",
    gradient: "linear-gradient(135deg, #2563EB 0%, #6366F1 100%)",
  },
  {
    icon: <Stethoscope size={24} />,
    title: "Verified Doctor Network",
    desc: "Consult with MCI-verified specialists via video, audio, or chat from anywhere in India.",
    color: "var(--green)",
    gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
  },
  {
    icon: <Calendar size={24} />,
    title: "OPD Appointment Booking",
    desc: "Book hospital appointments and skip queues. Real-time slot availability and instant confirmation.",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
  },
  {
    icon: <Droplet size={24} />,
    title: "Blood Donor Network",
    desc: "Find blood donors by group and location during emergencies. Register to save lives.",
    color: "var(--red)",
    gradient: "linear-gradient(135deg, #EF4444 0%, #F97316 100%)",
  },
  {
    icon: <Shield size={24} />,
    title: "Secure Health Records",
    desc: "All your medical records encrypted and stored securely. Access anytime, anywhere.",
    color: "var(--purple)",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #C084FC 100%)",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Health Trend Tracking",
    desc: "Track your health parameters over time and spot patterns before they become problems.",
    color: "var(--amber)",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01", icon: "📥", title: "Upload Your Report",
    desc: "Securely upload any blood test, X-ray report, or lab document in PDF or image format.",
    badge: "📁 PDF, JPG, PNG supported",
    accentBg: "var(--primary-light)", accentBorder: "var(--primary-border)", accentColor: "var(--primary)",
  },
  {
    step: "02", icon: "🤖", title: "AI Parses the Data",
    desc: "Our multimodal AI extracts, structures, and cross-references every parameter in seconds.",
    badge: "⚡ Results in under 3 seconds",
    accentBg: "var(--purple-light)", accentBorder: "var(--purple-border)", accentColor: "var(--purple)",
  },
  {
    step: "03", icon: "📊", title: "Get Clear Insights",
    desc: "See every value explained in simple language, with normal ranges and what deviations mean.",
    badge: "📈 Normal ranges included",
    accentBg: "rgba(14,165,233,0.08)", accentBorder: "rgba(14,165,233,0.22)", accentColor: "#0EA5E9",
  },
  {
    step: "04", icon: "👨‍⚕️", title: "Consult a Doctor",
    desc: "Share results directly with a specialist and get expert medical advice without leaving home.",
    badge: "🔒 End-to-end encrypted",
    accentBg: "var(--green-light)", accentBorder: "var(--green-border)", accentColor: "var(--green)",
  },
];

const DOCTOR_FEATURES = [
  { icon: <Video size={20} />,         label: "Video Consultation",  desc: "Face-to-face with specialists" },
  { icon: <Headphones size={20} />,    label: "Audio Consultation",  desc: "Quick voice consultations" },
  { icon: <MessageSquare size={20} />, label: "Chat Consultation",   desc: "Text-based medical advice" },
  { icon: <Shield size={20} />,        label: "Verified Profiles",   desc: "Certified & experienced doctors" },
  { icon: <Clock size={20} />,         label: "Instant Booking",     desc: "No waiting, book immediately" },
  { icon: <TrendingUp size={20} />,    label: "Specialist Doctors",  desc: "Find doctors by specialty" },
];

const BLOOD_DONOR_INFO = [
  { icon: <Users size={20} />,    title: "Register as Donor",  desc: "Help save lives in your community" },
  { icon: <AlertIcon size={20} />,title: "Request Blood",      desc: "Find donors during emergencies"    },
  { icon: <MapPin size={20} />,   title: "Search Donors",      desc: "Filter by location & blood group"  },
  { icon: <Heart size={20} />,    title: "Emergency Support",  desc: "24/7 emergency blood access"       },
];

const APPOINTMENT_PROCESS = [
  { step: "1", title: "Search Hospital", desc: "Find hospitals near you",        icon: "🏥"   },
  { step: "2", title: "Choose Doctor",   desc: "Select your preferred doctor",   icon: "👨‍⚕️" },
  { step: "3", title: "Pick Time Slot",  desc: "Choose a convenient time",       icon: "⏰"   },
  { step: "4", title: "Book & Confirm",  desc: "Instant confirmation & details", icon: "✅"   },
];

const HEALTH_DATA = {
  diabetes: {
    label: "Diabetes", icon: "🩸", title: "Type-2 Diabetes Management",
    diet: [
      "Prioritize complex carbohydrates: oats, quinoa, brown rice over refined grains",
      "Incorporate high-fiber greens — spinach, broccoli, and kale daily",
      "Strictly eliminate refined sugars and high-glycemic commercial fruit juices",
    ],
    exercise: [
      "Maintain 30 minutes of moderate brisk walking or indoor cycling daily",
      "Execute light resistance training 2–3× weekly for optimized insulin sensitivity",
      "Monitor blood glucose before and after training sessions consistently",
    ],
    tip: "Never skip meals. A consistent eating schedule prevents dangerous glycemic spikes.",
    color: "var(--primary)",
  },
  hypertension: {
    label: "Hypertension", icon: "❤️", title: "Cardiovascular Care Plan",
    diet: [
      "Follow the DASH diet: increase intake of whole fruits and lean proteins",
      "Restrict daily sodium consumption strictly below 1,500 mg",
      "Prioritize potassium-dense foods: bananas, avocados, sweet potatoes",
    ],
    exercise: [
      "Engage in low-impact aerobic activity: swimming, light jogging, or aerobics",
      "Avoid heavy weightlifting that causes acute cardiovascular pressure spikes",
      "Incorporate 15 minutes of daily deep breathing or yoga sessions",
    ],
    tip: "Always review packaged food labels — hidden sodium is heavily present in processed goods.",
    color: "#0EA5E9",
  },
  thyroid: {
    label: "Thyroid", icon: "🦋", title: "Hypothyroidism Optimization",
    diet: [
      "Incorporate iodine & selenium-rich nutrition: eggs, dairy, whole grains",
      "Always cook goitrogens (cabbage, cauliflower) thoroughly before consumption",
      "Maintain a clean lean protein baseline to optimize basal metabolic rates",
    ],
    exercise: [
      "Perform consistent moderate-intensity cardio to counter metabolic slowing",
      "Execute strength training to build lean mass and increase resting energy expenditure",
      "Thorough joint warm-ups — thyroid imbalances frequently trigger stiffness",
    ],
    tip: "Take thyroid medications on an empty stomach, 30–60 minutes before breakfast.",
    color: "var(--purple)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: EASE } },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.10 } },
};

const staggerFast = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const slideLeft = {
  hidden:  { opacity: 0, x: -52 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE } },
};

const slideRight = {
  hidden:  { opacity: 0, x: 52 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE } },
};

const popIn = {
  hidden:  { opacity: 0, scale: 0.87 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.52, ease: EASE } },
};

// ─────────────────────────────────────────────────────────────────────────────
// MODAL INPUT STYLES (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────

const modalInput = {
  width: "100%",
  background: "var(--surface-alt)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-md)",
  padding: "11px 14px",
  color: "var(--text)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "var(--font)",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children, color = "var(--primary)" }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: `${color}15`, border: `1px solid ${color}30`, color,
      fontSize: 11, fontWeight: 700, padding: "5px 14px",
      borderRadius: "var(--radius-full)", marginBottom: 12,
      letterSpacing: "0.06em", textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

function SectionHead({ label, labelColor, title, subtitle, center = true }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      style={{ textAlign: center ? "center" : "left", marginBottom: 36 }}
    >
      {label && (
        <motion.div variants={fadeUp}>
          <SectionLabel color={labelColor}>{label}</SectionLabel>
        </motion.div>
      )}
      <motion.h2
        variants={fadeUp}
        className="serif"
        style={{ fontSize: "clamp(26px,3.5vw,46px)", color: "var(--text)", lineHeight: 1.18, letterSpacing: "-0.02em" }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          style={{
            color: "var(--text-secondary)", fontSize: 16, marginTop: 14,
            maxWidth: center ? 580 : "100%",
            margin: center ? "14px auto 0" : "14px 0 0",
            lineHeight: 1.85,
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CARD — separate component so useInView is at component level
// ─────────────────────────────────────────────────────────────────────────────

function FeatureCard({ feature, index }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      transition={{ delay: (index % 3) * 0.09 }}
      whileHover={{ y: -8, boxShadow: "0 22px 56px rgba(0,0,0,0.10)", transition: { duration: 0.22 } }}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 22, padding: 30,
        position: "relative", overflow: "hidden", cursor: "default",
      }}
    >
      {/* Ambient corner orb */}
      <div style={{
        position: "absolute", top: -36, right: -36,
        width: 120, height: 120, borderRadius: "50%",
        background: `${feature.color}08`, pointerEvents: "none",
      }} />
      {/* Gradient icon */}
      <div style={{
        width: 58, height: 58, borderRadius: 18,
        background: feature.gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", marginBottom: 22,
        boxShadow: `0 10px 28px ${feature.color}28`,
      }}>
        {feature.icon}
      </div>
      <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
        {feature.title}
      </h4>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.78, margin: 0 }}>
        {feature.desc}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STACKED CARD — driven by scrollYProgress prop from parent
// ─────────────────────────────────────────────────────────────────────────────

function StackedCard({ step, index, total, scrollYProgress }) {
  const span = 1 / total;

  // Enter animation: each card slides up from below
  const enterStart = index === 0 ? 0 : Math.max(0, (index - 0.65) * span);
  const enterEnd   = index === 0 ? 0 : index * span + span * 0.22;

  // Scale: previous cards shrink as next card arrives
  const scaleStart = index < total - 1 ? index * span + span * 0.22 : 0;
  const scaleEnd   = index < total - 1 ? (index + 1) * span           : 0;

  const y = useTransform(
    scrollYProgress,
    index === 0 ? [0, 1] : [enterStart, enterEnd],
    index === 0 ? [0, 0] : [320, 0]  // 320px below → 0, clipped by overflow:hidden parent
  );

  const scale = useTransform(
    scrollYProgress,
    index < total - 1 ? [scaleStart, scaleEnd] : [0, 1],
    index < total - 1 ? [1, 0.88] : [1, 1]  // stronger depth effect
  );

  const opacity = useTransform(
    scrollYProgress,
    index === 0
      ? [0, 1]
      : [Math.max(0, enterStart - 0.01), enterStart + 0.06],
    index === 0 ? [1, 1] : [0, 1]
  );

  return (
    <motion.div
      style={{
        y, scale, opacity,
        position: "absolute", top: 0, left: 0, right: 0,
        zIndex: index + 1, transformOrigin: "top center",
        willChange: "transform, opacity",
      }}
    >
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 24, padding: "36px 44px",
        boxShadow: "0 8px 48px rgba(0,0,0,0.08)",
        display: "grid", gridTemplateColumns: "auto 1fr",
        gap: 28, alignItems: "flex-start",
      }}>
        {/* Left: icon + step number */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20,
            background: step.accentBg, border: `2px solid ${step.accentBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          }}>
            {step.icon}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 800, color: step.accentColor,
            fontFamily: "monospace", letterSpacing: "0.10em", opacity: 0.8,
          }}>
            {step.step}
          </div>
        </div>
        {/* Right: content */}
        <div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 10, letterSpacing: "-0.02em" }}>
            {step.title}
          </h3>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.85, marginBottom: 16, maxWidth: 520 }}>
            {step.desc}
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: step.accentBg, border: `1px solid ${step.accentBorder}`,
            color: step.accentColor, fontSize: 12, fontWeight: 700,
            padding: "6px 14px", borderRadius: "var(--radius-full)",
          }}>
            {step.badge}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS — PREMIUM STEP FLOW (works reliably on all browsers)
// ─────────────────────────────────────────────────────────────────────────────

function HowItWorksStep({ step, index, inView }) {
  const ACCENT_MAP = [
    { bg: "var(--primary-light)",  border: "var(--primary-border)",  color: "var(--primary)",  gradient: "linear-gradient(135deg,#2563EB,#6366F1)" },
    { bg: "var(--purple-light)",   border: "var(--purple-border)",   color: "var(--purple)",   gradient: "linear-gradient(135deg,#7C3AED,#A78BFA)" },
    { bg: "rgba(14,165,233,0.08)", border: "rgba(14,165,233,0.22)",  color: "#0EA5E9",         gradient: "linear-gradient(135deg,#0EA5E9,#38BDF8)" },
    { bg: "var(--green-light)",    border: "var(--green-border)",    color: "var(--green)",    gradient: "linear-gradient(135deg,#10B981,#34D399)" },
  ];
  const a = ACCENT_MAP[index];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, boxShadow: `0 20px 56px ${a.color}22` }}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 22,
        padding: "32px 28px",
        position: "relative",
        overflow: "hidden",
        flex: 1,
        minWidth: 0,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Large faded step number */}
      <div style={{
        position: "absolute", top: -10, right: 16,
        fontSize: 88, fontWeight: 900, color: a.color,
        opacity: 0.06, lineHeight: 1,
        fontFamily: "var(--font-serif, Georgia, serif)",
        userSelect: "none", pointerEvents: "none",
      }}>
        {step.step}
      </div>

      {/* Icon circle */}
      <div style={{
        width: 56, height: 56, borderRadius: 18,
        background: a.gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, marginBottom: 20,
        boxShadow: `0 8px 24px ${a.color}30`,
      }}>
        {step.icon}
      </div>

      {/* Step label */}
      <div style={{
        fontSize: 10, fontWeight: 800, color: a.color,
        letterSpacing: "0.08em", textTransform: "uppercase",
        marginBottom: 8,
      }}>
        Step {step.step}
      </div>

      <h3 style={{
        fontSize: 17, fontWeight: 800, color: "var(--text)",
        marginBottom: 10, letterSpacing: "-0.015em",
        lineHeight: 1.3,
      }}>
        {step.title}
      </h3>

      <p style={{
        fontSize: 13, color: "var(--text-secondary)",
        lineHeight: 1.8, marginBottom: 18,
      }}>
        {step.desc}
      </p>

      {/* Badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: a.bg, border: `1px solid ${a.border}`,
        color: a.color, fontSize: 11, fontWeight: 700,
        padding: "5px 12px", borderRadius: "var(--radius-full)",
      }}>
        {step.badge}
      </div>
    </motion.div>
  );
}

function HowItWorksSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section
      id="how-it-works"
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "72px 6%",
        background: "linear-gradient(180deg, var(--surface-alt) 0%, var(--bg) 100%)",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Decorative background gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(16,185,129,0.04) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <SectionHead
          label="Operational Flow"
          title="How SehatSathi Works"
          subtitle="Four seamless stages — from uploading your report to consulting an expert doctor."
        />

        {/* Steps row */}
        <div
          ref={ref}
          className="hiw-steps-row"
          style={{
            display: "flex",
            gap: 0,
            alignItems: "stretch",
            position: "relative",
          }}
        >
          {HOW_IT_WORKS.map((step, i) => (
            <>
              <HowItWorksStep key={i} step={step} index={i} inView={inView} />
              {/* Connector arrow */}
              {i < HOW_IT_WORKS.length - 1 && (
                <motion.div
                  className="hiw-connector"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={inView ? { opacity: 1, scaleX: 1 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.12 + 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, width: 40, transformOrigin: "left center",
                  }}
                >
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}>
                    {[0,1,2].map(d => (
                      <div key={d} style={{
                        width: 4, height: 4, borderRadius: "50%",
                        background: "var(--border-strong)",
                        opacity: 1 - d * 0.25,
                      }} />
                    ))}
                    <div style={{
                      fontSize: 16, color: "var(--border-strong)", marginTop: 2,
                      lineHeight: 1,
                    }}>›</div>
                  </div>
                </motion.div>
              )}
            </>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="hiw-cta-strip"
          style={{
            marginTop: 40,
            background: "var(--primary-light)",
            border: "1px solid var(--primary-border)",
            borderRadius: 18,
            padding: "22px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 28 }}>⚡</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>Ready to get started?</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Upload your first report and get AI insights in under 3 seconds.</div>
            </div>
          </div>
          <motion.button
            className="btn-primary"
            style={{ fontSize: 13, padding: "11px 28px", flexShrink: 0 }}
            onClick={() => window.dispatchEvent(new Event("trigger-signup-modal"))}
            whileHover={{ scale: 1.03, boxShadow: "0 8px 28px rgba(37,99,235,0.32)" }}
            whileTap={{ scale: 0.97 }}
          >
            Try it Free →
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOOD GROUP BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function BloodGroupBtn({ label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.07, backgroundColor: "var(--red-light)", borderColor: "var(--red-border)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        fontSize: 13, fontWeight: 700, padding: "10px 20px", cursor: "pointer",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)", color: "var(--red)",
        fontFamily: "inherit", transition: "background 0.15s, border-color 0.15s",
      }}
    >
      {label}
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { loginNode, registerNode, loginWithGoogle, resetPassword } = useAuth();

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [authOpen,         setAuthOpen]         = useState(false);
  const [authMode,         setAuthMode]         = useState("login");
  const [email,            setEmail]            = useState("");
  const [password,         setPassword]         = useState("");
  const [name,             setName]             = useState("");
  const [showPassword,     setShowPassword]     = useState(false);
  const [selectedRole,     setSelectedRole]     = useState("Patient");
  const [medicalRegNumber, setMedicalRegNumber] = useState("");
  const [signupPending,    setSignupPending]    = useState(false);
  const [authError,        setAuthError]        = useState("");
  const [authLoading,      setAuthLoading]      = useState(false);

  // ── Forgot password ─────────────────────────────────────────────────────────
  const [forgotOpen,    setForgotOpen]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotStep,    setForgotStep]    = useState("input");
  const [forgotLoading, setForgotLoading] = useState(false);

  // ── Health tab ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("diabetes");

  // ── Nav trigger events (unchanged) ─────────────────────────────────────────
  useEffect(() => {
    const openLogin  = () => { setAuthMode("login");  setAuthOpen(true); setAuthError(""); };
    const openSignup = () => { setAuthMode("signup"); setAuthOpen(true); setAuthError(""); };
    window.addEventListener("trigger-login-modal",  openLogin);
    window.addEventListener("trigger-signup-modal", openSignup);
    return () => {
      window.removeEventListener("trigger-login-modal",  openLogin);
      window.removeEventListener("trigger-signup-modal", openSignup);
    };
  }, []);

  const openAuth  = (mode) => { setAuthMode(mode); setAuthOpen(true); setAuthError(""); };
  const resetForm = () => { setEmail(""); setPassword(""); setName(""); setMedicalRegNumber(""); setAuthError(""); };

  // ── Auth handlers (unchanged) ───────────────────────────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError("");
    if (authMode === "signup") {
      const res = await registerNode(name, email, password, selectedRole, null, medicalRegNumber || undefined);
      if (res.success) {
        if (res.verification_required) { setSignupPending(true); setAuthOpen(false); resetForm(); }
        else { setAuthMode("login"); setPassword(""); }
      } else { setAuthError(res.error || "Signup failed"); }
    } else {
      const res = await loginNode(email, password);
      if (res.success) { setAuthOpen(false); resetForm(); }
      else { setAuthError(res.error || "Invalid credentials"); }
    }
    setAuthLoading(false);
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    const res = await loginWithGoogle();
    if (res.success) setAuthOpen(false);
    else setAuthError(res.error || "Google sign-in failed");
    setAuthLoading(false);
  };

  const handleForgotOpen   = () => { setForgotEmail(""); setForgotStep("input"); setForgotLoading(false); setAuthOpen(false); setForgotOpen(true); };
  const handleForgotClose  = () => { setForgotOpen(false); };
  const handleForgotSubmit = async (e) => {
    e.preventDefault(); if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    const res = await resetPassword(forgotEmail);
    setForgotLoading(false);
    if (res.success) setForgotStep("sent");
    else alert(`Error: ${res.error}`);
  };

  const tab = HEALTH_DATA[activeTab];

  // ── Section scroll refs ─────────────────────────────────────────────────────
  const heroRef   = useRef(null);
  const statsRef  = useRef(null);
  const doctorRef = useRef(null);
  const apptRef   = useRef(null);
  const bloodRef  = useRef(null);
  const ctaRef    = useRef(null);

  const heroInView   = useInView(heroRef,   { once: true });
  const statsInView  = useInView(statsRef,  { once: true, margin: "-40px" });
  const doctorInView = useInView(doctorRef, { once: true, margin: "-40px" });
  const apptInView   = useInView(apptRef,   { once: true, margin: "-40px" });
  const bloodInView  = useInView(bloodRef,  { once: true, margin: "-40px" });
  const ctaInView    = useInView(ctaRef,    { once: true, margin: "-40px" });

  // ── Hero parallax ───────────────────────────────────────────────────────────
  const { scrollY }  = useScroll();
  const heroContentY = useTransform(scrollY, [0, 500], [0, -40]);
  const heroBgY      = useTransform(scrollY, [0, 500], [0, -110]);

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", width: "100%", overflowX: "clip" }}>

      {/* ════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        style={{ position: "relative", overflow: "hidden", minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 6% 80px" }}
      >
        {/* Parallax mesh */}
        <motion.div className="hero-mesh" style={{ y: heroBgY }} />
        {/* Ambient orbs */}
        <div className="hero-orb-green" />
        <div className="hero-orb-purple" />

        <motion.div
          ref={heroRef}
          style={{ y: heroContentY, maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}
        >
          <div className="hero-grid">

            {/* ── Left: Headline + CTAs ── */}
            <motion.div
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              variants={stagger}
              style={{ textAlign: "left" }}
            >
              {/* AI badge */}
              <motion.div variants={fadeUp} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--primary-light)", border: "1px solid var(--primary-border)",
                color: "var(--primary)", fontSize: 11, fontWeight: 700,
                padding: "6px 18px", borderRadius: "var(--radius-full)",
                marginBottom: 28, letterSpacing: "0.06em",
              }}>
                <Sparkles size={12} /> AI-POWERED HEALTH INTELLIGENCE
              </motion.div>

              {/* H1 */}
              <motion.h1
                variants={fadeUp}
                className="serif"
                style={{
                  fontSize: "clamp(40px, 5.5vw, 74px)",
                  lineHeight: 1.07, color: "var(--text)", letterSpacing: "-0.03em",
                }}
              >
                Understand your{" "}
                <span className="shimmer-text">medical reports</span>
                <br />
                <em style={{ color: "var(--text-muted)", fontSize: "0.70em", fontStyle: "italic" }}>
                  in plain, clinical clarity
                </em>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                variants={fadeUp}
                style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 480, margin: "22px 0 36px", lineHeight: 1.9 }}
              >
                Transform unstructured diagnostic readouts and complex blood test sheets into completely structured explanations — instantly and securely.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <motion.button
                  className="btn-primary"
                  style={{ fontSize: 15, padding: "15px 38px", borderRadius: "var(--radius-lg)" }}
                  onClick={() => openAuth("signup")}
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 36px rgba(37,99,235,0.40)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start for Free <ArrowRight size={16} />
                </motion.button>
                <motion.button
                  className="btn-ghost"
                  style={{ fontSize: 15, padding: "15px 28px" }}
                  onClick={() => openAuth("login")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Sign In
                </motion.button>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={fadeUp} style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                {["No credit card", "HIPAA-safe storage", "Trusted by 12,000+ patients"].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                    <CheckCircle2 size={12} style={{ color: "var(--green)" }} /> {t}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── Right: 3D Doctor Illustration ── */}
            <motion.div
              initial={{ opacity: 0, y: 44, scale: 0.96 }}
              animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: 0.22, duration: 0.88, ease: EASE }}
              style={{ position: "relative" }}
            >
              {/* Outer glow ring */}
              <div style={{
                position: "absolute", inset: -32,
                background: "radial-gradient(ellipse at 55% 45%, rgba(37,99,235,0.12) 0%, rgba(16,185,129,0.07) 45%, transparent 70%)",
                pointerEvents: "none", zIndex: 0,
              }} />

              {/* 3D perspective card */}
              <motion.div
                whileHover={{
                  rotateY: 0, rotateX: 0,
                  boxShadow: "0 40px 100px rgba(37,99,235,0.18), 0 0 0 1px rgba(37,99,235,0.08)",
                }}
                initial={{ rotateY: -3, rotateX: 2 }}
                animate={heroInView ? { rotateY: -3, rotateX: 2 } : {}}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  position: "relative", zIndex: 1,
                  borderRadius: 28,
                  overflow: "hidden",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.08)",
                  transformStyle: "preserve-3d",
                  perspective: 1000,
                }}
              >
                <img
                  src="/hero-doctor.png"
                  alt="AI-powered doctor consultation — SehatSathi"
                  style={{
                    width: "100%", height: "auto", display: "block",
                    borderRadius: 28,
                  }}
                />
                {/* Subtle gloss overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(0,0,0,0.04) 100%)",
                  pointerEvents: "none", borderRadius: 28,
                }} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 6% 56px" }}>
        <motion.div
          ref={statsRef}
          initial="hidden"
          animate={statsInView ? "visible" : "hidden"}
          variants={stagger}
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 24, padding: "32px 48px",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
          }}
        >
          {STATS.map((s, i, arr) => (
            <motion.div
              key={i}
              variants={fadeUp}
              style={{
                textAlign: "center", padding: "0 20px",
                borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                {s.icon} {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          FEATURES GRID
      ════════════════════════════════════════════════════════════════ */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto 60px", padding: "0 6%" }}>
        <SectionHead
          label={<><Star size={11} /> Platform Features</>}
          title="Why Choose Sehat Sathi?"
          subtitle="A complete healthcare ecosystem designed to make your medical journey seamless, transparent, and intelligent."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 22 }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          HOW IT WORKS — STICKY CARD STACK
      ════════════════════════════════════════════════════════════════ */}
      <HowItWorksSection />

      {/* ════════════════════════════════════════════════════════════════
          DOCTOR CONSULTATION
      ════════════════════════════════════════════════════════════════ */}
      <section id="doctors" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 6%" }}>
        <motion.div
          ref={doctorRef}
          initial="hidden"
          animate={doctorInView ? "visible" : "hidden"}
          variants={stagger}
          style={{
            background: "linear-gradient(135deg, var(--primary-light), var(--surface))",
            border: "1px solid var(--primary-border)",
            borderRadius: 28, padding: "52px 48px", overflow: "hidden",
          }}
        >
          <div className="doctor-grid">
            <motion.div variants={slideLeft} style={{ textAlign: "left" }}>
              <SectionLabel color="var(--primary)">Healthcare Service</SectionLabel>
              <h2 className="serif" style={{ fontSize: "clamp(24px,3vw,40px)", color: "var(--text)", lineHeight: 1.25, marginBottom: 16 }}>
                Consult Experienced<br />Doctors Online
              </h2>
              <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.85, marginBottom: 28 }}>
                Connect with MCI-verified healthcare professionals from the comfort of your home. Choose your preferred consultation method and get medical advice instantly.
              </p>
              <motion.button
                className="btn-primary"
                style={{ fontSize: 14, padding: "13px 30px", marginBottom: 18 }}
                onClick={() => openAuth("signup")}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 28px rgba(37,99,235,0.32)" }}
                whileTap={{ scale: 0.97 }}
              >
                Consult Now <ArrowRight size={15} />
              </motion.button>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {["Verified doctors", "Confidential", "Fast response"].map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                    <CheckCircle2 size={11} style={{ color: "var(--green)" }} /> {t}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={slideRight} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {DOCTOR_FEATURES.map((f, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, boxShadow: "0 10px 32px rgba(0,0,0,0.08)" }}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)", padding: 18, textAlign: "center",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ color: "var(--primary)", marginBottom: 10, display: "flex", justifyContent: "center" }}>{f.icon}</div>
                  <h5 style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{f.label}</h5>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          APPOINTMENT BOOKING
      ════════════════════════════════════════════════════════════════ */}
      <section style={{
        background: "var(--surface-alt)",
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        padding: "60px 6%",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionHead
            label={<><Calendar size={11} /> Seamless Booking</>}
            labelColor="var(--green)"
            title="Book Hospital Appointments Without Waiting"
            subtitle="Skip the queues. Get instant confirmation for your hospital visits in 4 simple steps."
          />

          <motion.div
            ref={apptRef}
            initial="hidden"
            animate={apptInView ? "visible" : "hidden"}
            variants={stagger}
            className="appt-grid"
            style={{ marginBottom: 40 }}
          >
            {APPOINTMENT_PROCESS.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -7, boxShadow: "0 14px 40px rgba(0,0,0,0.09)" }}
                style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 22, padding: "28px 20px", textAlign: "center", position: "relative",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                  width: 56, height: 56, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", fontSize: 22,
                  boxShadow: "0 6px 20px rgba(37,99,235,0.25)",
                }}>{item.icon}</div>
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  width: 24, height: 24, borderRadius: "50%",
                  background: "var(--primary-light)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "var(--primary)",
                }}>{item.step}</div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{item.title}</h4>
                <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <div style={{ textAlign: "center" }}>
            <motion.button
              className="btn-primary"
              style={{ fontSize: 14, padding: "13px 32px" }}
              onClick={() => openAuth("signup")}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 28px rgba(37,99,235,0.32)" }}
              whileTap={{ scale: 0.97 }}
            >
              Book Appointment <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          BLOOD DONOR
      ════════════════════════════════════════════════════════════════ */}
      <section id="blood" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 6%" }}>
        <SectionHead
          label={<><Droplet size={11} /> Emergency Support</>}
          labelColor="var(--red)"
          title={<>Find Blood Donors When<br />You Need Them</>}
          subtitle="Connect with verified blood donors in your area. Register as a donor or request blood during emergencies."
        />

        <motion.div
          ref={bloodRef}
          initial="hidden"
          animate={bloodInView ? "visible" : "hidden"}
          variants={staggerFast}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}
        >
          {BLOOD_DONOR_INFO.map((info, i) => (
            <motion.div
              key={i}
              variants={popIn}
              whileHover={{ y: -6, boxShadow: "0 14px 40px rgba(239,68,68,0.10)" }}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 22, padding: 30, textAlign: "center", boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{
                color: "var(--red)", width: 58, height: 58, borderRadius: "50%",
                background: "var(--red-light)", border: "1px solid var(--red-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 18px",
              }}>{info.icon}</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{info.title}</h4>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{info.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={bloodInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.28, duration: 0.72, ease: EASE }}
          style={{
            background: "var(--red-light)", border: "1px solid var(--red-border)",
            borderRadius: 24, padding: "44px", textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Search Blood Donors</h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 22 }}>Filter donors by blood group, location, and availability</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 26 }}>
            {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map((bg, i) => (
              <BloodGroupBtn key={i} label={bg} onClick={() => openAuth("signup")} />
            ))}
          </div>
          <motion.button
            className="btn-primary"
            style={{ fontSize: 14, padding: "13px 32px", background: "linear-gradient(135deg, var(--red), #dc2626)", boxShadow: "0 4px 14px rgba(239,68,68,0.25)" }}
            onClick={() => openAuth("signup")}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(239,68,68,0.38)" }}
            whileTap={{ scale: 0.97 }}
          >
            Find Donors Now <ArrowRight size={14} />
          </motion.button>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          HEALTH CONDITIONS
      ════════════════════════════════════════════════════════════════ */}
      <section style={{
        background: "var(--surface-alt)",
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        padding: "60px 6%",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SectionHead
            label="Therapeutic Lifestyle Index"
            labelColor="var(--green)"
            title={<>Clinical Nutrition & Activity<br /><em style={{ color: "var(--text-muted)", fontSize: "0.72em" }}>Guidelines By Condition</em></>}
            subtitle="Personalized evidence-based guidance for the most common chronic conditions."
          />

          {/* Tab switcher */}
          <div style={{
            display: "flex", gap: 6, marginBottom: 28,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", padding: 5, width: "fit-content",
          }}>
            {Object.entries(HEALTH_DATA).map(([key, val]) => (
              <motion.button
                key={key}
                onClick={() => setActiveTab(key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: activeTab === key ? "var(--surface-alt)" : "transparent",
                  border: activeTab === key ? "1px solid var(--border)" : "1px solid transparent",
                  color: activeTab === key ? val.color : "var(--text-muted)",
                  padding: "9px 22px", borderRadius: "var(--radius-sm)",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  boxShadow: activeTab === key ? "var(--shadow-sm)" : "none",
                  fontFamily: "inherit",
                  transition: "color 0.2s, background 0.2s, border-color 0.2s, box-shadow 0.2s",
                }}
              >
                {val.icon} {val.label}
              </motion.button>
            ))}
          </div>

          {/* Animated tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.38, ease: EASE }}
            >
              <div className="health-grid" style={{ marginBottom: 16 }}>
                {[
                  { emoji: "🍏", label: "DIETARY GUIDANCE",   items: tab.diet },
                  { emoji: "💪", label: "EXERCISE FRAMEWORK", items: tab.exercise },
                ].map((panel, pi) => (
                  <div key={pi} style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 22, padding: 28, boxShadow: "var(--shadow-sm)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: "var(--radius-sm)",
                        background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                      }}>{panel.emoji}</div>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{panel.label}</div>
                        <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{tab.title}</div>
                      </div>
                    </div>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                      {panel.items.map((item, i) => (
                        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 2 }}>▪</span>
                          <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.75 }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div style={{
                background: "var(--primary-light)", border: "1px solid var(--primary-border)",
                borderRadius: "var(--radius-md)", padding: "16px 22px",
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 18 }}>💡</span>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.75, margin: 0 }}>
                  <strong style={{ color: "var(--text)" }}>Clinical Advisory: </strong>{tab.tip}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          ABOUT US
      ════════════════════════════════════════════════════════════════ */}
      <section id="about" style={{ maxWidth: 1200, margin: "60px auto", padding: "0 6%" }}>
        <motion.div
          ref={ctaRef}
          initial={{ opacity: 0, y: 40 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
          className="about-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 32,
            padding: "52px 52px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.07)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative accent top-left */}
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: 200, height: 200,
            background: "radial-gradient(ellipse at 0% 0%, rgba(37,99,235,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: 240, height: 240,
            background: "radial-gradient(ellipse at 100% 100%, rgba(16,185,129,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* ── Left: Story & Mission ── */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, ease: EASE }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "var(--primary-light)", border: "1px solid var(--primary-border)",
                color: "var(--primary)", fontSize: 11, fontWeight: 700,
                padding: "5px 14px", borderRadius: "var(--radius-full)",
                marginBottom: 20, letterSpacing: "0.07em",
              }}
            >
              <Sparkles size={11} /> OUR STORY
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.16, ease: EASE }}
              className="serif"
              style={{
                fontSize: "clamp(26px, 3vw, 40px)",
                color: "var(--text)", letterSpacing: "-0.025em",
                lineHeight: 1.2, marginBottom: 18,
              }}
            >
              Built for India.<br />
              <em style={{ color: "var(--primary)" }}>Powered by AI.</em>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.22, ease: EASE }}
              style={{
                fontSize: 14, color: "var(--text-secondary)",
                lineHeight: 1.9, marginBottom: 28,
              }}
            >
              Sehat Sathi was born from a simple frustration — millions of Indians receive complex diagnostic reports but have no way to understand what they mean. We set out to bridge that gap with the power of artificial intelligence and compassionate design.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.28, ease: EASE }}
              style={{
                fontSize: 14, color: "var(--text-secondary)",
                lineHeight: 1.9, marginBottom: 32,
              }}
            >
              From rural clinics to urban hospitals, our platform connects patients with clarity, doctors with efficiency, and communities with life-saving blood donor networks.
            </motion.p>

            {/* Core values */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.34, ease: EASE }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              {[
                { icon: "🎯", label: "Mission", text: "Make healthcare intelligence accessible to every Indian household." },
                { icon: "🔒", label: "Privacy-first", text: "Your medical data is yours alone — encrypted, private, never sold." },
                { icon: "🤝", label: "Community", text: "Building a network of verified doctors and donors who care." },
              ].map((v, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, alignItems: "flex-start",
                  padding: "14px 16px",
                  background: "var(--surface-alt)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{v.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", marginBottom: 2, letterSpacing: "0.02em" }}>{v.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.65 }}>{v.text}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Stats + Vision ── */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Stats 2x2 grid */}
            <motion.div
              className="about-stats-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, ease: EASE }}
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
              }}
            >
              {[
                { value: "450+", label: "Verified Doctors",  color: "var(--primary)",  icon: "👨‍⚕️" },
                { value: "12K+", label: "Active Patients",   color: "var(--green)",    icon: "🧬" },
                { value: "40+",  label: "Cities Covered",    color: "#0EA5E9",          icon: "📍" },
                { value: "99.4%","label": "AI Accuracy",      color: "var(--amber)",    icon: "⚡" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.25 + i * 0.07, ease: EASE }}
                  whileHover={{ y: -4, boxShadow: `0 12px 36px ${s.color}18` }}
                  style={{
                    background: "var(--surface-alt)",
                    border: "1px solid var(--border)",
                    borderRadius: 20, padding: "22px 20px",
                    textAlign: "center",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontWeight: 600 }}>{s.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Vision card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={ctaInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, ease: EASE }}
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, #4F46E5 100%)",
                borderRadius: 22, padding: "28px 28px",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 22, marginBottom: 12 }}>🌟</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.75)", letterSpacing: "0.07em", marginBottom: 8 }}>OUR VISION</div>
                <p style={{ fontSize: 15, color: "#fff", lineHeight: 1.75, margin: 0, fontWeight: 500 }}>
                  "To become the most trusted health companion for every family in India — understanding, connecting, and empowering lives through technology."
                </p>
                <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👨‍💻</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>SehatSathi Team</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>Building for Bharat</div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          FOOTER (content unchanged)
      ════════════════════════════════════════════════════════════════ */}
      <footer style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", paddingTop: 64, paddingBottom: 28 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 6%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 40, marginBottom: 52 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                }}>
                  <Heart size={16} style={{ color: "#fff" }} />
                </div>
                <h4 style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", margin: 0 }}>SehatSathi</h4>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8 }}>
                AI-powered healthcare platform designed to simplify medical report interpretation, connect patients with verified doctors, and make quality healthcare accessible to every Indian.
              </p>
            </div>

            {[
              { title: "Services",       links: ["AI Report Analysis","Doctor Consultation","Hospital Appointments","Blood Donor Network","Service Marketplace"] },
              { title: "Company",        links: ["Our Mission","Meet the Team","Blog & Updates","Press Kit","Careers"] },
              { title: "Legal & Support",links: ["Privacy Policy","Terms of Service","Contact Support","FAQs","Security"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>{col.title}</h4>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, padding: 0, margin: 0 }}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" style={{ fontSize: 13, color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={e => e.target.style.color = "var(--primary)"}
                        onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}
                      >{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Team credit */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 28, marginBottom: 20 }}>
            <div style={{ background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                <div>
                  <h5 style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Founder & Lead Engineer</h5>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.75, margin: 0 }}>
                    <strong style={{ color: "var(--text)" }}>Amit Dubey</strong> — AI & Full-Stack Engineer<br />
                    Building technology-driven healthcare solutions to improve patient outcomes across India.
                  </p>
                </div>
                <div>
                  <h5 style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Our Mission</h5>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.75, margin: 0 }}>
                    Empowering every Indian patient to understand their health data with clarity.<br />
                    <strong style={{ color: "var(--text)" }}>Making healthcare accessible, transparent, and intelligent — for everyone.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              © 2026 <span style={{ color: "var(--primary)", fontWeight: 700 }}>SehatSathi</span>. All rights reserved.
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
              Crafted with ❤️ in India · AI-Powered Healthcare Platform
            </p>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════════════════════
          AUTH MODAL
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {authOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setAuthOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{
                width: "100%", maxWidth: 420,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 20, padding: "28px 32px",
                position: "relative", boxShadow: "var(--shadow-lg)",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                style={{ position: "absolute", top: 14, right: 14, background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", cursor: "pointer", width: 28, height: 28, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
                onClick={() => setAuthOpen(false)}
              >✕</button>

              {/* Brand */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "var(--shadow-blue)" }}>
                  <Activity size={22} style={{ color: "white" }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
                  {authMode === "login" ? "Welcome Back" : "Create Account"}
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {authMode === "login" ? "Sign in to your Sehat Sathi account" : "Join thousands of patients today"}
                </p>
              </div>

              {/* Mode toggle */}
              <div style={{ display: "flex", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 10, padding: 3, marginBottom: 18 }}>
                {["login","signup"].map(m => (
                  <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }}
                    style={{
                      flex: 1, padding: "8px 0", borderRadius: 7,
                      border: authMode === m ? "1px solid var(--border)" : "1px solid transparent",
                      background: authMode === m ? "var(--surface)" : "transparent",
                      color: authMode === m ? "var(--primary)" : "var(--text-muted)",
                      fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      boxShadow: authMode === m ? "var(--shadow-sm)" : "none",
                      transition: "all 0.2s",
                    }}
                  >{m === "login" ? "Sign In" : "Sign Up"}</button>
                ))}
              </div>

              {/* Error */}
              {authError && (
                <div style={{ background: "var(--red-light)", border: "1px solid var(--red-border)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "var(--red)", display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertIcon size={12} /> {authError}
                </div>
              )}

              <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {authMode === "signup" && (
                  <>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</label>
                      <input type="text" required placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} style={modalInput}
                        onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px var(--primary-light)"; }}
                        onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Register As</label>
                      <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={{ ...modalInput, cursor: "pointer" }}>
                        <option value="Patient">🧑 Patient</option>
                        <option value="Doctor">👨‍⚕️ Doctor / Specialist</option>
                        <option value="Hospital">🏥 Hospital</option>
                      </select>
                    </div>
                    {selectedRole === "Doctor" && (
                      <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary-border)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                        <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Doctor Details</div>
                        <input type="text" placeholder="Medical Registration Number (e.g. MCI-2024-XXXXX)" value={medicalRegNumber} onChange={e => setMedicalRegNumber(e.target.value)} style={{ ...modalInput, fontSize: 12 }} />
                        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>⚠️ Your account will be reviewed before activation.</p>
                      </div>
                    )}
                    {selectedRole === "Hospital" && (
                      <div style={{ background: "var(--amber-light)", border: "1px solid var(--amber-border)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                        <div style={{ fontSize: 10, color: "var(--amber)", fontWeight: 700, marginBottom: 6 }}>HOSPITAL DETAILS</div>
                        <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6 }}>A unique Hospital ID will be auto-assigned on admin approval.</p>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
                  <input type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={modalInput}
                    onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px var(--primary-light)"; }}
                    onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"} required placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      style={{ ...modalInput, paddingRight: 40 }}
                      onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px var(--primary-light)"; }}
                      onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
                    >{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                </div>

                {authMode === "login" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -4 }}>
                    <button type="button" onClick={handleForgotOpen}
                      style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                    >Forgot Password?</button>
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={authLoading}
                  style={{ marginTop: 4, width: "100%", fontSize: 14, justifyContent: "center", opacity: authLoading ? 0.7 : 1 }}
                >
                  {authLoading ? "Please wait…" : authMode === "login" ? "Sign In →" : "Create Account →"}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                </div>

                <button type="button" onClick={handleGoogleAuth} disabled={authLoading}
                  style={{ width: "100%", background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "11px 16px", color: "var(--text)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--surface-alt)"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          FORGOT PASSWORD MODAL (unchanged)
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleForgotClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{ width: "100%", maxWidth: 380, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "32px", position: "relative", boxShadow: "var(--shadow-lg)" }}
              onClick={e => e.stopPropagation()}
            >
              <button style={{ position: "absolute", top: 14, right: 14, background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", cursor: "pointer", width: 28, height: 28, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={handleForgotClose}>✕</button>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "var(--shadow-blue)" }}>
                  <Key size={22} style={{ color: "white" }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
                  {forgotStep === "sent" ? "Reset Link Sent" : "Reset Password"}
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {forgotStep === "sent" ? `Check ${forgotEmail} for your reset link.` : "Enter your registered email to receive a reset link."}
                </p>
              </div>

              {forgotStep === "input" ? (
                <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 5, textTransform: "uppercase" }}>Email Address</label>
                    <input type="email" required placeholder="your@email.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={modalInput} />
                  </div>
                  <button type="submit" className="btn-primary" disabled={forgotLoading} style={{ width: "100%", fontSize: 13, justifyContent: "center", opacity: forgotLoading ? 0.7 : 1 }}>
                    {forgotLoading ? "Sending…" : "Send Reset Link →"}
                  </button>
                  <div style={{ textAlign: "center" }}>
                    <button type="button" onClick={() => { handleForgotClose(); setAuthMode("login"); setAuthOpen(true); }} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ background: "var(--green-light)", border: "1px solid var(--green-border)", borderRadius: "var(--radius-md)", padding: 18, textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📬</div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>Check your inbox. If this email is registered, you'll receive a reset link shortly.</p>
                  </div>
                  <button className="btn-primary" style={{ width: "100%", fontSize: 13, justifyContent: "center" }} onClick={() => { handleForgotClose(); setAuthMode("login"); setAuthOpen(true); }}>
                    ← Return to Sign In
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          SIGNUP PENDING MODAL (unchanged)
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {signupPending && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{ width: "100%", maxWidth: 420, background: "var(--surface)", border: "1px solid var(--primary-border)", borderRadius: 20, padding: "36px", textAlign: "center", boxShadow: "var(--shadow-lg)" }}
            >
              <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>Account Under Review</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: 22 }}>
                Your registration was submitted! Our admin team will review your credentials within <strong style={{ color: "var(--primary)" }}>24–48 hours</strong>.<br /><br />
                Once approved, you can log in and access your full dashboard.
              </p>
              <div style={{ background: "var(--surface-alt)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", marginBottom: 22, textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>What Happens Next</div>
                {["Admin reviews your registration details","Your credentials are verified against records","You receive access notification once approved","You can then log in and set up your profile"].map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                    <CheckCircle2 size={14} style={{ color: "var(--green)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{step}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ width: "100%", fontSize: 13, justifyContent: "center" }} onClick={() => { setSignupPending(false); setAuthMode("login"); setAuthOpen(true); }}>
                Go to Sign In →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}