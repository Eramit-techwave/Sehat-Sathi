import { useState, useEffect } from "react";
import {
  Calendar, FileText, Pill, Bell, Stethoscope,
  FlaskConical, ChevronDown, ChevronUp, Loader2,
  CheckCircle2, AlertCircle, Clock, Activity
} from "lucide-react";

import { API_BASE } from "../../api/client";

const C = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  primary: "#1A73E8",
  primaryLight: "rgba(26,115,232,0.08)",
  green: "#00A651",
  greenLight: "rgba(0,166,81,0.08)",
  amber: "#F59E0B",
  amberLight: "rgba(245,158,11,0.08)",
  red: "#EF4444",
  redLight: "rgba(239,68,68,0.08)",
  purple: "#8B5CF6",
  purpleLight: "rgba(139,92,246,0.08)",
  cyan: "#0EA5E9",
  cyanLight: "rgba(14,165,233,0.08)",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
};

const EVENT_CONFIG = {
  appointment: {
    icon: Calendar,
    color: C.primary,
    light: C.primaryLight,
    label: "Appointment",
  },
  report: {
    icon: FileText,
    color: C.purple,
    light: C.purpleLight,
    label: "Medical Report",
  },
  prescription: {
    icon: Pill,
    color: C.green,
    light: C.greenLight,
    label: "Prescription",
  },
  followup: {
    icon: Bell,
    color: C.amber,
    light: C.amberLight,
    label: "Follow-up",
  },
};

function EventCard({ event }) {
  const [expanded, setExpanded] = useState(false);
  const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.appointment;
  const Icon = config.icon;

  const isOverdue = event.metadata?.is_overdue;

  const statusColors = {
    Pending: { bg: C.amberLight, color: C.amber },
    Confirmed: { bg: C.primaryLight, color: C.primary },
    Completed: { bg: C.greenLight, color: C.green },
    Cancelled: { bg: C.redLight, color: C.red },
    Uploaded: { bg: C.purpleLight, color: C.purple },
    Finalized: { bg: C.greenLight, color: C.green },
    Draft: { bg: C.amberLight, color: C.amber },
    completed: { bg: C.greenLight, color: C.green },
    pending: { bg: C.amberLight, color: C.amber },
    missed: { bg: C.redLight, color: C.red },
  };

  const statusStyle = statusColors[event.status] || { bg: C.primaryLight, color: C.primary };

  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 4 }}>
      {/* Timeline connector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: config.light, border: `2px solid ${config.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0
        }}>
          <Icon size={18} color={config.color} />
        </div>
      </div>

      {/* Event card */}
      <div style={{
        flex: 1, background: C.surface,
        border: `1px solid ${isOverdue ? C.red : C.border}`,
        borderLeft: `3px solid ${isOverdue ? C.red : config.color}`,
        borderRadius: 12, padding: "14px 18px",
        marginBottom: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            {/* Type badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                background: config.light, color: config.color,
                borderRadius: 5, padding: "2px 7px"
              }}>
                {config.label.toUpperCase()}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600,
                background: statusStyle.bg, color: statusStyle.color,
                borderRadius: 5, padding: "2px 7px"
              }}>
                {event.status}
              </span>
              {isOverdue && (
                <span style={{ fontSize: 10, fontWeight: 700, background: C.redLight, color: C.red, borderRadius: 5, padding: "2px 7px" }}>
                  OVERDUE
                </span>
              )}
            </div>

            {/* Title */}
            <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>
              {event.title}
            </div>

            {/* Subtitle */}
            {event.subtitle && (
              <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 6 }}>
                {event.subtitle}
              </div>
            )}

            {/* Date */}
            <div style={{ fontSize: 11, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={11} />
              {event.date}{event.time ? ` at ${event.time}` : ""}
              {event.doctor_name && ` • Dr. ${event.doctor_name}`}
            </div>
          </div>

          {/* Expand toggle if has metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: C.textMuted }}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        {/* Expanded metadata */}
        {expanded && event.metadata && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
            {/* Prescription medicines */}
            {event.event_type === "prescription" && event.metadata.medicine_count > 0 && (
              <div style={{ fontSize: 12, color: C.textSecondary }}>
                💊 {event.metadata.medicine_count} medicine(s) prescribed
                {event.metadata.diagnosis && ` for ${event.metadata.diagnosis}`}
                {event.metadata.follow_up_date && (
                  <span style={{ display: "block", marginTop: 4, color: C.amber }}>
                    📅 Follow-up: {event.metadata.follow_up_date}
                  </span>
                )}
              </div>
            )}

            {/* Appointment details */}
            {event.event_type === "appointment" && (
              <div style={{ fontSize: 12, color: C.textSecondary }}>
                {event.metadata.reason && <div>Reason: {event.metadata.reason}</div>}
                {event.metadata.time_slot && <div>Slot: {event.metadata.time_slot}</div>}
              </div>
            )}

            {/* Follow-up details */}
            {event.event_type === "followup" && (
              <div style={{ fontSize: 12, color: C.textSecondary }}>
                Type: {event.metadata.type}
                {event.metadata.due_time && <span> at {event.metadata.due_time}</span>}
              </div>
            )}

            {/* Report details */}
            {event.event_type === "report" && (
              <div style={{ fontSize: 12, color: C.textSecondary }}>
                {event.metadata.report_type && <div>Type: {event.metadata.report_type}</div>}
                {event.metadata.has_analysis && <div style={{ color: C.green }}>✓ AI Analysis Available</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function YearGroup({ year, events }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
          cursor: "pointer", userSelect: "none"
        }}
      >
        <div style={{ height: 1, flex: 1, background: C.border }} />
        <span style={{
          fontSize: 12, fontWeight: 700, color: C.textSecondary,
          background: C.bg, padding: "4px 14px",
          border: `1px solid ${C.border}`, borderRadius: 20,
          display: "flex", alignItems: "center", gap: 6
        }}>
          {year} · {events.length} events
          {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </span>
        <div style={{ height: 1, flex: 1, background: C.border }} />
      </div>
      {!collapsed && (
        <div>
          {events.map(ev => <EventCard key={ev.event_id} event={ev} />)}
        </div>
      )}
    </div>
  );
}

export default function WorkflowTimeline({ user }) {
  const token = localStorage.getItem("sehat_sathi_token");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({ total: 0 });
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const loadTimeline = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/timeline/my`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load timeline");
      const data = await res.json();
      setEvents(data.events || []);
      setSummary({ total: data.total_events || 0 });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { loadTimeline(); }, []);

  const EVENT_TYPES = ["all", "appointment", "report", "prescription", "followup"];

  const filteredEvents = filter === "all"
    ? events
    : events.filter(ev => ev.event_type === filter);

  // Group by year
  const groupedByYear = {};
  for (const ev of filteredEvents) {
    const year = (ev.date || "").slice(0, 4) || "Unknown";
    if (!groupedByYear[year]) groupedByYear[year] = [];
    groupedByYear[year].push(ev);
  }
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b.localeCompare(a));

  // Summary counts
  const counts = {
    appointment: events.filter(e => e.event_type === "appointment").length,
    report: events.filter(e => e.event_type === "report").length,
    prescription: events.filter(e => e.event_type === "prescription").length,
    followup: events.filter(e => e.event_type === "followup").length,
  };

  return (
    <div style={{ background: C.bg, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.cyanLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={18} color={C.cyan} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.textPrimary }}>Your Health Journey</h2>
              <p style={{ margin: 0, fontSize: 12, color: C.textSecondary }}>Complete chronological medical timeline</p>
            </div>
          </div>
          <button onClick={loadTimeline} style={{
            padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: C.surface, color: C.textSecondary, fontSize: 12, fontWeight: 600, cursor: "pointer"
          }}>
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 20 }}>
          {[
            { key: "appointment", label: "Appointments", color: C.primary, light: C.primaryLight },
            { key: "report", label: "Reports", color: C.purple, light: C.purpleLight },
            { key: "prescription", label: "Prescriptions", color: C.green, light: C.greenLight },
            { key: "followup", label: "Follow-ups", color: C.amber, light: C.amberLight },
          ].map(({ key, label, color, light }) => (
            <div key={key} style={{ background: light, border: `1px solid ${color}20`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{counts[key]}</div>
              <div style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 28px" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {EVENT_TYPES.map(type => {
            const config = EVENT_CONFIG[type];
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  padding: "7px 16px", borderRadius: 20,
                  border: filter === type
                    ? `1px solid ${config?.color || C.primary}`
                    : `1px solid ${C.border}`,
                  background: filter === type
                    ? (config?.light || C.primaryLight)
                    : C.surface,
                  color: filter === type
                    ? (config?.color || C.primary)
                    : C.textSecondary,
                  fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}
              >
                {type === "all" ? `All Events (${summary.total})` : config?.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: C.textMuted }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite", marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Loading your health timeline...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 60, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}` }}>
            <AlertCircle size={32} color={C.red} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: C.red, fontWeight: 600 }}>Failed to load timeline</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>{error}</div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}` }}>
            <Activity size={40} color={C.textMuted} style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: C.textSecondary, marginBottom: 6 }}>
              {filter === "all" ? "Your health journey starts here" : `No ${filter}s found`}
            </div>
            <div style={{ fontSize: 13, color: C.textMuted }}>
              {filter === "all"
                ? "Book appointments, upload reports, and receive prescriptions to see your timeline."
                : `Switch filter to see all events.`}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            {sortedYears.map(year => (
              <YearGroup key={year} year={year} events={groupedByYear[year]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
