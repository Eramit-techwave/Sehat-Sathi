import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, FileText, Clock, Search, AlertCircle, Loader2, ChevronRight, Pill } from "lucide-react";
import FloatingNotification from "../../components/FloatingNotification";

import { API_BASE } from "../../api/client";

// V2 Clean Healthcare Theme Tokens
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
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
};

const FREQUENCIES = [
  "Once a day", "Twice a day", "Three times a day",
  "Every 8 hours", "Every 12 hours", "Before meals",
  "After meals", "At bedtime", "As needed"
];

const DURATIONS = [
  "3 days", "5 days", "7 days", "10 days", "14 days",
  "1 month", "3 months", "6 months", "Ongoing", "As directed"
];

const EMPTY_MEDICINE = {
  name: "", dosage: "", frequency: "Twice a day", duration: "7 days", instructions: ""
};

export default function PrescriptionPad({ user }) {
  const token = localStorage.getItem("sehat_sathi_token");
  const authHeaders = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

  // ── VIEWS: "write" | "history" | "detail"
  const [view, setView] = useState("write");
  const [issuedList, setIssuedList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "success", text: "" });

  // Patients the doctor has seen (for quick select)
  const [myPatients, setMyPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");

  // Prescription form state
  const [form, setForm] = useState({
    patient_id: "",
    patient_name: "",
    diagnosis: "",
    medicines: [{ ...EMPTY_MEDICINE }],
    notes: "",
    follow_up_date: "",
  });

  const showNotif = (text, type = "success") => {
    setNotification({ show: true, type, text });
    setTimeout(() => setNotification({ show: false, type, text: "" }), 4000);
  };

  useEffect(() => {
    loadPatients();
    if (view === "history") loadIssuedPrescriptions();
  }, [view]);

  const loadPatients = async () => {
    try {
      const res = await fetch(`${API_BASE}/doctors/${user?.id}/patients`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setMyPatients(await res.json());
    } catch (e) { console.error(e); }
  };

  const loadIssuedPrescriptions = async () => {
    setListLoading(true);
    try {
      const res = await fetch(`${API_BASE}/prescriptions/my`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setIssuedList(await res.json());
    } catch (e) { console.error(e); }
    finally { setListLoading(false); }
  };

  const addMedicine = () => {
    setForm(f => ({ ...f, medicines: [...f.medicines, { ...EMPTY_MEDICINE }] }));
  };

  const removeMedicine = (idx) => {
    if (form.medicines.length === 1) return;
    setForm(f => ({ ...f, medicines: f.medicines.filter((_, i) => i !== idx) }));
  };

  const updateMedicine = (idx, field, value) => {
    setForm(f => {
      const meds = [...f.medicines];
      meds[idx] = { ...meds[idx], [field]: value };
      return { ...f, medicines: meds };
    });
  };

  const selectPatient = (p) => {
    setForm(f => ({ ...f, patient_id: p.id, patient_name: p.name }));
    setPatientSearch("");
  };

  const handleSave = async (status) => {
    if (!form.patient_id) return showNotif("Please select a patient", "error");
    if (!form.diagnosis.trim()) return showNotif("Diagnosis is required", "error");
    if (form.medicines.some(m => !m.name.trim())) return showNotif("All medicine names are required", "error");

    setSaving(true);
    try {
      const payload = { ...form, status };
      delete payload.patient_name; // not a schema field

      const res = await fetch(`${API_BASE}/prescriptions/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to save prescription");

      showNotif(status === "finalized"
        ? "Prescription finalized & patient notified! 💊"
        : "Draft saved successfully");

      // Reset form
      setForm({ patient_id: "", patient_name: "", diagnosis: "", medicines: [{ ...EMPTY_MEDICINE }], notes: "", follow_up_date: "" });

      if (status === "finalized") setTimeout(() => { setView("history"); }, 1200);
    } catch (e) {
      showNotif(e.message, "error");
    }
    setSaving(false);
  };

  const handleFinalize = async (rx) => {
    try {
      const res = await fetch(`${API_BASE}/prescriptions/${rx.id}/finalize`, {
        method: "PUT", headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      showNotif("Prescription finalized & patient notified!");
      loadIssuedPrescriptions();
    } catch (e) { showNotif(e.message, "error"); }
  };

  const filteredPatients = myPatients.filter(p =>
    p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.email?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // Shared input style for V2 theme
  const inp = {
    width: "100%", background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "10px 12px", color: C.textPrimary,
    fontSize: 13, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit"
  };

  return (
    <div style={{ background: C.bg, minHeight: "100%", padding: "0 0 40px" }}>
      <FloatingNotification show={notification.show} type={notification.type} text={notification.text} />

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "20px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Pill size={18} color={C.primary} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.textPrimary }}>Prescription Pad</h2>
                <p style={{ margin: 0, fontSize: 12, color: C.textSecondary }}>Digital prescriptions — no paper needed</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["write", "history"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "8px 18px", borderRadius: 8,
                background: view === v ? C.primary : "transparent",
                color: view === v ? "#fff" : C.textSecondary,
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                border: view === v ? "none" : `1px solid ${C.border}`
              }}>
                {v === "write" ? "New Prescription" : "Issued"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 28px" }}>
        {/* ─── WRITE VIEW ─────────────────────────────────────────── */}
        {view === "write" && (
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            {/* Patient Selection */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.textPrimary }}>
                👤 Select Patient
              </h3>
              {form.patient_id ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.primaryLight, border: `1px solid ${C.primary}`, borderRadius: 10, padding: "12px 16px" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.primary }}>
                    ✓ {form.patient_name}
                  </span>
                  <button onClick={() => setForm(f => ({ ...f, patient_id: "", patient_name: "" }))} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, fontSize: 12 }}>
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ position: "relative", marginBottom: 12 }}>
                    <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
                    <input
                      style={{ ...inp, paddingLeft: 36 }}
                      placeholder="Search your patients by name..."
                      value={patientSearch}
                      onChange={e => setPatientSearch(e.target.value)}
                    />
                  </div>
                  {patientSearch && (
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", maxHeight: 220, overflowY: "auto" }}>
                      {filteredPatients.length === 0 ? (
                        <div style={{ padding: 20, textAlign: "center", color: C.textMuted, fontSize: 13 }}>No patients found</div>
                      ) : filteredPatients.map(p => (
                        <div key={p.id} onClick={() => selectPatient(p)} style={{
                          padding: "12px 16px", cursor: "pointer", borderBottom: `1px solid ${C.border}`,
                          display: "flex", alignItems: "center", justifyContent: "space-between"
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = C.bg}
                          onMouseLeave={e => e.currentTarget.style.background = C.surface}
                        >
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: C.textMuted }}>{p.email}</div>
                          </div>
                          <ChevronRight size={14} color={C.textMuted} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Diagnosis */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: C.textPrimary }}>🩺 Diagnosis</h3>
              <input
                style={inp}
                placeholder="Primary diagnosis e.g. 'Acute Upper Respiratory Tract Infection'"
                value={form.diagnosis}
                onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
              />
            </div>

            {/* Medicines */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textPrimary }}>💊 Medicines</h3>
                <button onClick={addMedicine} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: C.primaryLight, border: `1px solid ${C.primary}`,
                  color: C.primary, borderRadius: 8, padding: "7px 14px",
                  fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}>
                  <Plus size={13} /> Add Medicine
                </button>
              </div>

              {form.medicines.map((med, idx) => (
                <div key={idx} style={{
                  background: C.bg, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: 16, marginBottom: 12
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.textSecondary, letterSpacing: "0.05em" }}>
                      MEDICINE {idx + 1}
                    </span>
                    {form.medicines.length > 1 && (
                      <button onClick={() => removeMedicine(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: C.red }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 4 }}>Medicine Name *</label>
                      <input style={inp} placeholder="e.g. Paracetamol" value={med.name} onChange={e => updateMedicine(idx, "name", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 4 }}>Dosage *</label>
                      <input style={inp} placeholder="e.g. 500mg, 10ml" value={med.dosage} onChange={e => updateMedicine(idx, "dosage", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 4 }}>Frequency *</label>
                      <select style={{ ...inp, cursor: "pointer" }} value={med.frequency} onChange={e => updateMedicine(idx, "frequency", e.target.value)}>
                        {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 4 }}>Duration *</label>
                      <select style={{ ...inp, cursor: "pointer" }} value={med.duration} onChange={e => updateMedicine(idx, "duration", e.target.value)}>
                        {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 4 }}>Special Instructions</label>
                    <input style={inp} placeholder="e.g. Take after meals, avoid dairy" value={med.instructions} onChange={e => updateMedicine(idx, "instructions", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Notes & Follow-up */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.textPrimary }}>📝 Notes & Follow-up</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6 }}>Clinical Notes</label>
                  <textarea
                    style={{ ...inp, minHeight: 80, resize: "vertical" }}
                    placeholder="Additional clinical notes, instructions for patient..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, display: "block", marginBottom: 6 }}>Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    style={inp}
                    min={new Date().toISOString().split("T")[0]}
                    value={form.follow_up_date}
                    onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))}
                  />
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: C.textMuted }}>
                    Recommended date for review visit
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => handleSave("draft")} disabled={saving} style={{
                padding: "12px 24px", borderRadius: 10, border: `1px solid ${C.border}`,
                background: C.surface, color: C.textSecondary,
                fontWeight: 600, fontSize: 14, cursor: "pointer"
              }}>
                {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Save Draft"}
              </button>
              <button onClick={() => handleSave("finalized")} disabled={saving} style={{
                padding: "12px 28px", borderRadius: 10, border: "none",
                background: C.primary, color: "#fff",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(26,115,232,0.25)"
              }}>
                {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <><CheckCircle2 size={16} /> Finalize & Send to Patient</>}
              </button>
            </div>
          </div>
        )}

        {/* ─── HISTORY VIEW ────────────────────────────────────────── */}
        {view === "history" && (
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            {listLoading ? (
              <div style={{ textAlign: "center", padding: 60, color: C.textMuted }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : issuedList.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: C.surface, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <FileText size={40} color={C.textMuted} style={{ marginBottom: 12 }} />
                <p style={{ color: C.textSecondary, margin: 0, fontWeight: 600 }}>No prescriptions issued yet</p>
                <p style={{ color: C.textMuted, fontSize: 13, marginTop: 6 }}>Create your first prescription using the Prescription Pad</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {issuedList.map(rx => (
                  <div key={rx.id} style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 14, padding: 20,
                    borderLeft: `4px solid ${rx.status === "finalized" ? C.green : C.amber}`
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>{rx.diagnosis}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                            background: rx.status === "finalized" ? C.greenLight : C.amberLight,
                            color: rx.status === "finalized" ? C.green : C.amber,
                            border: `1px solid ${rx.status === "finalized" ? C.green : C.amber}`,
                            borderRadius: 6, padding: "2px 8px"
                          }}>
                            {rx.status?.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 4 }}>
                          Patient: <strong style={{ color: C.textPrimary }}>{rx.patient_name}</strong>
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>
                          {rx.medicines?.length || 0} medicine(s) • {rx.created_at?.slice(0, 10)}
                          {rx.follow_up_date && ` • Follow-up: ${rx.follow_up_date}`}
                        </div>
                        {rx.medicines?.length > 0 && (
                          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {rx.medicines.slice(0, 4).map((m, i) => (
                              <span key={i} style={{
                                fontSize: 11, background: C.primaryLight, color: C.primary,
                                borderRadius: 6, padding: "3px 10px", fontWeight: 500
                              }}>
                                {m.name} {m.dosage}
                              </span>
                            ))}
                            {rx.medicines.length > 4 && (
                              <span style={{ fontSize: 11, color: C.textMuted, padding: "3px 0" }}>+{rx.medicines.length - 4} more</span>
                            )}
                          </div>
                        )}
                      </div>
                      {rx.status === "draft" && (
                        <button onClick={() => handleFinalize(rx)} style={{
                          padding: "8px 16px", borderRadius: 8, border: "none",
                          background: C.green, color: "#fff", fontWeight: 600,
                          fontSize: 12, cursor: "pointer", whiteSpace: "nowrap"
                        }}>
                          Finalize
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
